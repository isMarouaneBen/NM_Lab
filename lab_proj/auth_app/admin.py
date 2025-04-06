from django.contrib import admin
from .models import User, Docteur, Patient, PasswordReset

admin.site.register(User)
admin.site.register(Docteur)
admin.site.register(Patient)
admin.site.register(PasswordReset)