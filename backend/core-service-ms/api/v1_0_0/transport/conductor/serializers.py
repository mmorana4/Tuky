from security.models import Conductor
from helpers.model_helper import HelperSerializerModel


class ConductorSerializer(HelperSerializerModel):
    class Meta:
        model = Conductor
        fields = [
            'id', 'user', 'telefono', 'foto_perfil', 'licencia_numero',
            'licencia_vencimiento', 'calificacion_promedio', 'total_viajes',
            'estado', 'ubicacion_actual_lat', 'ubicacion_actual_lng',
            'ultima_actualizacion_ubicacion', 'documentos_verificados', 'es_verificado'
        ]
        read_only_fields = ['id', 'calificacion_promedio', 'total_viajes', 'ultima_actualizacion_ubicacion']




