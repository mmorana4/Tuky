# -*- coding: utf-8 -*-
import os
from datetime import datetime, timedelta, time, date
from django.urls import reverse
from django.contrib.auth.models import AbstractUser
# from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator, EmailValidator
from django.db import models
from django.db.models.query_utils import Q
from django.utils.functional import cached_property
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from security.context_processors import thread_context
from helpers.functions_helper import HelperFunctions
from helpers.choices_helper import HelperChoices
from core.my_model import MyModel



class Company(MyModel):
    ruc = models.CharField(verbose_name='RUC', max_length=20, unique=True)
    name = models.CharField(verbose_name='Nombre', unique=True, max_length=255)
    short_name = models.CharField(verbose_name='Nombre corto', max_length=100)
    website = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Sitio Web'
    )
    address = models.TextField(verbose_name='Dirección', blank=True, null=True)

    PROTECTED_IDS = [1]

    class Meta:
        verbose_name = u"Empresa"
        verbose_name_plural = u"Empresa"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.short_name})"

    @staticmethod
    def flexbox_query(search, extra=None, limit=25, exclude=None):
        conditions = Q(Q(name__icontains=search) | Q(short_name__icontains=search))
        return MyModel.dynamic_flexbox_query(Company, conditions, extra, limit, exclude)

    def flexbox_repr(self, field='name'):
        return super(Company, self).flexbox_repr(field)

    @property
    def is_protected(self):
        return self.pk in self.PROTECTED_IDS

    @classmethod
    def load_compnay(cls, id=1):
        try:
            company_cache = cls.cache(id, 'id')
            first = None
            if company_cache.has_key():
                first = company_cache.get_model_object()
            if not first:
                first = cls.objects.first()
                if first is None:
                    raise NameError("No existen registro de la empresa.")
                company_cache.set_model_object(first)
            return first
        except Exception as ex:
            raise NameError(f"Error al obtener datos: {ex}")

    def delete(self, *args, **kwargs):
        if self.is_protected:
            raise NameError(f"No se puede eliminar la institución protegida: {self.name}")
        super(Company, self).delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        if self.pk:
            if not getattr(thread_context, 'loading_initial_data', False):
                original = Company.objects.filter(pk=self.pk).first()
                if original:
                    if original.pk in self.PROTECTED_IDS and self.pk != original.pk:
                        raise NameError(f"No se puede modificar la institución protegida: {self.name}")
        else:
            if Company.objects.only('id').exists():
                raise NameError("Solo se permite una única institución.")

        super(Company, self).save(*args, **kwargs)


