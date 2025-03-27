from django.db import models
from auth_app.models import  Docteur, Patient,User
from patient_app.models import RendezVous

class Prescription(models.Model):
    date = models.ForeignKey(RendezVous, on_delete=models.CASCADE)
    diagnostique = models.TextField(blank = False)
    traitment = models.TextField(blank = False)
    notes = models.TextField(max_length=256, blank = True)

class Message(models.Model):
    objet = models.CharField(max_length=50, blank=False)
    envoie = models.ForeignKey(User , on_delete=models.CASCADE, related_name="message_envoyé")
    reception = models.ForeignKey(User,  on_delete=models.CASCADE, related_name="message_recu")
    message_content = models.TextField()
    date_message = models.DateTimeField(auto_now_add=True)



