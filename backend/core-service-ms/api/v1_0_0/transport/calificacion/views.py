from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet


class CalificacionView(ViewSet):
    permission_classes = (IsAuthenticated,)
    
    @action(methods=['post'], detail=False)
    def calificar(self, request):
        from .controller import CalificacionController
        controller = CalificacionController(request=request)
        return controller.calificar()
    
    @action(methods=['get'], detail=False)
    def mis_calificaciones(self, request):
        from .controller import CalificacionController
        controller = CalificacionController(request=request)
        return controller.mis_calificaciones()
    
    @action(methods=['get'], detail=False)
    def recibidas(self, request):
        from .controller import CalificacionController
        controller = CalificacionController(request=request)
        return controller.recibidas()