class CompanyBranch(MyModel):
    """
    Sede / campus físico o lógico de la institución.
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        verbose_name='Empresa',
        related_name='branches'
    )
    name = models.CharField(
        max_length=150,
        verbose_name='Nombre'
    )
    short_name = models.CharField(
        max_length=100,
        verbose_name='Nombre corto',
        help_text='Identificador único corto para la sede'
    )
    address = models.TextField(
        verbose_name='Dirección',
        blank=True,
        null=True
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Teléfono'
    )
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name='Correo',
        validators=[EmailValidator(message='Correo electrónico inválido')]
    )
    is_main = models.BooleanField(default=False, verbose_name='¿Es principal?')
    is_current = models.BooleanField(default=True, verbose_name='¿Vigente?')

    PROTECTED_IDS = [1]

    class Meta:
        verbose_name = u"Sede"
        verbose_name_plural = u"Sedes"
        ordering = ['company', 'name']
        unique_together = ('company', 'name',)
        indexes = [
            models.Index(fields=['company', 'is_current']),
            models.Index(fields=['is_main', 'is_current']),
        ]

    def __str__(self):
        return f"{self.name} ({self.company.name})"

    @staticmethod
    def flexbox_query(search, extra=None, limit=25, exclude=None):
        conditions = Q(Q(name__icontains=search) | Q(short_name__icontains=search))
        return MyModel.dynamic_flexbox_query(CompanyBranch, conditions, extra, limit, exclude)

    def flexbox_repr(self, field='name'):
        return super(CompanyBranch, self).flexbox_repr(field)

    @property
    def full_name(self):
        """Nombre completo incluyendo la empresa"""
        return f"{self.company.name} - {self.name}"

    @classmethod
    def branch_main(cls, company=None):
        """Obtener sede principal, opcionalmente filtrada por empresa"""
        queryset = cls.objects.filter(
            is_main=True,
            is_current=True,
            is_active=True,
            company__is_active=True
        )

        if company:
            queryset = queryset.filter(company=company)

        return queryset.first()

    @property
    def is_protected(self):
        return self.pk in self.PROTECTED_IDS

    @classmethod
    def get_current_branches(cls, company=None):
        """Obtener todas las sedes vigentes, opcionalmente filtradas por empresa"""
        queryset = cls.objects.filter(is_current=True, is_active=True)

        if company:
            queryset = queryset.filter(company=company)

        return queryset

    def deactivate(self):
        """Desactivar la sede y sus horarios"""
        self.is_current = False
        self.save()

        # Desactivar todos los horarios asociados
        self.schedules.update(is_current=False)

    def clean(self, *args, **kwargs):
        if self.is_main and CompanyBranch.objects.only("id").filter(company=self.company, is_main=True).exclude(
                pk=self.pk).exists():
            raise NameError("Ya existe una sede principal.")
        super(CompanyBranch, self).clean()

    def delete(self, *args, **kwargs):
        if self.is_protected:
            raise NameError(f"No se puede eliminar la sede protegida: {self.name}")

        super(CompanyBranch, self).delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        self.full_clean()
        super(CompanyBranch, self).save(*args, **kwargs)


# class AuthMethod(MyModel):
#     """Modelo para almacenar la configuración de autenticación"""
#
#     method = models.CharField(
#         max_length=10,
#         choices=HelperChoices.AuthMethods.choices,
#         default=HelperChoices.AuthMethods.JWT,
#         verbose_name="Método"
#     )
#     is_current = models.BooleanField(default=True, verbose_name='Vigente?')
#
#     PROTECTED_IDS = [1]
#
#     class Meta:
#         verbose_name = 'Método de autenticación'
#         verbose_name_plural = 'Métodos de autenticación'
#
#     def __str__(self):
#         return f"{self.get_method_display()} ({'Activo' if self.is_current else 'Inactivo'})"
#
#     @property
#     def is_protected(self):
#         return self.pk in self.PROTECTED_IDS
#
#     @classmethod
#     def load_auth_method(cls, id=1):
#         try:
#             auth_method_cache = cls.cache(id, 'id')
#             first = None
#             if auth_method_cache.has_key():
#                 first = auth_method_cache.get_model_object()
#             if not first:
#                 first = cls.objects.first()
#                 if first is None:
#                     raise NameError("No existen registro de método de autenticación.")
#                 auth_method_cache.set_model_object(first)
#             return first
#         except Exception as ex:
#             raise NameError(f"Error al obtener datos: {ex}")
#
#     def delete(self, *args, **kwargs):
#         if self.is_protected:
#             raise NameError(f"No se puede eliminar el método de autenticación protegido: {self.get_method_display()}")
#         super(AuthMethod, self).delete(*args, **kwargs)
#
#     def save(self, *args, **kwargs):
#         if self.pk:
#             if not getattr(thread_context, 'loading_initial_data', False):
#                 original = AuthMethod.objects.filter(pk=self.pk).first()
#                 if original:
#                     if original.pk in self.PROTECTED_IDS and self.pk != original.pk:
#                         raise NameError(f"No se puede modificar el método de autenticación protegido: {self.get_method_display()}")
#         else:
#             if AuthMethod.objects.only('id').exists():
#                 raise NameError("Solo se permite un método de autenticación.")
#
#         super(AuthMethod, self).save(*args, **kwargs)


class Permission(MyModel):
    code = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        verbose_name='Código',
        error_messages={'unique': _("El código debe ser único")}
    )
    name = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        verbose_name='Nombre',
        error_messages={'unique': _("El nombre debe ser único")}
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción'
    )
    is_current = models.BooleanField(
        default=True,
        verbose_name='¿Vigente?'
    )

    # Permisos protegidos del sistema
    # PROTECTED_CODES = ['can_access', 'can_view', 'can_add', 'can_edit', 'can_delete']

    class Meta:
        verbose_name = u"Permiso"
        verbose_name_plural = u"Permisos"
        ordering = ['name']
        indexes = [
            models.Index(fields=['code', 'is_current']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

    @staticmethod
    def flexbox_query(search, extra=None, limit=25, exclude=None):
        conditions = Q(Q(name__icontains=search) | Q(code__icontains=search))
        return MyModel.dynamic_flexbox_query(Permission, conditions, extra, limit, exclude)

    def flexbox_repr(self, field='name'):
        return f"{self.name} [{self.code}]"

    def flexbox_alias(self):
        return {
            # 'type': {'value': self.type, 'label': self.get_type_display()},
            'name': self.name,
            'code': self.code
        }

    @classmethod
    def get_permission(cls, code):
        return cls.objects.filter(is_current=True, code__exact=code).first()

    def clean(self):
        """Validaciones del modelo"""
        super(Permission, self).clean()

        # Limpieza de campos
        self.name = self.name.strip() if self.name else ""
        self.code = self.code.strip().lower() if self.code else ""

        # Validar formato del code (solo letras, números y guiones bajos)
        if self.code and not all(c.isalnum() or c == '_' for c in self.code):
            raise NameError(_("El código solo puede contener letras, números y guiones bajos"))

    def save(self, *args, **kwargs):
        """Guardado con validaciones"""
        self.full_clean()
        super(Permission, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        super(Permission, self).delete(*args, **kwargs)


class Role(MyModel):
    """
    Rol. Ej: "Sistema", "Administrador", "Profesor".
    """
    route = models.CharField(
        choices=HelperChoices.RoleRoutes.choices,
        default=HelperChoices.RoleRoutes.ADMIN,
        max_length=20,
        db_index=True,
        verbose_name="Ruta",
    )
    code = models.CharField(
        max_length=50,
        db_index=True,
        blank=True,
        unique=True,
        verbose_name="Código",
        error_messages={'unique': _("El código debe ser único")},
        help_text=_("Identificador único del rol. Se genera automáticamente si se deja vacío.")
    )
    name = models.CharField(
        max_length=150,
        unique=True,
        verbose_name='Nombre',
        error_messages={'unique': _("El nombre debe ser único")}
    )
    legend = models.CharField(
        verbose_name='Leyenda',
        max_length=100,
        help_text=_("Leyenda del rol (ej: 'Supervisión y control')")
    )
    is_current = models.BooleanField(
        default=True,
        verbose_name='¿Vigente?',
        help_text=_("Indica si el rol está vigente y disponible para asignación")
    )
    is_system = models.BooleanField(
        default=False,
        verbose_name='¿Es del sistema?',
        help_text=_("Indica si es un rol predeterminado del sistema que no puede modificarse")
    )
    level_authority = models.CharField(
        choices=HelperChoices.RoleLevelAuthorities.choices,
        default=HelperChoices.RoleLevelAuthorities.HIGH,
        max_length=20,
        verbose_name='Nivel de autoridad'
    )
    weight = models.IntegerField(
        default=0,
        verbose_name="Peso/Prioridad",
        help_text=_("Valor numérico para ordenar roles por importancia (mayor = más importante)"),
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    branches = models.ManyToManyField(CompanyBranch, blank=True, verbose_name="Sedes")

    # Roles protegidos del sistema
    PROTECTED_CODES = ['ADMIN', 'TEACHER', 'STUDENT']
    PROTECTED_NAMES = ['Admin', 'Profesor', 'Estudiante']

    class Meta:
        verbose_name = "Rol"
        verbose_name_plural = "Roles"
        ordering = ['-weight', 'name']
        indexes = [
            models.Index(fields=['code', 'is_current']),
            models.Index(fields=['is_system', 'is_current']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

    @staticmethod
    def flexbox_query(search, extra=None, limit=25, exclude=None):
        """Búsqueda mejorada para flexbox"""
        conditions = Q(
            Q(name__icontains=search) |
            Q(code__icontains=search)
        )
        if extra:
            conditions &= extra

        # Excluir roles específicos si se solicita
        if exclude:
            if isinstance(exclude, (list, tuple)):
                conditions &= ~Q(pk__in=exclude)
            else:
                conditions &= ~Q(pk=exclude)

        return MyModel.dynamic_flexbox_query(Role, conditions, extra, limit, exclude)

    def flexbox_repr(self, field='name'):
        """Representación mejorada para flexbox"""
        return f"{self.name} [{self.code}]"

    def flexbox_alias(self):
        """Metadatos adicionales para flexbox"""
        return {
            'code': self.code,
            'route': self.route,
            'name': self.name,
            'legend': self.legend,
            'is_current': self.is_current,
            'is_system': self.is_system
        }

    @cached_property
    def is_protected(self):
        """Determina si el rol está protegido"""
        return self.code in self.PROTECTED_CODES or self.name in self.PROTECTED_NAMES or self.is_system

    @cached_property
    def can_edit(self):
        """Determina si el rol puede editarse"""
        return not self.is_protected

    @cached_property
    def can_delete(self):
        """Determina si el rol puede eliminarse"""
        return not self.is_protected

    @cached_property
    def is_admin_system(self):
        return self.code == 'SYSTEM'

    @cached_property
    def is_administrator(self):
        return self.code == 'ADMINISTRATOR'

    def generate_code(self):
        if not self.code and self.name:
            base_code = slugify(self.name).replace('-', '_').upper()
            self.code = base_code[:50]

        if self.code:
            query = Role.objects.filter(code=self.code)
            if self.pk:
                query = query.exclude(pk=self.pk)
            if query.exists():
                raise NameError("El código debe ser único")

    def clean(self):
        """Validaciones completas del modelo"""
        super(Role, self).clean()

        # Limpieza de campos
        self.name = self.name.strip() if self.name else ""
        self.code = self.code.strip() if self.code else ""

    def save(self, *args, **kwargs):
        if not getattr(thread_context, 'loading_initial_data', False):
            self.generate_code()

        self.full_clean()
        if self.pk:
            if not getattr(thread_context, 'loading_initial_data', False):
                original = Role.objects.filter(pk=self.pk).first()
                if original and (original.code in self.PROTECTED_CODES or
                                 original.name in self.PROTECTED_NAMES):
                    # No permitir cambios en campos protegidos
                    if self.code != original.code:
                        raise NameError(_("No puede modificar el código de un rol protegido"))

        super(Role, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Eliminación con validaciones de protección"""
        if self.is_protected:
            raise NameError(_("No puede eliminar un rol protegido del sistema"))
        super(Role, self).delete(*args, **kwargs)


