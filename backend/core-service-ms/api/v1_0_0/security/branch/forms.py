from django import forms
from core.my_form import MyForm
from security.models import Company


class CompanyBranchForm(MyForm):
    id = forms.IntegerField(
        required=False,
        initial=0
    )
    company = forms.ModelChoiceField(
        required=True,
        queryset=Company.objects.all(),
        error_messages={
            'required': 'Campo no debe estar vacío',
        }
    )
    name = forms.CharField(
        required=True,
        max_length=255, initial='',
        error_messages={
            'required': 'Campo no debe estar vacío',
            'max_length': 'Campo no debe mayor a 255 caracteres'
        }
    )
    short_name = forms.CharField(
        required=True,
        max_length=100, initial='',
        error_messages={
            'required': 'Campo no debe estar vacío',
            'max_length': 'Campo no debe mayor a 100 caracteres'
        }
    )
    phone = forms.CharField(
        required=False,
        max_length=20, initial='',
        error_messages={
            'required': 'Campo no debe estar vacío',
            'max_length': 'Campo no debe mayor a 20 caracteres'
        }
    )
    email = forms.EmailField(
        required=False,
        max_length=320, initial='',
        error_messages={
            'required': 'Campo no debe estar vacío',
            'max_length': 'Campo no debe mayor a 320 caracteres',
            'invalid': 'Ingrese un email valido'
        }
    )
    address = forms.CharField(
        required=False
    )
    is_main = forms.BooleanField(required=False)
    is_current = forms.BooleanField(required=False)

    def clean(self, *args, **kwargs):
        cleaned_data = super(CompanyBranchForm, self).clean(*args, **kwargs)
        return cleaned_data
