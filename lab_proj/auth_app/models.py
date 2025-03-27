from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from rest_framework.authtoken.models import Token
import uuid
from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    '''
    Django vient normalement avec un UserManager prédefinie pour le model User , mais à cause du personnalisation des entités 
    (on a met username correspond a l'email car on a pas besoin des 'usernames') on doit falloire faireun UserManager personnalisé 
    '''
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("l'email doit etre fourni")
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)
class User(AbstractUser):
    '''
    l'entité user personnalisé qui hérite de la classe AbstractUser , demande un email et le role d'utilisateur (soit patient ou docteur) et crée l'utilisateur correspondant.
    '''
    created_when = models.DateTimeField(auto_now_add=True)
    email = models.EmailField(unique = True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS =[]
    ROLES = [
        (('docteur'),('Docteur')),
        (('patient'),('Patient')),
    ]
    role = models.CharField(max_length=15, choices=ROLES)
    
    objects = CustomUserManager()


    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)
    

class Docteur(models.Model):
    '''
    cette entitée pour définire les docteurs dans la base de données , chaque docteur est associé à un seul et unique utilisateur (ci-dessus).
    chaque docteur peut avoir ou pas une specialité (la valeur par defaut c'est generaliste). 
    '''
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialite = models.CharField(max_length=100, default='generaliste', blank=True)

class Patient(models.Model):
    '''
        entité qui represente chaque patient dans la base de données .
        un patient est definie par :
        -date de naissance
        -numero d'identité
        -sexe
        -allergies(s'il y en a un)
        -groupe sanguin

    '''
    GROUPES_SANGUINS = (
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    )

    ALLERGIES = (
        ('Respiratoires', 'Respiratoires'),
        ('Alimentaires', 'Alimentaires'),
        ('Medicamenteuses', 'Medicamenteuses'),
        ('Autre', 'Autre'),
        ('Aucun', 'Aucun'),
    )

    GENRES = (
        ('M','Masculin'),
        ('F', 'Fémenin'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_naissance = models.DateField()
    cin = models.CharField(max_length=15, unique=True)
    sexe = models.CharField(max_length=1,choices=GENRES)
    allergies = models.CharField(max_length=20, choices=ALLERGIES)
    groupe_sanguin = models.CharField(max_length=3,choices=GROUPES_SANGUINS)
    

class PasswordReset(models.Model):
    '''une entitée qui représente les utilisateurs qui on demandé une réinitialisation de mot de passe (Password Reset).'''
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reset_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_when = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Password reset de {self.user.username} à {self.created_when}"