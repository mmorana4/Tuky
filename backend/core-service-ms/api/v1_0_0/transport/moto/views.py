from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet


class MotoView(ViewSet):
    permission_classes = (IsAuthenticated,)
    
    @action(methods=['post'], detail=False)
    def crear(self, request):
        from .controller import MotoController
        controller = MotoController(request=request)
        return controller.crear()
    
    @action(methods=['get'], detail=False)
    def listar(self, request):
        from .controller import MotoController
        controller = MotoController(request=request)
        return controller.listar()
    
    @action(methods=['get'], detail=True)
    def detalle(self, request, pk=None):
        from .controller import MotoController
        controller = MotoController(request=request)
        return controller.detalle(pk)
    
    @action(methods=['put', 'patch'], detail=True)
    def actualizar(self, request, pk=None):
        from .controller import MotoController
        controller = MotoController(request=request)
        return controller.actualizar(pk)
    
    @action(methods=['delete'], detail=True)
    def eliminar(self, request, pk=None):
        from .controller import MotoController
        controller = MotoController(request=request)
        return controller.eliminar(pk)
    
    @action(methods=['post'], detail=True)
    def activar(self, request, pk=None):
        from .controller import MotoController
        controller = MotoController(request=request)
        return controller.activar(pk)
    
    @action(methods=['post'], detail=True)
    def subir_foto(self, request, pk=None):
        from .controller import MotoController
        controller = MotoController(request=request)
        return controller.subir_foto(pk)




