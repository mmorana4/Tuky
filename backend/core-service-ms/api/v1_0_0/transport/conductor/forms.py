from django import forms
from security.models import Conductor


class ConductorForm(forms.ModelForm):
    class Meta:
        model = Conductor
        fields = [
            'telefono', 'licencia_numero', 'licencia_vencimiento',
            'estado', 'ubicacion_actual_lat', 'ubicacion_actual_lng'
        ]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Hacer opcionales los campos que no son requeridos para el registro inicial
        self.fields['estado'].required = False
        self.fields['ubicacion_actual_lat'].required = False
        self.fields['ubicacion_actual_lng'].required = False




