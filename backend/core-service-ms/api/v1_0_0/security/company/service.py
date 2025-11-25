from django.db.models import Q
from rest_framework import status
from helpers.service_helper import HelperService
from core.my_business import MyBusiness


class CompanyService(MyBusiness):

    def __init__(self, request):
        self.request = request

    def datatable(self):
        from security.models import Company
        from .serializers import CompanySerializer
        o_bus = HelperService()
        try:
            user = self.request.user
            is_superuser = user.is_superuser
            # --- Parámetros de búsqueda y paginación ---
            search = self.request.query_params.get('sSearch', '')
            limit = int(self.request.query_params.get('iDisplayLength', 10))
            offset = int(self.request.query_params.get('iDisplayStart', 0))

            # --- Parámetros de ordenamiento ---
            sort_by = self.request.query_params.get('sort_by', 'name')
            sort_dir = self.request.query_params.get('sort_dir', 'asc')

            # Validar dirección
            if sort_dir not in ['asc', 'desc']:
                sort_dir = 'asc'

            # Aplicar prefijo de ordenamiento
            order_by = f"-{sort_by}" if sort_dir == 'desc' else sort_by

            # --- Filtro de búsqueda ---
            conditions = (
                    Q(ruc__icontains=search)
                    | Q(name__icontains=search)
                    | Q(short_name__icontains=search)
            )
            if not is_superuser:
                conditions &= Q(is_active=True)

            # --- Llamar método del manager (tu implementación) ---
            aData, iTotalRecords, iTotalDisplayRecords = Company.objects.datatable(conditions=conditions,
                                                                                   limit=limit,
                                                                                   offset=offset,
                                                                                   order_by=order_by)
            aaData = CompanySerializer(aData, many=True, context={'request': self.request}).data if aData else []
            o_bus.set_success(is_success=True)
            o_bus.set_data(data={
                'aaData': aaData,
                'iTotalRecords': iTotalRecords,
                'iTotalDisplayRecords': iTotalDisplayRecords
            })
        except Exception as e:
            o_bus.set_success(is_success=False)
            o_bus.set_message(message=str(e))
        return o_bus

    def load(self, id):
        from security.models import Company
        from .serializers import CompanySerializer
        o_bus = HelperService()
        try:
            try:
                company = Company.objects.get(pk=id)
            except Company.DoesNotExist:
                raise NameError(u"No se encontro empresa")
            serialized_data = CompanySerializer(company).data
            o_bus.set_data({"company": serialized_data})
            o_bus.set_success(True)
        except Exception as ex:
            o_bus.set_success(False)
            o_bus.set_message(f"{ex.__str__()}")
        return o_bus

    def save(self, cleaned_data):
        from security.models import Company
        from .serializers import CompanySerializer
        o_bus = HelperService()
        try:
            id = cleaned_data.get('id', 0)
            try:
                company = Company.objects.get(pk=id)
                company.ruc = cleaned_data['ruc']
                company.name = cleaned_data['name']
                company.short_name = cleaned_data['short_name']
                company.website = cleaned_data['website']
                company.address = cleaned_data['address']
            except Company.DoesNotExist:
                company = Company(ruc=cleaned_data['ruc'],
                                  name=cleaned_data['name'],
                                  short_name=cleaned_data['short_name'],
                                  website=cleaned_data['website'],
                                  address=cleaned_data['address'])
            company.save(self.request)
            o_bus.set_data({"id": company.id})
            o_bus.set_success(True)
        except Exception as ex:
            o_bus.set_success(False)
            o_bus.set_message(f"{ex.__str__()}")
        return o_bus
