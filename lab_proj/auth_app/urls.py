from django.urls import path
from .views import (
    PatientRegisterationView,
    DoctorRegisterationView,
    UserLoginView,
    UserLogoutVIew,
    PasswordResetView,
    PasswordConfirmation
)

urlpatterns = [
    path('register/patient/', PatientRegisterationView.as_view(), name='patient-register'),
    path('register/doctor/', DoctorRegisterationView.as_view(), name='doctor-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutVIew.as_view(), name='user-logout'),
    path('password/reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password/reset/<uuid:reset_id>/confirm/', PasswordConfirmation.as_view(), name='password-reset-confirm'),
]