from django.db.models import Q
from core.my_business import MyBusiness
from helpers.service_helper import HelperService

class CarreraService(MyBusiness):

    def __init__(self, request):
        self.request = request

    def datatable(self):
        from security.models import Carrera
        from .serializers import CarreraSerializer

        o_bus = HelperService()
        try:
            # --- Parámetros de búsqueda y paginación ---
            search = self.request.query_params.get('sSearch', '')
            limit = int(self.request.query_params.get('iDisplayLength', 10))
            offset = int(self.request.query_params.get('iDisplayStart', 0))

            # --- Parámetros de ordenamiento ---
            sort_by = self.request.query_params.get('sort_by', 'nombre')
            sort_dir = self.request.query_params.get('sort_dir', 'asc')

            # Validar dirección
            if sort_dir not in ['asc', 'desc']:
                sort_dir = 'asc'

            # Aplicar prefijo de ordenamiento
            order_by = f"-{sort_by}" if sort_dir == 'desc' else sort_by

            # --- Filtro de búsqueda ---
            conditions = (
                    Q(nombre__icontains=search)
                    | Q(nombre_mostrar__icontains=search)
            )
            # --- Llamar método del manager (tu implementación) ---
            aData, iTotalRecords, iTotalDisplayRecords = Carrera.objects.datatable(conditions=conditions,
                                                                                   limit=limit,
                                                                                   offset=offset,
                                                                                   order_by=order_by)
            aaData = CarreraSerializer(aData, many=True, context={'request': self.request}).data if aData else []
            o_bus.set_success(is_success=True)
            o_bus.set_data(data={
                'aaData': aaData,
                'iTotalRecords': iTotalRecords,
                'iTotalDisplayRecords': iTotalDisplayRecords
            })



        except Exception as e:
            o_bus.set_success(False)
            o_bus.set_message(f'ocurrio un error: {str(e)}')
        return o_bus.to_dict()

