from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet


class CarreraView(ViewSet):
    permission_classes = (IsAuthenticated,)

    @action(methods=['get'], detail=False)
    def datatable(self, request):
        from .controller import CarreraController
        controller = CarreraController(request=request)
        return controller.datatable()
        
        