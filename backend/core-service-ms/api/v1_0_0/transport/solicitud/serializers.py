from security.models import SolicitudViaje
from helpers.model_helper import HelperSerializerModel


class SolicitudViajeSerializer(HelperSerializerModel):
    class Meta:
        model = SolicitudViaje
        fields = [
            'id', 'pasajero', 'origen_lat', 'origen_lng', 'origen_direccion',
            'destino_lat', 'destino_lng', 'destino_direccion', 'precio_solicitado',
            'metodo_pago', 'estado', 'fecha_expiracion', 'fecha_creacion'
        ]
        read_only_fields = ['id', 'pasajero', 'fecha_creacion']


