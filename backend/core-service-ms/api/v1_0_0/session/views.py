from functools import wraps
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class BranchView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        from .controller import SessionController
        e_controller = SessionController(request)
        return e_controller.list_branches()

    def post(self, request):
        from .controller import SessionController
        e_controller = SessionController(request)
        return e_controller.set_branch()


class RolView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        from .controller import SessionController
        e_controller = SessionController(request)
        return e_controller.list_roles()

    def post(self, request):
        from .controller import SessionController
        e_controller = SessionController(request)
        return e_controller.set_role()
