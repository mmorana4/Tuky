from django import forms
from core.my_form import MyForm


class CompanyForm(MyForm):
    id = forms.IntegerField(
        required=False,
        initial=0
    )
    ruc = forms.CharField(
        required=True,
        max_length=20, initial='',
        error_messages={
            'required': 'Campo no debe estar vacío',
            'max_length': 'Campo no debe mayor a 50 caracteres'
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
    website = forms.CharField(
        required=False,
        max_length=255, initial='',
        error_messages={
            'required': 'Campo no debe estar vacío',
            'max_length': 'Campo no debe mayor a 255 caracteres'
        }
    )
    address = forms.CharField(
        required=False
    )

    def clean(self, *args, **kwargs):
        cleaned_data = super(CompanyForm, self).clean(*args, **kwargs)
        return cleaned_data
