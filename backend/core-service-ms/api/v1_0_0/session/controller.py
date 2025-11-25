from helpers.response_helper import HelperResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


class SessionController:

    def __init__(self, request):
        self.request = request
        self.response = HelperResponse()

    def list_branches(self):
        from .service import SessionService
        try:
            service = SessionService(self.request)
            o_bus = service.list_branches()
            if not o_bus.is_success:
                raise NameError(o_bus.message)
            data = o_bus.get_data()
            branches = data.get("branches", [])
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_data({'branches': branches})
        except Exception as ex:
            self.response.set_success(False)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message(f"{ex.__str__()}")
        return self.response.to_dict()

    def set_branch(self):
        from .service import SessionService
        try:
            service = SessionService(self.request)
            o_bus = service.set_branch()
            if not o_bus.is_success:
                raise NameError(o_bus.message)
            data = o_bus.get_data()
            access = data.get("access", None)
            refresh = data.get("refresh", None)
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_data({
                "access": access,
                "refresh": refresh,
            })
        except Exception as ex:
            self.response.set_success(False)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message(f"{ex.__str__()}")
        return self.response.to_dict()

    def list_roles(self):
        from .service import SessionService
        try:
            service = SessionService(self.request)
            o_bus = service.list_roles()
            if not o_bus.is_success:
                raise NameError(o_bus.message)
            data = o_bus.get_data()
            roles = data.get("roles", [])
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_data({'roles': roles})
        except Exception as ex:
            self.response.set_success(False)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message(f"{ex.__str__()}")
        return self.response.to_dict()

    def set_role(self):
        from .service import SessionService
        try:
            service = SessionService(self.request)
            o_bus = service.set_role()
            if not o_bus.is_success:
                raise NameError(o_bus.message)
            data = o_bus.get_data()
            access = data.get("access", None)
            refresh = data.get("refresh", None)
            self.response.set_success(True)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_data({
                "access": access,
                "refresh": refresh,
            })
        except Exception as ex:
            self.response.set_success(False)
            self.response.set_status(status.HTTP_200_OK)
            self.response.set_message(f"{ex.__str__()}")
        return self.response.to_dict()
