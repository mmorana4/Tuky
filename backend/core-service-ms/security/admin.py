# -*- coding: utf-8 -*-
from django import forms
from django.contrib import admin, messages
from django.db.models import Q
from django.forms import ModelForm
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect
from django.urls import reverse, path
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from core.my_admin import BaseModelTabularInlineAdmin, BaseModelStackedInlineAdmin, BaseModelAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from security.models import *


class ProfileInline(BaseModelStackedInlineAdmin):
    model = Profile
    fk_name = 'user'
    extra = 0
    verbose_name = "Permiso"
    verbose_name_plural = "Permisos"


class ProviderInline(BaseModelStackedInlineAdmin):
    model = UserProvider
    fk_name = 'user'
    extra = 0
    verbose_name = "Proveedor"
    verbose_name_plural = "Proveedores"


# Formulario personalizado para crear usuarios
class NewUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'type_document', 'document', 'first_name', 'last_name', 'is_active',
                  'is_staff', 'is_superuser')


# Formulario personalizado para editar usuarios
class NewUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'type_document', 'document', 'first_name', 'last_name', 'is_active',
                  'is_staff', 'is_superuser')


@admin.register(User)
class UserAdmin(BaseModelAdmin):
    form = NewUserChangeForm
    add_form = NewUserCreationForm

    list_per_page = 15
    list_display = (
        "document", "type_document", "first_name",
        "last_name", "username", "email", "last_login", "is_staff",
        "is_active", "is_superuser", "password_reset_button"
    )
    ordering = ("username",)
    list_filter = ("is_staff", "is_active", "is_superuser", "type_document")
    search_fields = ("username", "first_name", "last_name", "document", "email")

    # filter_horizontal = ('groups', 'branches',)
    inlines = [ProviderInline, ProfileInline]

    fieldsets = (
        ('Información Personal', {
            'fields': ('type_document', 'document', 'first_name', 'last_name', 'email')
        }),
        ('Información Acceso', {
            'classes': ('wide',),
            'fields': ('username', 'is_superuser', 'is_staff'),
        }),
        ('Fechas Importantes', {
            'fields': ('date_joined', 'last_login'),
            'classes': ('collapse',),
        }),
    )

    add_fieldsets = (
        ('Información Personal', {
            'fields': ('type_document', 'document', 'first_name', 'last_name', 'email')
        }),
        ('Información Acceso', {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'is_superuser', 'is_staff'),
        }),
    )

    readonly_fields = ('date_joined', 'last_login', 'password')

    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)

    def get_form(self, request, obj=None, **kwargs):
        """
        Usar formulario especial para la página de agregar.
        """
        if obj is None:
            kwargs['form'] = self.add_form
        return super().get_form(request, obj, **kwargs)

    def save_model(self, request, obj, form, change):
        """
        Guardar el modelo, manejando la contraseña correctamente.
        """
        if not change:
            # Para nuevo usuario, la contraseña se maneja automáticamente con UserCreationForm
            obj.set_password(form.cleaned_data['password1'])
        super().save_model(request, obj, form, change)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_reset_password'] = True
        return super().change_view(request, object_id, form_url, extra_context)

    def password_reset_button(self, obj):
        return format_html(
            '<a class="button" href="{}">Resetear contraseña</a>',
            reverse('admin:app_user_reset_password', args=[obj.pk])
        )

    password_reset_button.short_description = "Acción"
    password_reset_button.allow_tags = True

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                '<path:object_id>/reset_password/',
                self.admin_site.admin_view(self.reset_password_view),
                name='app_user_reset_password'
            ),
        ]
        return custom_urls + urls

    def reset_password_view(self, request, object_id):
        from django.contrib.auth.hashers import make_password
        try:
            user = User.objects.get(pk=object_id)
            new_password = User.objects.make_random_password()
            user.password = make_password(new_password)
            user.save()

            self.message_user(
                request,
                f"Contraseña reseteada para {user.username}. Nueva contraseña: {new_password}",
                messages.SUCCESS
            )
        except User.DoesNotExist:
            self.message_user(
                request,
                "Usuario no encontrado",
                messages.ERROR
            )

        # Redirigir a la página de cambio del usuario
        opts = self.model._meta
        redirect_url = reverse(f'admin:{opts.app_label}_{opts.model_name}_change', args=[object_id])
        return redirect(redirect_url)

    @admin.action(description='Resetear contraseña para usuarios seleccionados')
    def reset_password(self, request, queryset):
        from django.contrib.auth.hashers import make_password

        for user in queryset:
            new_password = User.objects.make_random_password()
            user.password = make_password(new_password)
            user.save()
            self.message_user(
                request,
                f"Contraseña reseteada para {user.username}. Nueva contraseña: {new_password}",
                messages.SUCCESS
            )

    actions = [reset_password]

    # Métodos adicionales para mejor visualización
    def get_full_name(self, obj):
        return obj.get_full_name()

    get_full_name.short_description = 'Nombre completo'

    def get_short_name(self, obj):
        return obj.get_short_name()

    get_short_name.short_description = 'Nombre corto'

    # Personalizar la vista de lista para mostrar información más útil
    def changelist_view(self, request, extra_context=None):
        # Puedes agregar contexto adicional aquí si es necesario
        return super().changelist_view(request, extra_context)

    # Filtros personalizados
    def get_list_filter(self, request):
        list_filter = super().get_list_filter(request)
        return list_filter

    # Búsqueda personalizada
    def get_search_fields(self, request):
        search_fields = super().get_search_fields(request)
        return search_fields


