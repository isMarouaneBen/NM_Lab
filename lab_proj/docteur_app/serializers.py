from rest_framework import serializers
from .models import *

class MessageSerializer(serializers.ModelSerializer):
    '''
        ce serialiseur a pour but de convertir les messages d'aprés models.py(la base de donnée) sous format JSON.

        -POST : 
        {
            "envoyeur_email": "celui qui envoie l'email",
            "recepteur_email": "celui qui recevoie l'email",
            "objet" : "le sujet du message",
            "date": "date rendez-vous associé",
            "message_content": "contenue du message",
            "date_message": "date d'envoie du message"
        } 
    '''
    envoyeur_email = serializers.CharField(source='envoie.username', read_only=True)
    recepteur_email = serializers.CharField(source='reception.username', read_only=True)

    class Meta :
        model = Message
        fields = ['envoyeur_email', 'recepteur_email', 'objet','date', 'message_content', 'date_message']

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

