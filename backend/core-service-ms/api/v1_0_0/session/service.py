from django.db.models import Q
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from helpers.service_helper import HelperService
from core.my_business import MyBusiness


class SessionService(MyBusiness):

    def __init__(self, request):
        self.request = request

    def list_branches(self):
        from security.models import User
        from .serializers import CompanyBranchSerializer
        o_bus = HelperService()
        try:
            user = self.request.user
            branches = user.my_branches_current
            if not branches.exists():
                raise NameError('Usuario no tiene asignada sedes')
            serializer = CompanyBranchSerializer(branches, many=True, context={'request': self.request})
            o_bus.set_success(is_success=True)
            o_bus.set_data(data={'branches': serializer.data})
        except Exception as e:
            o_bus.set_success(is_success=False)
            o_bus.set_message(message=str(e))
        return o_bus

    def set_branch(self):
        from security.models import User, CompanyBranch
        o_bus = HelperService()
        try:
            branch_id = self.request.data.get("id")
            try:
                branch = CompanyBranch.objects.get(id=branch_id)
            except CompanyBranch.DoesNotExist:
                raise NameError('Sede no encontrada')
            user = self.request.user
            branches = user.my_branches_current
            if not branches.filter(pk=branch.id).exists():
                raise NameError('Sede seleccionada no permitida')
            refresh = RefreshToken.for_user(self.request.user)
            refresh["branch_id"] = branch.id  # 👈 agregamos claim personalizado
            o_bus.set_success(is_success=True)
            o_bus.set_data(data={
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            })
        except Exception as e:
            o_bus.set_success(is_success=False)
            o_bus.set_message(message=str(e))
        return o_bus

    def list_roles(self):
        from security.models import User, Role
        from .serializers import RoleSerializer
        o_bus = HelperService()
        try:
            user = self.request.user
            branch_id = self.request.query_params.get('branch_id')
            profiles = user.profiles.filter(is_active=True, is_current=True, branch_id=branch_id)
            if not profiles.exists():
                raise NameError('Usuario no tiene asignado roles en la sede')
            roles = Role.objects.filter(is_active=True, pk__in=profiles.values_list('role__id', flat=True))
            serializer = RoleSerializer(roles, many=True, context={'request': self.request})
            o_bus.set_success(is_success=True)
            o_bus.set_data(data={'roles': serializer.data})
        except Exception as e:
            o_bus.set_success(is_success=False)
            o_bus.set_message(message=str(e))
        return o_bus

    def set_role(self):
        from security.models import User, CompanyBranch, Role
        o_bus = HelperService()
        try:
            branch = self.request.branch

            if not branch:
                raise NameError('Sede no encontrada')
            role_id = self.request.data.get('id')
            try:
                role = Role.objects.get(id=role_id)
            except Role.DoesNotExist:
                raise NameError('Rol no encontrado')
            user = self.request.user
            profiles = user.profiles.filter(is_active=True, is_current=True, branch_id=branch.id)
            if not profiles.exists():
                raise NameError('Usuario no tiene asignado roles en la sede')
            roles = Role.objects.filter(is_active=True, pk__in=profiles.values_list('role__id', flat=True))
            if not roles.filter(pk=role.id).exists():
                raise NameError('Rol seleccionado no permitida')
            refresh = RefreshToken.for_user(self.request.user)
            refresh["branch_id"] = branch.id  # 👈 agregamos claim personalizado
            refresh["role_id"] = role.id  # 👈 agregamos claim personalizado
            o_bus.set_success(is_success=True)
            o_bus.set_data(data={
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            })
        except Exception as e:
            o_bus.set_success(is_success=False)
            o_bus.set_message(message=str(e))
        return o_bus