# ==================== ADMIN PARA MODELOS DE TRANSPORTE ====================

@admin.register(Moto)
class MotoAdmin(BaseModelAdmin):
    list_display = ('placa', 'marca', 'modelo', 'año', 'conductor', 'is_active_moto', 'documentos_verificados')
    list_filter = ('marca', 'año', 'is_active_moto', 'documentos_verificados')
    search_fields = ('placa', 'marca', 'modelo', 'conductor__username', 'conductor__first_name', 'conductor__last_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Información del Vehículo', {
            'fields': ('marca', 'modelo', 'año', 'placa', 'color', 'cilindrada')
        }),
        ('Propietario', {
            'fields': ('conductor',)
        }),
        ('Documentación', {
            'fields': ('foto', 'documentos_verificados', 'is_active_moto')
        }),
    )


@admin.register(Conductor)
class ConductorAdmin(BaseModelAdmin):
    list_display = ('user', 'licencia_numero', 'telefono', 'calificacion_promedio', 'total_viajes', 'estado', 'es_verificado')
    list_filter = ('estado', 'documentos_verificados', 'es_verificado')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'licencia_numero', 'telefono')
    readonly_fields = ('calificacion_promedio', 'total_viajes', 'ultima_actualizacion_ubicacion', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('user', 'telefono', 'foto_perfil')
        }),
        ('Licencia', {
            'fields': ('licencia_numero', 'licencia_vencimiento')
        }),
        ('Estado y Ubicación', {
            'fields': ('estado', 'ubicacion_actual_lat', 'ubicacion_actual_lng', 'ultima_actualizacion_ubicacion')
        }),
        ('Estadísticas', {
            'fields': ('calificacion_promedio', 'total_viajes')
        }),
        ('Verificación', {
            'fields': ('documentos_verificados', 'es_verificado')
        }),
    )


@admin.register(Viaje)
class ViajeAdmin(BaseModelAdmin):
    list_display = ('id', 'pasajero', 'conductor', 'estado', 'precio_solicitado', 'precio_final', 'fecha_solicitud')
    list_filter = ('estado', 'metodo_pago', 'pagado', 'fecha_solicitud')
    search_fields = ('pasajero__username', 'conductor__username', 'origen_direccion', 'destino_direccion')
    readonly_fields = ('fecha_solicitud', 'fecha_aceptacion', 'fecha_inicio', 'fecha_finalizacion', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Participantes', {
            'fields': ('pasajero', 'conductor', 'moto')
        }),
        ('Ruta', {
            'fields': ('origen_lat', 'origen_lng', 'origen_direccion', 'destino_lat', 'destino_lng', 'destino_direccion')
        }),
        ('Precio y Pago', {
            'fields': ('precio_solicitado', 'precio_final', 'metodo_pago', 'pagado')
        }),
        ('Estado y Tiempos', {
            'fields': ('estado', 'fecha_solicitud', 'fecha_aceptacion', 'fecha_inicio', 'fecha_finalizacion')
        }),
        ('Calificaciones', {
            'fields': ('calificacion_conductor', 'comentario_conductor', 'calificacion_pasajero', 'comentario_pasajero')
        }),
        ('Información Adicional', {
            'fields': ('distancia_km', 'tiempo_estimado_minutos')
        }),
    )


