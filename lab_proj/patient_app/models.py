from django.db import models
from auth_app.models import Docteur, Patient

class RendezVous(models.Model):
    ETATS = [
        ('planifié','Planifié'),
        ('completé','Completé'),
        ('annulé','Annulé'),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    docteur = models.ForeignKey(Docteur, on_delete=models.CASCADE)
    date = models.DateTimeField()
    etat = models.CharField(max_length=10, choices=ETATS, default=ETATS[0])
    description = models.CharField(max_length=256, blank=True)

