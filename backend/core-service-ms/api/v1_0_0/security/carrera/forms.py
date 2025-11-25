from django import forms
from core.my_form import MyForm

class CarreraForm(MyForm):
    id = forms.IntegerField(
        required=False,
        initial=0
    )
    nombre = forms.CharField(
        required=True,
        max_length=100,
        error_messages={
            'required': 'Campo no debe estar vacío',
            'max_length': 'Campo no debe mayor a 100 caracteres'
        }
    )
    nombre_mostrar = forms.CharField(
        required=True,
        max_length=80,
        error_messages={
            'required': 'Campo no debe estar vacío',
            'max_length': 'Campo no debe mayor a 80 caracteres'
        }
    )
    vigente = forms.BooleanField(required=False)
    def clean(self, *args, **kwargs):
        cleaned_data = super(CarreraForm, self).clean(*args, **kwargs)
        return cleaned_data