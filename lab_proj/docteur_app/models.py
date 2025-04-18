from django.db import models
from django.core.exceptions import ValidationError
from auth_app.models import Docteur, Patient, User
from patient_app.models import RendezVous

class Prescription(models.Model):
    """
    Modèle pour les prescriptions médicales.
    Relation : 1 prescription = 1 rendez-vous (mais 1 RDV peut avoir 0 ou 1 prescription)
    """
    date = models.ForeignKey(
        RendezVous, 
        on_delete=models.CASCADE,
        verbose_name="Rendez-vous associé",
        help_text="Rendez-vous auquel cette prescription est liée"
    )
    diagnostique = models.TextField(
        blank=False,
        verbose_name="Diagnostic",
        help_text="Description détaillée du diagnostic"
    )
    traitment = models.TextField(
        blank=False,
        verbose_name="Traitement",
        help_text="Médicaments et procédures prescrits"
    )
    notes = models.TextField(
        max_length=500,  # Augmenté pour plus de flexibilité
        blank=True,
        verbose_name="Notes complémentaires",
        help_text="Remarques optionnelles"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière mise à jour"
    )

    class Meta:
        verbose_name = "Prescription médicale"
        verbose_name_plural = "Prescriptions médicales"
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['date'],
                name='unique_prescription_per_rendezvous'
            )
        ]

    def clean(self):
        """Validation personnalisée"""
        if not self.date.patient:
            raise ValidationError("Le rendez-vous doit être associé à un patient")

    def __str__(self):
        return f"Prescription #{self.id} - {self.date.patient} ({self.date.date:%d/%m/%Y})"

class Message(models.Model):
    """
    Modèle pour les messages entre utilisateurs.
    Un message peut être envoyé par un docteur ou un patient, mais pas les deux.
    """
    objet = models.CharField(
        max_length=100,  # Augmenté pour plus de réalisme
        blank=False,
        verbose_name="Sujet du message"
    )
    envoyeur = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="messages_envoyes",
        verbose_name="Expéditeur"
    )
    destinataire = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="messages_recus",
        verbose_name="Destinataire"
    )
    contenu = models.TextField(
        verbose_name="Contenu du message"
    )
    date_message = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'envoi"
    )
    lu = models.BooleanField(
        default=False,
        verbose_name="Message lu"
    )

    # Relations optionnelles pour faciliter les filtres
    docteur = models.ForeignKey(
        Docteur,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Docteur associé"
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Patient associé"
    )

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ['-date_message']
        indexes = [
            models.Index(fields=['envoyeur', 'destinataire']),
            models.Index(fields=['date_message']),
        ]

    def clean(self):
        """Validation des rôles"""
        if self.envoyeur == self.destinataire:
            raise ValidationError("L'expéditeur et le destinataire doivent être différents")
        
        # Vérification de la cohérence docteur/patient
        if self.docteur and self.patient:
            raise ValidationError("Un message ne peut être associé qu'à un seul rôle (docteur OU patient)")

    def save(self, *args, **kwargs):
        """Mise à jour automatique des relations"""
        if hasattr(self.envoyeur, 'docteur'):
            self.docteur = self.envoyeur.docteur
        elif hasattr(self.envoyeur, 'patient'):
            self.patient = self.envoyeur.patient
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.objet} - {self.envoyeur} → {self.destinataire}"