class Module(MyModel):
    code = models.CharField(max_length=100, verbose_name='Código', db_index=True, unique=True,
                            error_messages={'unique': _("Código debe ser único"), },
                            help_text='Código de verificación de autorización')
    name = models.CharField(max_length=100, verbose_name='Nombre', db_index=True)
    path = models.CharField(max_length=255, verbose_name='URL/Ruta', db_index=True, unique=True,
                            error_messages={'unique': _("URL debe ser único"), },
                            help_text='Nombre de la URL Django')
    # icon = models.CharField(max_length=50, verbose_name='Icono', help_text='Icono de fontawesome ej: (fas fa-tags)')
    is_current = models.BooleanField(default=True, verbose_name='¿Vigente?')
    permissions = models.ManyToManyField(
        Permission,
        blank=True,
        verbose_name='Permisos'
    )

    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = u"Módulo"
        verbose_name_plural = u"Módulos"
        ordering = ['name']

    @staticmethod
    def flexbox_query(search, extra=None, limit=25, exclude=None):
        conditions = Q(Q(name__icontains=search) |
                       Q(code__icontains=search) |
                       Q(path__icontains=search))
        return MyModel.dynamic_flexbox_query(Module, conditions, extra, limit, exclude)

    def flexbox_repr(self, field='full_name'):
        return super(Module, self).flexbox_repr(field)

    def flexbox_alias(self):
        return {'name': self.name, 'code': self.code, 'path': self.path}

    @property
    def full_name(self):
        return u'%s (%s)' % (self.name, self.code)

    def get_modulepage(self):
        try:
            return self.modulepage
        except ModulePage.DoesNotExist:
            return None

    def get_moduletable(self):
        try:
            return self.moduletable
        except ModuleTable.DoesNotExist:
            return None

    @property
    def permission_codes(self):
        return [perm.code for perm in self.permissions.filter(is_current=True)]

    @property
    def can_edit(self):
        return True

    @property
    def can_delete(self):
        if self.menuitem_set.exists():
            return False
        return True

    def delete(self, *args, **kwargs):
        super(Module, self).delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        self.name = self.name.strip()
        self.path = self.path.strip()
        self.code = self.code.strip()
        super(Module, self).save(*args, **kwargs)


