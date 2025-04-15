from django.urls import path
from .views import *

urlpatterns = [
    path('monthly-patients/',monthlyPatientView, name = 'monthly-patients'),
    path('today-rendezvous-count/',CountTodayRendezVousView, name = 'today-rendezvous-count' ),
    path('moyen-age', MoyenAgeView , name = 'moyen-age'),

]