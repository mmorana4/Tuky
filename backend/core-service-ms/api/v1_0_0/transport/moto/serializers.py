from security.models import Moto
from helpers.model_helper import HelperSerializerModel


class MotoSerializer(HelperSerializerModel):
    class Meta:
        model = Moto
        fields = [
            'id', 'conductor', 'marca', 'modelo', 'año', 'placa',
            'color', 'cilindrada', 'foto', 'documentos_verificados',
            'is_active_moto'
        ]
        read_only_fields = ['id', 'conductor']




