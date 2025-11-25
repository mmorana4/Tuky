from security.models import Calificacion
from helpers.model_helper import HelperSerializerModel


class CalificacionSerializer(HelperSerializerModel):
    class Meta:
        model = Calificacion
        fields = [
            'id', 'viaje', 'calificador', 'calificado', 'puntuacion',
            'comentario', 'fecha_calificacion'
        ]
        read_only_fields = ['id', 'calificador', 'fecha_calificacion']