class ModulePage(MyModel):
    module = models.OneToOneField(Module, on_delete=models.CASCADE)
    title = models.CharField(default='', max_length=150, verbose_name=u'Titulo')
    subtitle = models.CharField(default='', max_length=150, verbose_name=u'SubTitulo', null=True, blank=True)

    def __str__(self):
        return u'%s - %s' % (self.module.name, self.title)

    class Meta:
        verbose_name = u"Módulo - Página"
        verbose_name_plural = u"Módulos - Página"
        ordering = ['title']

    def delete(self, *args, **kwargs):
        super(ModulePage, self).delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        super(ModulePage, self).save(*args, **kwargs)


class ModuleTable(MyModel):
    module = models.OneToOneField(Module, on_delete=models.CASCADE)
    title = models.CharField(default='', max_length=150, verbose_name=u'Titulo')
    subtitle = models.CharField(default='', max_length=150, verbose_name=u'SubTitulo', null=True, blank=True)

    def __str__(self):
        return u'%s - %s' % (self.module.name, self.title)

    class Meta:
        verbose_name = u"Módulo - Tabla"
        verbose_name_plural = u"Módulos - Tabla"
        ordering = ['title']

    def delete(self, *args, **kwargs):
        super(ModuleTable, self).delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        super(ModuleTable, self).save(*args, **kwargs)


class User(AbstractUser, MyModel):
    groups = None
    user_permissions = None

    type_document = models.IntegerField(
        choices=HelperChoices.TypesDocument.choices,
        default=HelperChoices.TypesDocument.CI,
        verbose_name="Tipo de Documento"
    )
    document = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Documento",
        error_messages={"unique": _("Documento debe ser único")}
    )
    email = models.EmailField(unique=True, verbose_name='Email')
    # phone_number = models.CharField(max_length=20, null=True, blank=True, verbose_name="Número de teléfono")
    username = models.CharField(max_length=150, unique=True, verbose_name="Nombre de usuario")
    first_name = models.CharField(
        verbose_name="Nombres",
        max_length=150
    )
    last_name = models.CharField(
        verbose_name="Apellidos",
        max_length=150
    )

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["type_document", "document", "first_name", "last_name", "email"]

    def __str__(self):
        return self.get_full_name()

    class Meta:
        verbose_name = u"Usuario"
        verbose_name_plural = u"Usuarios"
        ordering = ["first_name", "last_name"]
        # unique_together = ('document',)

    @staticmethod
    def flexbox_query(search, extra=None, limit=25, exclude=None):
        if ' ' in search:
            s = search.split(" ")
            conditions = Q((Q(first_name__icontains=s[0]) & Q(last_name__icontains=s[1])) |
                           (Q(last_name__icontains=s[0]) & Q(first_name__icontains=s[1])) |
                           (Q(first_name__icontains=s[0] + ' ' + s[1])))
        else:
            conditions = Q(Q(names__icontains=search) | Q(first_name__icontains=search) |
                           Q(last_name__icontains=search) | Q(document__icontains=search))
        return MyModel.dynamic_flexbox_query(User, conditions, extra=extra, limit=limit, exclude=exclude)

    def flexbox_repr(self, field='get_full_name'):
        if callable(getattr(self, field, None)):
            field_value = getattr(self, field)()
        else:
            field_value = getattr(self, field, None)
        if field_value is None:
            raise NameError(u'Field or method not found or has no value')
        return u'%s' % field_value

    @property
    def is_protected(self):
        if self.document in ['0999999999']:
            return True
        elif self.is_superuser:
            return True
        return False

    @cached_property
    def my_branches(self):
        profiles = self.profiles.filter()
        return CompanyBranch.objects.filter(is_active=True, pk__in=profiles.values_list('branch__id', flat=True))

    @cached_property
    def my_branches_current(self):
        profiles = self.profiles.filter(is_active=True, is_current=True)
        return CompanyBranch.objects.filter(is_active=True, pk__in=profiles.values_list('branch__id', flat=True))

    @cached_property
    def my_roles(self):
        profiles = self.profiles.filter()
        return Role.objects.filter(is_active=True, pk__in=profiles.values_list('role__id', flat=True))

    @cached_property
    def my_roles_current(self):
        profiles = self.profiles.filter(is_active=True, is_current=True)
        return Role.objects.filter(is_active=True, pk__in=profiles.values_list('role__id', flat=True))

    def clean(self):
        super(User, self).clean()
        self.first_name = self.first_name.strip()
        self.first_name = self.first_name.strip()
        if self.last_name:
            self.last_name = self.last_name.strip()
        self.document = self.document.strip()

    def save(self, *args, **kwargs):
        self.full_clean()
        super(User, self).save(*args, **kwargs)


