from django.contrib import admin
from .models import Docteur, User, Patient
# Register your models here.

admin.site.register(Docteur)
admin.site.register(User)
admin.site.register(Patient)