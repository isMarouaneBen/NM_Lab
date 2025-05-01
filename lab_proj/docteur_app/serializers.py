from rest_framework import serializers
from .models import *

class MessageSerializer(serializers.ModelSerializer):
    '''
        ce serialiseur a pour but de convertir les messages d'aprés models.py(la base de donnée) sous format JSON.
    '''

    class Meta :
        model = Message
        fields = '__all__'
        
    def create(self, validated_data):
        message = Message.objects.create(**validated_data)
        return message

class PrescriptionSerializer(serializers.ModelSerializer):
    patient_cin = serializers.CharField(write_only=True)
    date_rendezvous = serializers.DateTimeField(write_only=True)
    
    class Meta:
        model = Prescription
        fields = ['id', 'patient_cin', 'date_rendezvous', 'diagnostique', 'traitment', 'notes']
    
    def create(self, validated_data):
        patient_cin = validated_data.pop('patient_cin')
        date_rdv = validated_data.pop('date_rendezvous')
        
        try:
            patient = Patient.objects.get(cin=patient_cin)
        except Patient.DoesNotExist:
            raise serializers.ValidationError({"patient_cin": "Patient with this CIN does not exist."})
        
        try:
            rdv = RendezVous.objects.filter(patient=patient, date=date_rdv).first()
        except RendezVous.DoesNotExist:
            raise serializers.ValidationError({"date_rendezvous": "Appointment not found for this patient at the specified time."})
        
        prescription = Prescription.objects.create(
            date=rdv,
            **validated_data
        )
        return prescription

