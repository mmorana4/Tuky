# -*- coding: utf-8 -*-
from __future__ import division
import uuid
# from cgi import escape
from datetime import datetime, date, time, timedelta
from decimal import Decimal, ROUND_HALF_UP, ROUND_DOWN, ROUND_UP, InvalidOperation
from django.db.models import Q, JSONField
from django.contrib.admin.utils import NestedObjects
from django.db import transaction, router, models
from core.my_cache import MY_Cache, MyRedis
from django.core.exceptions import FieldDoesNotExist
from django.db.models.fields.files import FileField
from django.db.models.fields.related import ForeignKey, ManyToManyField, OneToOneField
from core.my_base import MY_CACHE_LIFETIME, MY_USER_SYSTEM_ID, MY_DECIMAL_PLACES


class MyManager(models.Manager):

    def datatable(self, **kwargs):
        """
            Fetches data based on filters, ordering, and pagination.

            Parameters:
            *args: Additional positional arguments (not used in this function).
            **kwargs: Keyword arguments including:
                - conditions (Q object, optional): Filters to apply to the query.
                - limit (int, optional): The maximum number of records to return.
                - offset (int, optional): The number of records to skip before starting to return records.
                - order_by (str or list of str, optional): Fields to order the results by.
                - exclude (Q object, optional): Filters to exclude from the query.
                - annotate (dict, optional): Annotations to apply to the query.

            Returns:
            tuple: A tuple containing:
                - aData (list): The list of resulting records.
                - iTotalRecords (int): The total number of records matching the filters.
                - iTotalDisplayRecords (int): The number of records to be displayed after applying filters, ordering, and pagination.
        """
        conditions = kwargs.get('conditions', Q())
        limit = kwargs.get('limit', 25)
        offset = kwargs.get('offset', None)
        order_by = kwargs.get('order_by', None)
        exclude = kwargs.get('exclude', Q())
        annotate = kwargs.get('annotate', None)
        # Aplicar conditions
        query = self.filter(conditions).exclude(exclude).distinct()

        # Aplicar anotaciones si se proporcionan
        if annotate is not None:
            query = query.annotate(**annotate)

        # Contar el total de registros
        iTotalRecords = query.count()

        # Ordenar los registros
        if order_by is not None:
            if isinstance(order_by, (list, tuple)):
                query = query.order_by(*order_by)
            else:
                query = query.order_by(order_by)
        else:
            query = query.order_by('id')

        # Aplicar paginación
        if offset is not None:
            query = query[offset:]
        if limit is not None:
            query = query[:limit]

        # Contar los registros que serán mostrados
        iTotalDisplayRecords = len(query)

        # Obtener los datos
        aData = list(query)

        return aData, iTotalRecords, iTotalDisplayRecords


class MyDecimalRoundMixin:

    def to_decimal(self, value, default=Decimal('0.00')):
        """Convierte cualquier valor a Decimal de forma segura."""
        try:
            return Decimal(str(value))
        except (InvalidOperation, TypeError, ValueError):
            return default

    def round_decimal(self, value, places=MY_DECIMAL_PLACES, rounding=ROUND_HALF_UP):
        if not isinstance(value, Decimal):
            value = Decimal(str(value))
        precision = Decimal(f'1.{"0" * places}')
        return value.quantize(precision, rounding=rounding)

    def round_up(self, value, places=4):
        return self.round_decimal(value, places=places, rounding=ROUND_UP)

    def round_down(self, value, places=4):
        return self.round_decimal(value, places=places, rounding=ROUND_DOWN)

    def percentage_of(self, value, percentage):
        """Calcula un porcentaje de un valor."""
        return self.to_decimal(value) * self.to_decimal(percentage) / Decimal('100')

    def apply_discount(self, value, discount, calculation_method='percentage'):
        """
        Aplica un descuento a un valor base.
        calculation_method: 'percentage' o 'fixed'
        """
        value = self.to_decimal(value)
        discount = self.to_decimal(discount)
        if calculation_method == 'percentage':
            return value - self.percentage_of(value, discount)
        elif calculation_method == 'fixed':
            return max(value - discount, Decimal('0'))
        return value

    def calculate_tax(self, base, rate, method='percentage', quantity=Decimal('1')):
        """
        Calcula el valor del impuesto.
        method: 'percentage' o 'fixed'
        """
        base = self.to_decimal(base)
        rate = self.to_decimal(rate)
        quantity = self.to_decimal(quantity)
        if method == 'percentage':
            return base * rate / Decimal('100')
        else:  # fixed
            return rate * quantity


