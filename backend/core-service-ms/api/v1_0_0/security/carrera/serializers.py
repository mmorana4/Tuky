from security.models import Carrera
from helpers.model_helper import HelperSerializerModel



class CarreraSerializer(HelperSerializerModel):
    class Meta:
        from security.models import Carrera
        model = Carrera
        fields = ['id', 'nombre', 'nombre_mostrar', 'vigente']