class UserProvider(MyModel):
    user = models.ForeignKey(User, verbose_name="Usuario", on_delete=models.CASCADE)
    provider = models.CharField(
        max_length=20,
        choices=HelperChoices.AuthProviders.choices,
        verbose_name="Tipo de Provedor"
    )
    token = models.CharField(max_length=255, verbose_name="Token/ID", unique=True)

    # avatar_url = models.URLField(null=True, blank=True, verbose_name="Avatar URL")

    class Meta:
        verbose_name = u"Proveedor Usuario"
        verbose_name_plural = u"Proveedores Usuario"
        unique_together = ('user', 'provider')

    def __str__(self):
        return u'%s - %s' % (self.user.get_full_name(), self.get_provider_display())


class UserSession(MyModel):
    """Modelo para gestionar sesiones de usuario"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="Usuario"
    )
    method = models.CharField(
        max_length=10,
        choices=HelperChoices.AuthMethods.choices,
        verbose_name="Método"
    )
    session_token = models.TextField(verbose_name="Sesión Token")
    refresh_token = models.TextField(null=True, blank=True, verbose_name="Refresh Token")
    expires_at = models.DateTimeField(verbose_name="Fecha/Hora de caducidad")
    is_current = models.BooleanField(default=True, verbose_name="Vigente?")

    class Meta:
        verbose_name = 'Sesión Usuario'
        verbose_name_plural = 'Sesiones Usuario'
        indexes = [
            models.Index(fields=['session_token']),
            models.Index(fields=['user', 'is_current']),
        ]

    def __str__(self):
        return f"Sesión para {self.user.get_full_name()} ({self.get_method_display()})"


class Profile(MyModel):
    """
    Parche N-M entre Usuario y Rol (por sede) con fecha y estado.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profiles', verbose_name='Usuario')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='profile_th', verbose_name='Rol')
    branch = models.ForeignKey(CompanyBranch, on_delete=models.CASCADE, related_name='profile_th', verbose_name='Sede')
    start_date = models.DateField(auto_now_add=True, verbose_name="Fecha de inicio")
    is_current = models.BooleanField(
        default=True,
        verbose_name='¿Vigente?'
    )

    class Meta:
        verbose_name = u"Perfil"
        verbose_name_plural = u"Perfiles"
        unique_together = ("user", "role", "branch")
        indexes = [
            models.Index(fields=['user', 'role']),
            models.Index(fields=['user', 'branch']),
        ]

    def __str__(self):
        return f"{self.user.username} → {self.role.name} ({self.branch.name})"


class ProfileAllowed(MyModel):
    """
    Permisos ad-hoc por usuario y sede (sin tocar roles).
    """
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='alloweds', verbose_name=u"Perfil")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, verbose_name="Módulo")
    permissions = models.ManyToManyField(Permission, blank=True, verbose_name='Permisos')
    start_date = models.DateField(auto_now_add=True, verbose_name=u"Fecha de inicio")
    end_date = models.DateField(null=True, blank=True, verbose_name=u"Fecha fin")
    reason = models.CharField(max_length=255, blank=True, null=True, verbose_name=u"Motivo")
    is_current = models.BooleanField(
        default=True,
        verbose_name='¿Vigente?'
    )

    class Meta:
        verbose_name = u"Perfil - Permiso extra"
        verbose_name_plural = u"Perfil - Permisos extra"
        indexes = [models.Index(fields=['profile', 'module'])]

    def __str__(self):
        return f"Extra {self.profile} @ {self.module}"


class ProfileDenied(MyModel):
    """
    Negación explícita de un permiso para un perfil concreto.
    """
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='denieds', verbose_name=u"Perfil")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, verbose_name="Módulo")
    permissions = models.ManyToManyField(Permission, blank=True, verbose_name='Permisos')
    start_date = models.DateField(auto_now_add=True, verbose_name=u"Fecha de inicio")
    end_date = models.DateField(null=True, blank=True, verbose_name=u"Fecha fin")
    reason = models.CharField(max_length=255, blank=True, null=True, verbose_name=u"Motivo")
    is_current = models.BooleanField(
        default=True,
        verbose_name='¿Vigente?'
    )

    class Meta:
        verbose_name = u"Perfil - Permiso denegar"
        verbose_name_plural = u"Perfil - Permisos denegar"
        indexes = [models.Index(fields=['profile', 'module'])]

    def __str__(self):
        return f"Negación {self.profile} @ {self.module}"


