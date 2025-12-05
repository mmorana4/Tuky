from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet


class SolicitudViajeView(ViewSet):
    permission_classes = (IsAuthenticated,)
    
    @action(methods=['post'], detail=False)
    def crear(self, request):
        from .controller import SolicitudViajeController
        controller = SolicitudViajeController(request=request)
        return controller.crear()
    
    @action(methods=['get'], detail=False)
    def disponibles(self, request):
        from .controller import SolicitudViajeController
        controller = SolicitudViajeController(request=request)
        return controller.listar_disponibles()
    
    @action(methods=['post'], detail=False)
    def aceptar(self, request):
        from .controller import SolicitudViajeController
        controller = SolicitudViajeController(request=request)
        return controller.aceptar()
    
    @action(methods=['post'], detail=False)
    def cancelar(self, request):
        from .controller import SolicitudViajeController
        controller = SolicitudViajeController(request=request)
        return controller.cancelar()




