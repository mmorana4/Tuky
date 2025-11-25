import os
import json
import sys
from django.apps import AppConfig
from django.db import IntegrityError, transaction, connections
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.db import models
from django.utils.module_loading import import_string


class ApplicationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "security"
    verbose_name = 'Seguridad'

    def ready(self):
        # Evita ejecutar durante makemigrations o migrate
        if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
            return

        from security.context_processors import thread_context

        thread_context.loading_initial_data = True

        # Directorio de la app
        app_dir = os.path.dirname(os.path.abspath(__file__))
        fixtures = [
            # 'initial_auth_method.json',
            'initial_company.json',
            'initial_company_branch.json',
            'initial_role.json',
            'initial_permission.json',
        ]

        for fixture_name in fixtures:
            fixture_path = os.path.join(app_dir, 'fixtures', fixture_name)

            if not os.path.exists(fixture_path):
                print(f"[App] Fixture no encontrado: {fixture_path}")
                continue

            try:
                with transaction.atomic():
                    with open(fixture_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        for item in data:
                            model_path = item["model"]
                            pk = item["pk"]
                            fields = item["fields"].copy()
                            try:
                                model_class = import_string(f"{model_path}")
                            except ImportError as e:
                                print(f"[App] Modelo no encontrado: {model_path} → {e}")
                                continue

                            # Limpiar campos ForeignKey que referencian objetos inexistentes
                            model_fields = {f.name: f for f in model_class._meta.get_fields()}
                            for field_name, field_value in list(fields.items()):
                                if field_name in model_fields:
                                    field = model_fields[field_name]
                                    # Si es ForeignKey y el valor no existe, establecer como None
                                    if isinstance(field, models.ForeignKey):
                                        if field_value is not None:
                                            try:
                                                related_model = field.related_model
                                                if not related_model.objects.filter(pk=field_value).exists():
                                                    # Si el campo permite null, establecer como None
                                                    if field.null:
                                                        fields[field_name] = None
                                                    else:
                                                        # Si no permite null, eliminar el campo del fixture
                                                        del fields[field_name]
                                            except Exception:
                                                # Si hay error al verificar, establecer como None si permite null
                                                if field.null:
                                                    fields[field_name] = None
                                                else:
                                                    del fields[field_name]

                            # Establecer campos de auditoría como None durante la carga inicial
                            if 'created_by' in model_fields and 'created_by' not in fields:
                                fields['created_by'] = None
                            if 'updated_by' in model_fields and 'updated_by' not in fields:
                                fields['updated_by'] = None

                            # Crear o actualizar el objeto
                            # El método save() de MyModel ahora respeta el flag loading_initial_data
                            model_class.objects.update_or_create(
                                pk=pk,
                                defaults=fields
                            )
            except Exception as e:
                print(f"[App] Error al cargar {fixture_name}: {e}")
                # No lanzar excepción para permitir continuar con otros fixtures
                # raise IntegrityError(f"[App] Error al cargar {fixture_name}: {e}")

        thread_context.loading_initial_data = False