class Menu(MyModel):
    """
    Menús por rol y sede
    """
    branch = models.ForeignKey(
        CompanyBranch,
        on_delete=models.CASCADE,
        verbose_name='Sede'
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        verbose_name='Rol'
    )
    is_current = models.BooleanField(default=True, verbose_name='¿Vigente?')

    class Meta:
        verbose_name = "Menú"
        verbose_name_plural = "Menús"
        unique_together = ['branch', 'role']

    def __str__(self):
        return f"{self.branch.name} - {self.role.name}"

    def get_menu_structure(self, profile=None):
        """
        Devuelve la estructura del menú para el rol/sede.
        - Ítems del menú fijo: pueden ser categorías (con hijos) o sueltos.
        - Ítems extras (ProfileAllowed): siempre sueltos.
        - Respeta ProfileDenied para todos.
        """

        structure = []

        # ---------- 1. Ítems del menú fijo (categorías o sueltos) ----------
        qs_items = self.items.filter(
            parent=None,
            is_active=True,
            is_current=True,
            is_visible=True
        ).select_related('menu').order_by('order')

        for item in qs_items:
            # negación aplicada dentro de can_access
            if profile and not item.can_access(profile):
                continue
            node = self._build_menu_item_data(item, profile)
            structure.append(node)

        # ---------- 2. Ítems extras por ProfileAllowed (sueltos) ----------
        if profile:
            extras = (
                ProfileAllowed.objects
                .filter(profile=profile, is_current=True)
                .select_related('module')
                .prefetch_related('permissions')
                .order_by('module__name')
            )
            for pa in extras:
                mod = pa.module
                # Módulo vigente
                if not (mod.is_current and mod.is_active):
                    continue
                # No duplicar si ya está en el menú fijo
                if self.items.filter(module=mod, is_current=True).exists():
                    continue
                # Negación explícita
                denied = ProfileDenied.objects.filter(
                    profile=profile,
                    module=mod,
                    permission__code='can_access',
                    is_current=True
                ).filter(
                    Q(start_date__lte=date.today()) &
                    Q(Q(end_date__isnull=True) | Q(end_date__gte=date.today()))
                ).exists()
                if denied:
                    continue

                # Nodo suelto
                node = {
                    'id': mod.pk,
                    'name': mod.name,
                    'type': 'MODULE',
                    'path': reverse(mod.path),
                    'target': '_self',
                    'is_external': False,
                    'children': []
                }
                structure.append(node)

        return structure

    def _build_menu_item_data(self, menu_item, profile=None):
        """
        Construye los datos de un elemento del menú recursivamente
        """
        item_data = {
            'id': menu_item.id,
            'name': menu_item.name,
            'type': menu_item.type,
            # 'icon': menu_item.icon,
            'path': menu_item.path if not menu_item.module else reverse(f'{menu_item.module.path}'),
            'target': menu_item.target,
            'is_external': menu_item.is_external,
            'children': []
        }

        # Obtener hijos si los tiene
        if menu_item.has_children:
            children_items = self.items.filter(
                parent=menu_item,
                is_active=True,
                is_current=True,
                is_visible=True
            ).select_related('menu').order_by('order')

            for child_item in children_items:

                # Verificar permisos
                if profile and not child_item.can_access(profile):
                    continue

                child_data = self._build_menu_item_data(child_item, profile)
                item_data['children'].append(child_data)

        return item_data

    def handle_menu_permission(self):
        # from tasks.threaded import handle_menu_permission_thread
        # handle_menu_permission_thread(self.pk)
        pass


