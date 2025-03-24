from rest_framework import serializers
from .models import *

class MessageSerializer(serializers.ModelSerializer):
    envoyeur_email = serializers.CharField(source='envoie.username', read_only=True)
    recepteur_email = serializers.CharField(source='reception.username', read_only=True)

    class Meta :
        model = Message
        fields = ['envoyeur_email', 'recepteur_email', 'objet','date', 'message_content', 'date_message']

class PrescriptionSerializer(serializers.ModelSerializer):
    patient_cin = serializers.CharField(write_only=True) 
    docteur_id = serializers.IntegerField(write_only=True) 
    docteur_nom = serializers.CharField(source="docteur.user.get_full_name", read_only=True)  
    date_rendez_vous = serializers.DateTimeField(source="date", read_only=True)  
    class Meta:
        model = Prescription
        fields = ['patient_cin', 'docteur_id', 'docteur_nom', 'date_rendez_vous', 'diagnostique', 'traitment', 'notes']    
    def create(self, validated_data):
        patient_cin = validated_data.pop('patient_cin')
        docteur_id = validated_data.pop('docteur_id')     
        try:
            patient = Patient.objects.get(cin=patient_cin)
            docteur = Docteur.objects.get(id=docteur_id)
        except (Patient.DoesNotExist, Docteur.DoesNotExist) as e:
            raise serializers.ValidationError(str(e))
        prescription = Prescription.objects.create(
            patient=patient,
            docteur=docteur,
            **validated_data
        )
        return prescription

