from django import forms
from security.models import Conductor


class ConductorForm(forms.ModelForm):
    class Meta:
        model = Conductor
        fields = [
            'telefono', 'licencia_numero', 'licencia_vencimiento',
            'estado', 'ubicacion_actual_lat', 'ubicacion_actual_lng'
        ]




