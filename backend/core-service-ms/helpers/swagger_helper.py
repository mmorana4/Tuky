from datetime import datetime
from django import forms
from drf_yasg import openapi
from rest_framework import serializers


class HelperSwagger:

    @staticmethod
    def request_form_to_schema(form_class):
        fields = {}
        requireds = []
        grouped_fields = {}
        has_field_groups = hasattr(form_class, 'field_groups')
        for field_name, field in form_class.base_fields.items():
            if field.required:
                requireds.append(field_name)
            default = field.initial
            help_text = field.help_text or ""
            # if isinstance(field, forms.IntegerField):
            if type(field) is forms.IntegerField:
                if not isinstance(default, int):
                    default = 0
                schema = openapi.Schema(type=openapi.TYPE_INTEGER,
                                        example=default,
                                        description=f"Un campo entero para {field_name}\n--- {'-' * 20} --",
                                        help_text=f"{help_text}"
                                        )
            elif type(field) is forms.CharField:
                if not isinstance(default, str):
                    default = 'Texto de ejemplo'
                schema = openapi.Schema(type=openapi.TYPE_STRING,
                                        example=default,
                                        description=f"Una cadena de texto para {field_name}\n--- {'-' * 20} --"
                                        )
            elif isinstance(field, forms.BooleanField):
                if not isinstance(default, bool):
                    default = False
                schema = openapi.Schema(type=openapi.TYPE_BOOLEAN,
                                        example=default,
                                        description=f"Un valor booleano para {field_name}\n--- {'-' * 20} --"
                                        )
            # elif isinstance(field, forms.FloatField):
            elif type(field) is forms.FloatField:
                if not isinstance(default, float):
                    default = "0.0"
                schema = openapi.Schema(type=openapi.TYPE_NUMBER,
                                        format=openapi.FORMAT_FLOAT,
                                        example=default,
                                        description=f"Un número flotante para {field_name}\n--- {'-' * 20} --"
                                        )
            elif isinstance(field, forms.DateTimeField):
                if isinstance(default, datetime):
                    default = default.isoformat(timespec='seconds') + 'Z'
                else:
                    default = datetime.now().isoformat(timespec='seconds') + 'Z'
                schema = openapi.Schema(type=openapi.TYPE_STRING,
                                        format=openapi.FORMAT_DATETIME,
                                        example=default,
                                        # Formato ISO 8601
                                        description=f"Una fecha y hora para {field_name} en formato ISO 8601 \n--- {'-' * 20} --"
                                        )
            elif isinstance(field, forms.DateField):
                if isinstance(default, datetime):
                    default = default.date().strftime('%Y-%m-%d')
                else:
                    default = datetime.now().date().strftime('%Y-%m-%d')
                schema = openapi.Schema(type=openapi.TYPE_STRING,
                                        format=openapi.FORMAT_DATE,
                                        example=default,  # Formato YYYY-MM-DD
                                        description=f"Una fecha para {field_name} en formato ISO 8601 (YYYY-MM-DD) \n--- {'-' * 20} --"
                                        )
            elif isinstance(field, forms.JSONField):
                schema = openapi.Schema(type=openapi.TYPE_OBJECT,
                                        example={},
                                        description=f"Un campo JSON para {field_name}"
                                        )

            elif isinstance(field, forms.FileField):
                schema = openapi.Schema(
                    type=openapi.TYPE_FILE,
                    format=openapi.FORMAT_BINARY,
                    description=f"Un campo de archivo para {field_name}\n--- {'-' * 20} --"
                )

            if has_field_groups:
                group = form_class.field_groups.get(field_name, None)
                if group:
                    if group not in grouped_fields:
                        grouped_fields[group] = []
                    grouped_fields[group].append((field_name, schema))
                else:
                    fields[field_name] = schema
            else:
                fields[field_name] = schema

        if has_field_groups:
            # Añadir separadores y organizar los campos
            for group, field_list in grouped_fields.items():
                fields[f''] = openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description=f" {group} \n--- {'-' * 20} --"
                )
                for field_name, schema in field_list:
                    fields[field_name] = schema

        swagger_schema = openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties=fields,
            required=requireds
        )

        return swagger_schema

    @staticmethod
    def response_form_to_schema(name_key, form_class):
        fields = {}
        errors = {}
        requireds = []
        for field_name, field in form_class.base_fields.items():
            if field.required:
                requireds.append(field_name)
            help_text = field.help_text or ""
            if type(field) is forms.IntegerField:
                fields[field_name] = openapi.Schema(type=openapi.TYPE_INTEGER,
                                                    example=0,
                                                    description=f"Un campo entero para {field_name}\n--- {'-' * 20} --",
                                                    help_text=f"{help_text}"
                                                    )
            elif isinstance(field, forms.JSONField):
                example = None
                if isinstance(field.initial, list):
                    example = []
                elif isinstance(field.initial, dict):
                    example = {}
                fields[field_name] = openapi.Schema(type=openapi.TYPE_OBJECT,
                                                    example=example,
                                                    description=f"Un campo JSON para {field_name}\n--- {'-' * 20} --"
                                                    )
            elif isinstance(field, forms.CharField):
                fields[field_name] = openapi.Schema(type=openapi.TYPE_STRING,
                                                    example='Texto de ejemplo',
                                                    description=f"Una cadena de texto para {field_name}\n--- {'-' * 20} --"
                                                    )
            elif isinstance(field, forms.BooleanField):
                fields[field_name] = openapi.Schema(type=openapi.TYPE_BOOLEAN,
                                                    example=False,
                                                    description=f"Un valor booleano para {field_name}\n--- {'-' * 20} --"
                                                    )
            elif type(field) is forms.FloatField:
                fields[field_name] = openapi.Schema(type=openapi.TYPE_NUMBER,
                                                    format=openapi.FORMAT_FLOAT,
                                                    example=0.0,
                                                    description=f"Un número flotante para {field_name}\n--- {'-' * 20} --"
                                                    )
            elif isinstance(field, forms.DateTimeField):
                fields[field_name] = openapi.Schema(type=openapi.TYPE_STRING,
                                                    format=openapi.FORMAT_DATETIME,
                                                    example=datetime.now().isoformat(timespec='seconds') + 'Z',
                                                    # Formato ISO 8601
                                                    description=f"Una fecha y hora para {field_name} en formato ISO 8601 \n--- {'-' * 20} --"
                                                    )
            elif isinstance(field, forms.DateField):
                fields[field_name] = openapi.Schema(type=openapi.TYPE_STRING,
                                                    format=openapi.FORMAT_DATE,
                                                    example=datetime.now().date().strftime('%Y-%m-%d'),
                                                    # Formato YYYY-MM-DD
                                                    description=f"Una fecha para {field_name} en formato ISO 8601 (YYYY-MM-DD) \n--- {'-' * 20} --"
                                                    )
            elif isinstance(field, forms.FileField):
                fields[field_name] = openapi.Schema(type=openapi.TYPE_FILE,
                                                    format=openapi.FORMAT_BINARY,
                                                    description=f"Un campo de archivo para {field_name}\n--- {'-' * 20} --"
                                                    )

            # Añadiendo los mensajes de error personalizados
            if field.error_messages and field.required:
                for error_key, error_message in field.error_messages.items():
                    errors[field_name] = openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example=error_message,
                        description=f"Mensaje de error para {field_name} cuando '{error_key}'"
                    )

        # Agregar más tipos de campos según sea necesario
        # for reqired in requireds:
        #     errors[reqired] = openapi.Schema(type=openapi.TYPE_STRING, example='Campo no debe estar vacío')
        swagger_schema = openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                name_key: openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'errors': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties=errors
                        ),
                        'fields': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties=fields
                        ),

                    }
                )
            },
            required=requireds
        )

        return swagger_schema

    @staticmethod
    def response_serializer_to_schema(serializer_class):
        """ Este método sirve para convertir un serializer a tipo openapi.Schema
            ejemplo:
            -  load_schema = generate_schema_from_serializer(serializer_load_schema)
        """
        properties = {}
        for field_name, field in serializer_class().get_fields().items():
            field_type = field.__class__.__name__
            if isinstance(field, serializers.IntegerField):
                field_schema = openapi.Schema(type=openapi.TYPE_INTEGER,
                                              example=0,
                                              description=f"Un campo entero para {field_name}"
                                              )
            elif isinstance(field, serializers.FloatField):
                field_schema = openapi.Schema(type=openapi.TYPE_NUMBER,
                                              format=openapi.FORMAT_FLOAT,
                                              example=0.0,
                                              description=f"Un número flotante para {field_name}"
                                              )
            elif isinstance(field, serializers.BooleanField):
                field_schema = openapi.Schema(type=openapi.TYPE_BOOLEAN,
                                              example=False,
                                              description=f"Un valor booleano para {field_name}"
                                              )
            elif isinstance(field, serializers.DateTimeField):
                field_schema = openapi.Schema(type=openapi.TYPE_STRING,
                                              format=openapi.FORMAT_DATETIME,
                                              example=datetime.now().isoformat(timespec='seconds') + 'Z',
                                              # Formato ISO 8601
                                              description=f"Una fecha y hora para {field_name} en formato ISO 8601"
                                              )
            elif isinstance(field, serializers.DateField):
                field_schema = openapi.Schema(type=openapi.TYPE_STRING,
                                              format=openapi.FORMAT_DATE,
                                              example=datetime.now().date().strftime('%Y-%m-%d'),  # Formato YYYY-MM-DD
                                              description=f"Una fecha para {field_name} en formato ISO 8601 (YYYY-MM-DD)"
                                              )
            elif isinstance(field, serializers.CharField):
                field_schema = openapi.Schema(type=openapi.TYPE_STRING,
                                              example='',
                                              description=f"Una cadena de texto para {field_name}"
                                              )
            elif isinstance(field, serializers.ListSerializer):
                field_schema = openapi.Schema(type=openapi.TYPE_ARRAY,
                                              items=Helper_Swagger.response_serializer_to_schema(field.child.__class__),
                                              description=f"Una lista de elementos que representan para {field_name}.")
            elif isinstance(field, serializers.Serializer):
                field_schema = Helper_Swagger.response_serializer_to_schema(field.__class__)
            else:
                field_schema = openapi.Schema(type=openapi.TYPE_STRING,
                                              example='Texto de ejemplo',
                                              description=f"Una cadena de texto para {field_name}"
                                              )

            properties[field_name] = field_schema

        return openapi.Schema(type=openapi.TYPE_OBJECT, properties=properties)