class MenuItem(MyModel):
    """
    Elementos individuales del menú con estructura jerárquica
    """

    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='items', verbose_name='Menú')

    # Información básica
    name = models.CharField(
        max_length=100,
        verbose_name='Nombre'
    )
    type = models.CharField(
        max_length=20,
        choices=HelperChoices.MenuItemTypes.choices,
        verbose_name='Tipo'
    )

    # Jerarquía
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='children',
        verbose_name='Elemento padre'
    )

    # Apariencia
    # icon = models.CharField(
    #     max_length=50,
    #     blank=True,
    #     null=True,
    #     verbose_name='Icono'
    # )
    css_class = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Clase CSS adicional'
    )

    # Funcionalidad
    path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='URL'
    )
    module = models.ForeignKey(
        Module,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        verbose_name='Módulo asociado'
    )

    permissions = models.ManyToManyField(
        Permission,
        blank=True,
        verbose_name='Permisos'
    )

    # Configuración
    order = models.IntegerField(
        default=0,
        verbose_name='Orden'
    )
    is_external = models.BooleanField(
        default=False,
        verbose_name='¿Es enlace externo?'
    )
    target = models.CharField(
        max_length=20,
        # default='_self',
        null=True, blank=True,
        verbose_name='Target del enlace',
        help_text='_self, _blank, _parent, _top'
    )
    # Estado
    is_current = models.BooleanField(default=True, verbose_name='¿Vigente?')
    is_visible = models.BooleanField(default=True, verbose_name='¿Visible?')

    class Meta:
        verbose_name = "Elemento de Menú"
        verbose_name_plural = "Elementos de Menú"
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['parent', 'order']),
            models.Index(fields=['is_current', 'is_visible']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

    @property
    def permission_codes(self):
        return [perm.code for perm in self.permissions.filter(is_current=True)]

    @property
    def level(self):
        """Calcula el nivel de profundidad del elemento"""
        level = 0
        parent = self.parent
        while parent:
            level += 1
            parent = parent.parent
        return level

    @property
    def has_children(self):
        """Verifica si tiene elementos hijos"""
        return self.children.filter(is_active=True).exists()

    @property
    def breadcrumb_path(self):
        """Genera la ruta de navegación"""
        path = []
        current = self
        while current:
            path.insert(0, current.name)
            current = current.parent
        return ' > '.join(path)

    def get_active_children(self):
        """Obtiene los hijos activos ordenados"""
        return self.children.filter(
            is_current=True,
            is_visible=True
        ).order_by('order', 'name')

    def can_access(self, profile):
        # 0. Superuser
        if profile.user.is_superuser:
            return True

        # 1. Básicos
        if not (self.is_active and self.is_current and self.is_visible):
            return False

        # 2. Sin módulo → no hay qué negar/otorgar
        if not self.module:
            return True

        # 3. Negación explícita
        denied = ProfileDenied.objects.filter(
            profile=profile,
            module=self.module,
            permission__code='can_access',
            is_current=True
        ).filter(
            Q(start_date__lte=date.today()) &
            Q(Q(end_date__isnull=True) | Q(end_date__gte=date.today()))
        ).exists()
        if denied:
            return False

        # 4. ¿El módulo requiere can_access?
        if not self.module.permissions.filter(code='can_access').exists():
            return True  # el módulo no pide nada

        # 5. Acceso vía ProfileAllowed
        if profile.alloweds.filter(
                module=self.module,
                permissions__code='can_access',
                is_current=True
        ).exists():
            return True

        # 6. Acceso vía rol (MenuItem.permissions o Role→Permission)
        #    (si en tu proyecto los permisos del rol van en MenuItem.permissions)
        if self.permissions.filter(code='can_access').exists():
            return True

        # 7. Acceso vía grupo Django (por si usás la tabla nativa)
        #    (opcional, solo si migraste Group → Role y usas auth.permissions)
        # if profile.user.user_permissions.filter(
        #         codename='can_access'
        # ).filter(
        #     Q(content_type__model='module') | Q(module=self.module)
        # ).exists():
        #     return True

        return False

    @staticmethod
    def flexbox_query(search, extra=None, limit=25, exclude=None):
        conditions = Q(
            Q(name__icontains=search) |
            Q(path__icontains=search)
        )
        return MyModel.dynamic_flexbox_query(MenuItem, conditions, extra, limit, exclude)

    def clean(self):
        super(MenuItem, self).clean()

        # Validar que no sea padre de sí mismo
        if self.parent == self:
            raise NameError("Un elemento no puede ser padre de sí mismo")

        # Validar jerarquía circular
        parent = self.parent
        while parent:
            if parent == self:
                raise NameError("Se detectó una referencia circular en la jerarquía")
            parent = parent.parent

        # Validar URL o módulo para enlaces
        if self.type != HelperChoices.MenuItemTypes.CATEGORY and (not self.path and not self.module):
            raise NameError("Los enlaces deben tener una URL o un módulo asociado")

        # Auto-completar datos desde el módulo
        if self.module:
            if not self.path:
                self.path = self.module.path
            if not self.name:
                self.name = self.module.name

    def save(self, *args, **kwargs):
        self.full_clean()
        super(MenuItem, self).save(*args, **kwargs)

class Carrera(MyModel):
    nombre = models.CharField(verbose_name='Nombre', max_length=100, unique=True, error_messages={'unique': 'El nombre ya existe'})
    nombre_mostrar = models.CharField(verbose_name='Nombre a mostrar', max_length=80)
    vigente = models.BooleanField(default=True, verbose_name='Vigente')

    class Meta:
        verbose_name = 'Carrera'
        verbose_name_plural = 'Carreras'
        ordering = ['nombre']
        # unique_together = ('nombre',)

    def __str__(self):
        return self.nombre


# ==================== MODELOS PARA APLICACIÓN DE MOTOS ====================

class Moto(MyModel):
    """Modelo para representar una motocicleta"""
    conductor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='motos',
        verbose_name='Conductor'
    )
    marca = models.CharField(max_length=50, verbose_name='Marca')
    modelo = models.CharField(max_length=50, verbose_name='Modelo')
    año = models.IntegerField(verbose_name='Año', validators=[MinValueValidator(1900)])
    placa = models.CharField(max_length=20, unique=True, verbose_name='Placa')
    color = models.CharField(max_length=30, verbose_name='Color')
    cilindrada = models.CharField(max_length=20, verbose_name='Cilindrada', blank=True, null=True)
    foto = models.ImageField(upload_to='motos/', blank=True, null=True, verbose_name='Foto')
    documentos_verificados = models.BooleanField(default=False, verbose_name='Documentos verificados')
    is_active_moto = models.BooleanField(default=True, verbose_name='Moto activa')

    class Meta:
        verbose_name = 'Moto'
        verbose_name_plural = 'Motos'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.marca} {self.modelo} - {self.placa}"


