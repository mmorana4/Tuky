from django import forms
from security.models import SolicitudViaje


class SolicitudViajeForm(forms.ModelForm):
    class Meta:
        model = SolicitudViaje
        fields = [
            'origen_lat', 'origen_lng', 'origen_direccion',
            'destino_lat', 'destino_lng', 'destino_direccion',
            'precio_solicitado', 'metodo_pago', 'fecha_expiracion'
        ]


