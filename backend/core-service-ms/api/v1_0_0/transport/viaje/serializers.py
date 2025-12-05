from security.models import Viaje
from helpers.model_helper import HelperSerializerModel


class ViajeSerializer(HelperSerializerModel):
    class Meta:
        model = Viaje
        fields = [
            'id', 'pasajero', 'conductor', 'moto', 'origen_lat', 'origen_lng',
            'origen_direccion', 'destino_lat', 'destino_lng', 'destino_direccion',
            'precio_solicitado', 'precio_final', 'metodo_pago', 'pagado',
            'estado', 'fecha_solicitud', 'fecha_aceptacion', 'fecha_inicio',
            'fecha_finalizacion', 'calificacion_conductor', 'calificacion_pasajero',
            'comentario_conductor', 'comentario_pasajero', 'distancia_km',
            'tiempo_estimado_minutos'
        ]
        read_only_fields = ['id', 'fecha_solicitud']




