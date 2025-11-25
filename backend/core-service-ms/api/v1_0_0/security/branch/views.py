from functools import wraps
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet
from helpers.decorators_helper import login_required


def login_required_wrapper(func):
    @wraps(func)
    def inner(self, request, *args, **kwargs):
        return login_required(func)(self, request, *args, **kwargs)
        # return func(self, request, *args, **kwargs)

    return inner


class CompanyBranchView(ViewSet):
    permission_classes = (IsAuthenticated,)

    @action(methods=['get'], detail=False)
    @login_required_wrapper
    def datatable(self, request):
        from .controller import CompanyBranchController
        controller = CompanyBranchController(request)
        return controller.datatable()

    @action(methods=['get'], detail=False)
    @login_required_wrapper
    def companies(self, request):
        from .controller import CompanyBranchController
        controller = CompanyBranchController(request)
        return controller.companies()

    @action(methods=['get'], detail=False)
    @login_required_wrapper
    def load(self, request):
        from .controller import CompanyBranchController
        controller = CompanyBranchController(request)
        return controller.load()

    @action(methods=['post'], detail=False)
    @login_required_wrapper
    def save(self, request):
        from .controller import CompanyBranchController
        controller = CompanyBranchController(request)
        return controller.save()

    @action(methods=['post'], detail=False)
    @login_required_wrapper
    def delete(self, request):
        from .controller import CompanyBranchController
        controller = CompanyBranchController(request)
        return controller.delete()