class Conductor(MyModel):
    """Perfil extendido para conductores de motos"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='conductor_profile',
        verbose_name='Usuario'
    )
    telefono = models.CharField(max_length=20, verbose_name='Teléfono')
    foto_perfil = models.ImageField(upload_to='conductores/', blank=True, null=True, verbose_name='Foto de perfil')
    licencia_numero = models.CharField(max_length=50, unique=True, verbose_name='Número de licencia')
    licencia_vencimiento = models.DateField(verbose_name='Vencimiento de licencia')
    calificacion_promedio = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        verbose_name='Calificación promedio',
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)]
    )
    total_viajes = models.IntegerField(default=0, verbose_name='Total de viajes')
    estado = models.CharField(
        max_length=20,
        choices=[
            ('disponible', 'Disponible'),
            ('en_viaje', 'En viaje'),
            ('no_disponible', 'No disponible'),
        ],
        default='no_disponible',
        verbose_name='Estado'
    )
    ubicacion_actual_lat = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name='Latitud actual'
    )
    ubicacion_actual_lng = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name='Longitud actual'
    )
    ultima_actualizacion_ubicacion = models.DateTimeField(null=True, blank=True, verbose_name='Última actualización ubicación')
    documentos_verificados = models.BooleanField(default=False, verbose_name='Documentos verificados')
    es_verificado = models.BooleanField(default=False, verbose_name='Conductor verificado')

    class Meta:
        verbose_name = 'Conductor'
        verbose_name_plural = 'Conductores'
        ordering = ['-calificacion_promedio']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.licencia_numero}"

    @property
    def moto_activa(self):
        """Obtiene la moto activa del conductor"""
        return self.user.motos.filter(is_active_moto=True).first()


class Viaje(MyModel):
    """Modelo para representar un viaje en moto"""
    ESTADO_CHOICES = [
        ('solicitado', 'Solicitado'),
        ('aceptado', 'Aceptado'),
        ('en_camino_origen', 'En camino al origen'),
        ('llegado_origen', 'Llegado al origen'),
        ('en_viaje', 'En viaje'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

    pasajero = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='viajes_como_pasajero',
        verbose_name='Pasajero'
    )
    conductor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='viajes_como_conductor',
        null=True,
        blank=True,
        verbose_name='Conductor'
    )
    moto = models.ForeignKey(
        Moto,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Moto'
    )
    
    # Ubicaciones
    origen_lat = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Latitud origen')
    origen_lng = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Longitud origen')
    origen_direccion = models.CharField(max_length=255, verbose_name='Dirección origen')
    destino_lat = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Latitud destino')
    destino_lng = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Longitud destino')
    destino_direccion = models.CharField(max_length=255, verbose_name='Dirección destino')
    
    # Precio y pago
    precio_solicitado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Precio solicitado',
        validators=[MinValueValidator(0.01)]
    )
    precio_final = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Precio final',
        validators=[MinValueValidator(0.01)]
    )
    metodo_pago = models.CharField(
        max_length=20,
        choices=[
            ('efectivo', 'Efectivo'),
            ('tarjeta', 'Tarjeta'),
            ('transferencia', 'Transferencia'),
        ],
        default='efectivo',
        verbose_name='Método de pago'
    )
    pagado = models.BooleanField(default=False, verbose_name='Pagado')
    
    # Estado y tiempos
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='solicitado',
        verbose_name='Estado'
    )
    fecha_solicitud = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de solicitud')
    fecha_aceptacion = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de aceptación')
    fecha_inicio = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de inicio')
    fecha_finalizacion = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de finalización')
    
    # Calificación y comentarios
    calificacion_conductor = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Calificación al conductor'
    )
    calificacion_pasajero = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Calificación al pasajero'
    )
    comentario_conductor = models.TextField(blank=True, null=True, verbose_name='Comentario al conductor')
    comentario_pasajero = models.TextField(blank=True, null=True, verbose_name='Comentario al pasajero')
    
    distancia_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Distancia (km)'
    )
    tiempo_estimado_minutos = models.IntegerField(null=True, blank=True, verbose_name='Tiempo estimado (minutos)')

    class Meta:
        verbose_name = 'Viaje'
        verbose_name_plural = 'Viajes'
        ordering = ['-fecha_solicitud']
        indexes = [
            models.Index(fields=['estado', 'fecha_solicitud']),
            models.Index(fields=['pasajero', 'estado']),
            models.Index(fields=['conductor', 'estado']),
        ]

    def __str__(self):
        return f"Viaje #{self.id} - {self.get_estado_display()} - {self.pasajero.get_full_name()}"

    @property
    def duracion_minutos(self):
        """Calcula la duración del viaje en minutos"""
        if self.fecha_inicio and self.fecha_finalizacion:
            delta = self.fecha_finalizacion - self.fecha_inicio
            return int(delta.total_seconds() / 60)
        return None


class SolicitudViaje(MyModel):
    """Solicitudes de viaje pendientes de ser aceptadas"""
    pasajero = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='solicitudes_viaje',
        verbose_name='Pasajero'
    )
    origen_lat = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Latitud origen')
    origen_lng = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Longitud origen')
    origen_direccion = models.CharField(max_length=255, verbose_name='Dirección origen')
    destino_lat = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Latitud destino')
    destino_lng = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Longitud destino')
    destino_direccion = models.CharField(max_length=255, verbose_name='Dirección destino')
    precio_solicitado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Precio solicitado',
        validators=[MinValueValidator(0.01)]
    )
    metodo_pago = models.CharField(
        max_length=20,
        choices=[
            ('efectivo', 'Efectivo'),
            ('tarjeta', 'Tarjeta'),
            ('transferencia', 'Transferencia'),
        ],
        default='efectivo',
        verbose_name='Método de pago'
    )
    estado = models.CharField(
        max_length=20,
        choices=[
            ('pendiente', 'Pendiente'),
            ('aceptada', 'Aceptada'),
            ('expirada', 'Expirada'),
            ('cancelada', 'Cancelada'),
        ],
        default='pendiente',
        verbose_name='Estado'
    )
    fecha_expiracion = models.DateTimeField(verbose_name='Fecha de expiración')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')

    class Meta:
        verbose_name = 'Solicitud de Viaje'
        verbose_name_plural = 'Solicitudes de Viaje'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['estado', 'fecha_creacion']),
            models.Index(fields=['pasajero', 'estado']),
        ]

    def __str__(self):
        return f"Solicitud #{self.id} - {self.pasajero.get_full_name()}"


class Calificacion(MyModel):
    """Calificaciones entre usuarios"""
    viaje = models.ForeignKey(
        Viaje,
        on_delete=models.CASCADE,
        related_name='calificaciones',
        verbose_name='Viaje'
    )
    calificador = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='calificaciones_dadas',
        verbose_name='Calificador'
    )
    calificado = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='calificaciones_recibidas',
        verbose_name='Calificado'
    )
    puntuacion = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Puntuación'
    )
    comentario = models.TextField(blank=True, null=True, verbose_name='Comentario')
    fecha_calificacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de calificación')

    class Meta:
        verbose_name = 'Calificación'
        verbose_name_plural = 'Calificaciones'
        unique_together = ('viaje', 'calificador')
        ordering = ['-fecha_calificacion']

    def __str__(self):
        return f"{self.calificador.get_full_name()} → {self.calificado.get_full_name()}: {self.puntuacion}/5"