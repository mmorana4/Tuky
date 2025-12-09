from core.my_base import MY_FIELDS_AUDIT
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers, status
from rest_framework_simplejwt.serializers import TokenRefreshSerializer, PasswordField
from rest_framework_simplejwt.exceptions import AuthenticationFailed, TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from helpers.model_helper import HelperSerializerModel
from helpers.response_helper import HelperResponse

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'type_document', 'document', 'profile']

    def get_profile(self, obj):
        try:
            profile = obj.profiles.filter(is_current=True).first()
            if profile:
                return {
                    'is_conductor': profile.is_conductor,
                    'role': profile.role.name if profile.role else None,
                    'branch': profile.branch.name if profile.branch else None
                }
        except Exception:
            pass
        return {'is_conductor': False}


class SignInSerializer(serializers.Serializer):
    username_field = User.USERNAME_FIELD
    token_class = RefreshToken

    default_error_messages = {
        "no_active_account": u"No se encontró una cuenta activa con las credenciales dadas"
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields[self.username_field] = serializers.CharField()
        self.fields["password"] = PasswordField()

    def validate(self, attrs):
        from django.contrib.auth.models import update_last_login
        from security.models import Profile
        authenticate_kwargs = {
            self.username_field: attrs[self.username_field],
            "password": attrs["password"],
        }
        try:
            authenticate_kwargs["request"] = self.context["request"]
        except KeyError:
            pass

        user = authenticate(**authenticate_kwargs)
        if not api_settings.USER_AUTHENTICATION_RULE(user):
            raise NameError('Credenciales inválidas')
        if not user.is_active:
            raise NameError('Usuario inactivo')

        branches = user.my_branches_current
        roles = user.my_roles_current
        if not branches.exists():
            raise NameError('Usuario no registra sedes asignada.')
        if not roles.exists():
            raise NameError('El usuario no registra roles asignada.')

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, user)

        refresh = self.get_token(user)

        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
        }
        return data

    @classmethod
    def get_token(cls, user):
        try:
            token = cls.token_class.for_user(user)
            # user = UserSerializer(user).data
            # token['user'] = user
            # token['branches'] = CompanyBranchSerializer(list(branches), many=True).data
            # token['roles'] = RoleSerializer(list(roles), many=True).data
            # branch = branches.order_by('is_main').first()
            # if branch:
            #     token['branch'] = CompanyBranchSerializer(branch).data
            # role = roles.first()
            # if branch:
            #     token['branch'] = CompanyBranchSerializer(branch).data
            # if role:
            #     token['role'] = RoleSerializer(role).data
            return token
        except TokenError as e:
            raise InvalidToken(e.args[0])


class MyTokenRefreshSerializer(TokenRefreshSerializer):

    def validate(self, attrs):
        refresh = RefreshToken(attrs['refresh'])
        access = refresh.access_token
        # a = AccessToken()
        data = {}
        if api_settings.ROTATE_REFRESH_TOKENS:
            if api_settings.BLACKLIST_AFTER_ROTATION:
                try:
                    refresh.blacklist()
                except AttributeError:
                    pass

            refresh.set_jti()
            refresh.set_exp()
            data['refresh'] = str(refresh)
        data['access'] = str(access)

        return data

    @classmethod
    def get_token(cls, user):
        try:
            token = super().get_token(user)
            return token
        except TokenError as e:
            raise InvalidToken(e.args[0])

    def options(self, request):
        response = HelperResponse()
        try:
            response.set_success(is_success=True)
            response.set_status(code=status.HTTP_200_OK)
        except Exception as ex:
            response.set_success(is_success=False)
            response.set_message(message='Ocurrio un error: %s' % ex.__str__())
            response.set_status(code=status.HTTP_202_ACCEPTED)
        return response.to_dict()
