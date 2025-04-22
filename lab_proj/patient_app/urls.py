from django.urls import path
from .views import *

urlpatterns = [
    path('next-rdv/<str:cin>/',nextAppointmentView,name='next-rdv'),
    path('list-doctors/',ListDoctorsViews,name='list-doctors'),
    path('rendezvous/reserver/', ReserverRendezvousView, name='reserver_rendezvous'),
    path('rendezvous/historique/<str:cin>/', historicRendezvousView, name='historique_rendezvous'),
    path('rendezvous/annuler/<int:rendez_vous_id>/', cancelRendezvousView, name='annuler_rendezvous'),
    path('messages/envoyer-message/', writeMessageView, name='write_message'),
    path('messages/voir-messages/', seeMessagesView, name='see_messages'),
    path('prescriptions/voirprescriptions/', patientPrescriptionsView, name='patient_prescriptions'),
]
