from django import forms
from security.models import Moto


class MotoForm(forms.ModelForm):
    class Meta:
        model = Moto
        fields = [
            'marca', 'modelo', 'año', 'placa', 'color', 'cilindrada'
        ]




