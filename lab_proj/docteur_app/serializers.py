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
   '''
    -serialiseur des prescriptions medicaux ecrites par le medcin associé.
    -pour les demandes en methodes POST : 
    {
        'patient_cin':
        'date_rendezvous':
        'diagnostique':
        'traitment':
        'notes':
    }
   '''
   patient_cin = serializers.CharField(write_only=True) 
   date_rendezvous = serializers.DateTimeField(source = 'date.date') 
   
   class Meta:
       model = Prescription
       fields = ['patient_cin', 'date_rendezvous', 'diagnostique', 'traitment', 'notes']    
   
   def create(self, validated_data):
       patient_cin = validated_data.pop('patient_cin')
       date_rdv = validated_data.pop('date_rendezvous')     
       
       patient = Patient.objects.get(cin=patient_cin)
       rdv = RendezVous.objects.get(patient=patient, date=date_rdv)
       
       prescription = Prescription.objects.create(
           date=rdv,
           **validated_data
       )
       return prescription

