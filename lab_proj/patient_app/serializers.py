from rest_framework import serializers
from .models import *
from django.core.exceptions import ValidationError


class RendezVousSerializer(serializers.ModelSerializer):
    docteur_nom = serializers.CharField(source='docteur.user.get_full_name', read_only=True)
    patient_nom = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    
    class Meta:
        model = RendezVous
        fields = [ 'docteur_nom','patient_nom', 'date', 'description', 'etat']
    
    def validate(self, data):
        docteur = data['docteur']
        date = data['date']
        
        appointment_exists = RendezVous.objects.filter(
            docteur=docteur,
            date=date
        ).exists()
        
        if appointment_exists:
            raise serializers.ValidationError("Ce docteur a déjà un rendez-vous à cette date et heure")
        
        appointment_date = date.date()
        daily_count = RendezVous.objects.filter(
            docteur=docteur,
            date__date=appointment_date
        ).count()
        
        if daily_count >= 20:
            raise serializers.ValidationError("Ce jour est complet, veuillez sélectionner un autre jour")
            
        return data