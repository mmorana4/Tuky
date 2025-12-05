from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet


class ConductorView(ViewSet):
    permission_classes = (IsAuthenticated,)
    
    @action(methods=['post'], detail=False)
    def registrar(self, request):
        from .controller import ConductorController
        controller = ConductorController(request=request)
        return controller.registrar()
    
    @action(methods=['get'], detail=False)
    def perfil(self, request):
        from .controller import ConductorController
        controller = ConductorController(request=request)
        return controller.perfil()
    
    @action(methods=['put', 'patch'], detail=False)
    def actualizar(self, request):
        from .controller import ConductorController
        controller = ConductorController(request=request)
        return controller.actualizar()
    
    @action(methods=['post'], detail=False)
    def actualizar_ubicacion(self, request):
        from .controller import ConductorController
        controller = ConductorController(request=request)
        return controller.actualizar_ubicacion()
    
    @action(methods=['post'], detail=False)
    def cambiar_estado(self, request):
        from .controller import ConductorController
        controller = ConductorController(request=request)
        return controller.cambiar_estado()
    
    @action(methods=['post'], detail=False)
    def verificar_documentos(self, request):
        from .controller import ConductorController
        controller = ConductorController(request=request)
        return controller.verificar_documentos()
    
    @action(methods=['get'], detail=False)
    def disponibles(self, request):
        from .controller import ConductorController
        controller = ConductorController(request=request)
        return controller.disponibles()