@admin.register(SolicitudViaje)
class SolicitudViajeAdmin(BaseModelAdmin):
    list_display = ('id', 'pasajero', 'estado', 'precio_solicitado', 'fecha_creacion', 'fecha_expiracion')
    list_filter = ('estado', 'metodo_pago', 'fecha_creacion')
    search_fields = ('pasajero__username', 'origen_direccion', 'destino_direccion')
    readonly_fields = ('fecha_creacion', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Pasajero', {
            'fields': ('pasajero',)
        }),
        ('Ruta', {
            'fields': ('origen_lat', 'origen_lng', 'origen_direccion', 'destino_lat', 'destino_lng', 'destino_direccion')
        }),
        ('Precio y Pago', {
            'fields': ('precio_solicitado', 'metodo_pago')
        }),
        ('Estado', {
            'fields': ('estado', 'fecha_creacion', 'fecha_expiracion')
        }),
    )


@admin.register(Calificacion)
class CalificacionAdmin(BaseModelAdmin):
    list_display = ('id', 'viaje', 'calificador', 'calificado', 'puntuacion', 'fecha_calificacion')
    list_filter = ('puntuacion', 'fecha_calificacion')
    search_fields = ('calificador__username', 'calificado__username', 'comentario')
    readonly_fields = ('fecha_calificacion', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Información General', {
            'fields': ('viaje', 'calificador', 'calificado')
        }),
        ('Calificación', {
            'fields': ('puntuacion', 'comentario', 'fecha_calificacion')
        }),
    )


@admin.register(Permission)
class PermissionAdmin(BaseModelAdmin):
    list_display = ('code', 'name', 'is_current')
    list_filter = ('is_current',)
    search_fields = ('code', 'name', 'description')

    fieldsets = (
        ('Información Básica', {
            'fields': ('code', 'name', 'description')
        }),
        ('Estado', {
            'fields': ('is_current',)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj and obj.code in obj.PROTECTED_CODES:
            return self.readonly_fields + ('code', 'name')
        return self.readonly_fields


@admin.register(Role)
class RoleAdmin(BaseModelAdmin):
    list_per_page = 15
    list_display = ("code", "name", "legend", "is_current", "is_system", "weight")
    search_fields = ("code", "name", "legend")
    filter_horizontal = ("branches",)
    fieldsets = (
        ('General', {
            'fields': ("route", "code", "name", "legend", "level_authority", "weight")
        }),
        ('Estado', {
            'fields': ("is_current", "is_system")
        }),
        ('Localidades', {
            'fields': ("branches",),
            'classes': ('collapse',),
        }),
    )

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        # if db_field.name == "permissions":
        # Aquí aplicas el filtro que quieras, por ejemplo solo los de type='X'
        # kwargs["queryset"] = Permission.objects.filter(type=Permission.Types.ACTION)
        return super().formfield_for_manytomany(db_field, request, **kwargs)


class ProfileAllowedForm(ModelForm):
    class Meta:
        model = ProfileAllowed
        fields = '__all__'


class ProfileDeniedForm(ModelForm):
    class Meta:
        model = ProfileDenied
        fields = '__all__'


class ProfileAllowedAdminInline(BaseModelTabularInlineAdmin):
    model = ProfileAllowed
    form = ProfileAllowedForm
    extra = 0
    fields = ('module', 'permissions')
    verbose_name = "Extra Permiso"
    verbose_name_plural = "Extra Permisos"
    filter_horizontal = ('permissions',)  # Configuración correcta de filter_horizontal

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.validate_min = False
        return formset


class ProfileDeniedAdminInline(BaseModelTabularInlineAdmin):
    model = ProfileDenied
    form = ProfileDeniedForm
    extra = 0
    fields = ('module', 'permissions')
    verbose_name = "Negación Permiso"
    verbose_name_plural = "Negación de Permisos"
    filter_horizontal = ('permissions',)  # Configuración correcta de filter_horizontal

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.validate_min = False
        return formset


@admin.register(Profile)
class ProfileAdmin(BaseModelAdmin):
    list_display = ('id_display', 'username', 'branch', 'role', 'is_current')
    list_filter = ('branch__name', 'role__name', 'is_current')
    search_fields = ('user__username', 'branch__name', 'role__name')
    inlines = [ProfileAllowedAdminInline, ProfileDeniedAdminInline]
    ordering = ('user__username', 'branch__name', 'role__name')

    def username(self, obj):
        return f"{obj.user.get_full_name()}"  # Formato personalizado, ejemplo: ID-0001

    username.short_description = "Usuario"  # Nombre de la columna en el admin

    def save_formset(self, request, form, formset, change):
        """Guarda el formset y valida los permisos de la cuenta."""
        instances = formset.save(commit=False)
        for instance in instances:
            if not instance.pk:  # Si es un nuevo permiso de cuenta
                instance.account = form.instance  # Asigna la cuenta padre
            instance.full_clean()  # Valida el permiso de cuenta
            instance.save()
        formset.save_m2m()  # Guarda las relaciones ManyToMany (si las hay)