class MyModel(models.Model, MyDecimalRoundMixin):
    """ Modelo base para todos los modelos del proyecto """
    from django.conf import settings
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="UUID")
    is_active = models.BooleanField(default=True, verbose_name=u"¿Activo?")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    updated_at = models.DateTimeField(auto_now=True)

    # Asignar el manager personalizado
    objects = MyManager()

    class Meta:
        abstract = True

    @property
    def id_display(self):
        return f"{self.id:05d}"

    @property
    def is_eliminated(self):
        is_active = self.is_active
        return not is_active

    @classmethod
    def cache(cls, value, field='id', lifetime=MY_CACHE_LIFETIME):
        table = cls._meta.db_table
        try:
            cls._meta.get_field(field)
        except FieldDoesNotExist:
            raise NameError(f"El campo '{field}' no existe en el modelo")
        normalized_value = str(value).replace(' ', '_').encode('ascii', 'ignore').decode()
        key = f"{MyRedis.PREFIX}:table:{table}:{field}:{normalized_value}"
        return MY_Cache(key=key, lifetime=lifetime)

    def delete_cache(self, value, field='id'):
        try:
            self._meta.get_field(field)
            field_value = getattr(self, field)
            if field_value:
                eCache = self.cache(self, field, field_value)
                eCache.delete()
        except FieldDoesNotExist:
            raise NameError(f"El campo '{field}' no existe en el modelo")

    def model_has_field(self, field_name):
        try:
            self._meta.get_field(field_name)
            return True
        except FieldDoesNotExist:
            return False

    @staticmethod
    def dynamic_flexbox_query(instance, conditions, extra=None, limit=25, exclude=None):
        queryset = instance.objects.filter(conditions)
        if extra:
            queryset = queryset.filter(extra)

        if exclude:
            queryset = queryset.exclude(exclude)

        return queryset.distinct()[:limit]

    def __is_deletable(self, isUsed=True):
        # get all the related object
        for rel in self._meta.get_fields():
            try:
                # check if there is a relationship with at least one related object
                related = rel.related_model.objects.filter(**{rel.field.name: self})
                if related.exists():
                    # if there is return a Tuple of flag = False the related_model object
                    if isUsed:
                        return True, related
                    else:
                        return False, related
                else:
                    return False, related
            except AttributeError:  # an attribute error for field occurs when checking for AutoField
                pass  # just pass as we dont need to check for AutoField
        if isUsed:
            return False, None
        else:
            return True, None

    def is_used(self):
        return self.__is_deletable(isUsed=True)

    def is_delete(self):
        return self.__is_deletable(isUsed=False)

    def __can_delete__(self):
        obj = self
        using = router.db_for_write(obj)
        collector = NestedObjects(using=using)
        objs = [obj]
        collector.collect(objs)
        model_count = {model._meta.verbose_name_plural: len(objs) for model, objs in collector.model_objs.items()}
        return model_count.__len__() <= 1

    def can_delete(self):
        return self.__can_delete__()

    def time_since_action(self):
        from helpers.functions_helper import HelperFunctions
        return HelperFunctions.time_since_action(self.created_at)

    def time_since_create_action(self):
        from helpers.functions_helper import HelperFunctions
        return HelperFunctions.time_since_action(self.created_at)

    def time_since_update_action(self):
        from helpers.functions_helper import HelperFunctions
        return HelperFunctions.time_since_action(self.updated_at) if self.updated_at else None

    def to_dict(self, *exclude_fields, **kwargs):
        from core.my_base import MY_FIELDS_AUDIT
        fields_audit_excluir = MY_FIELDS_AUDIT
        exclude_audit = kwargs.get('exclude_audit', False)
        entity_dict = {}

        for field in self._meta.fields:
            field_name = field.name
            if exclude_audit and field_name in fields_audit_excluir:
                continue
            if field_name in exclude_fields:
                continue

            field_value = getattr(self, field_name)
            if isinstance(field_value, (datetime, date, time)):
                field_value = field_value.isoformat()
            elif isinstance(field, (ForeignKey, OneToOneField)):
                field_value = field_value.id if field_value else None
            elif isinstance(field, ManyToManyField):
                field_value = list(field_value.values_list('id', flat=True))
            elif isinstance(field, FileField):
                field_value = field_value.url if field_value else None
            elif field.choices:
                entity_dict[f'{field_name}_display'] = dict(field.choices).get(field_value, field_value)
            elif isinstance(field, JSONField):
                field_value = field_value
            elif isinstance(field, models.UUIDField):
                field_value = str(field_value)
            entity_dict[field_name] = field_value

        return entity_dict

    def copy(self, include_id=False, exclude_fields=None, extra_attrs=None):
        """
        Crea una copia de una instancia de modelo Django sin guardar en la base de datos.

        :param self: Instancia del modelo a copiar.
        :param include_id: Si True, mantiene el mismo 'id'. Si False, lo excluye.
        :param exclude_fields: Lista de campos a excluir (por defecto ['id', 'pk']).
        :param extra_attrs: Diccionario de atributos adicionales a agregar a la copia.
        :return: Nueva instancia del modelo con los mismos datos.
        """
        if exclude_fields is None:
            exclude_fields = ['id', 'pk'] if not include_id else []  # Excluir siempre 'id' y 'pk' para evitar colisión

        # Obtener los valores de los campos del modelo, excluyendo los especificados
        instance_data = {
            field.name: getattr(self, field.name)
            for field in self._meta.fields
            if field.name not in exclude_fields
        }

        # Crear la nueva instancia con los mismos datos
        new_instance = self.__class__(**instance_data)

        # Agregar atributos extra si se proporcionan
        if extra_attrs:
            for key, value in extra_attrs.items():
                setattr(new_instance, key, value)

        return new_instance

    def flexbox_repr(self, field):
        """
            Returns a string representation of the model instance based on the specified field
            or method.

            Parameters:
            field (str, optional): The name of the field or method to be used in the representation.
                                   If not provided, defaults to using 'nombre' field.

            Returns:
            str: The string representation of the model instance based on the specified field
                 or method.
        """
        # Check if the field is a callable method
        if callable(getattr(self, field, None)):
            field_value = getattr(self, field)()
        else:
            field_value = getattr(self, field, None)
        if field_value is None:
            raise NameError(u'Field or method not found or has no value')
        return u'%s' % field_value

    def save(self, *args, **kwargs):
        # Verificar si se está cargando datos iniciales
        from security.context_processors import thread_context
        if getattr(thread_context, 'loading_initial_data', False):
            # Durante la carga inicial, no establecer campos de auditoría automáticamente
            models.Model.save(self)
            return
        
        now = datetime.now()
        user_ = None
        if len(args):
            user_ = args[0].user.id
        for key, value in kwargs.items():
            if 'user_id' == key:
                user_ = value
        if self.id:
            self.updated_by_id = user_ if user_ else MY_USER_SYSTEM_ID
            self.updated_at = now
        else:
            self.created_by_id = user_ if user_ else MY_USER_SYSTEM_ID
            self.created_at = now
        models.Model.save(self)
