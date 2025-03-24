from django.urls import path
from .views import *

urlpatterns = [
    path('rendezvous/reserver/', ReserverRendezvousView, name='reserver_rendezvous'),
    path('rendezvous/historique/<str:cin>/', historicRendezvousView, name='historique_rendezvous'),
    path('rendezvous/annuler/<int:rendez_vous_id>/', cancelRendezvousView, name='annuler_rendezvous'),
    path('envoyer-message/', writeMessageView, name='write_message'),
    path('voir-messages/', seeMessagesView, name='see_messages'),
    path('voirprescriptions/', patientPrescriptionsView, name='patient_prescriptions'),
]
