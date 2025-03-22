from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from rest_framework.authtoken.models import Token
import uuid
from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
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
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialite = models.CharField(max_length=100, default='generaliste', blank=True)

class Patient(models.Model):
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
    allergiees = models.CharField(max_length=20, choices=ALLERGIES)
    groupe_sanguin = models.CharField(max_length=3,choices=GROUPES_SANGUINS)
    

class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reset_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_when = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Password reset for {self.user.username} at {self.created_when}"