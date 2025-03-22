from rest_framework import serializers
from .models import *
from django.core.exceptions import ValidationError


class RendezVousSerializer(serializers.ModelSerializer):

    class Meta :
        model = RendezVous
        fields = ['docteur', 'patient', 'date','description']
    
    def validate(self, data):
        docteur = data['docteur']
        date = data['date']
        rendezvous_count = RendezVous.objects.filter(date = date , docteur = docteur).count()
        date_unique = RendezVous.objects.filter(date = date, docteur = docteur).exists()
        if rendezvous_count >= 20 :
            raise ValidationError("ce jour est remplie , veuillez selectionner un autre jour")
        
        if date_unique :
            raise ValidationError("ce docteur a deja un rendez vous a cette date")

        return data