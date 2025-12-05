from django import forms
from security.models import Calificacion


class CalificacionForm(forms.ModelForm):
    class Meta:
        model = Calificacion
        fields = ['viaje', 'calificado', 'puntuacion', 'comentario']




