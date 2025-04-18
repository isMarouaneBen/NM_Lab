from django.urls import path
from . import views

urlpatterns = [
    # Rendez-vous
    path('api/annuler-rdv/<int:rendez_vous_id>/', views.docteurCancelRendezvousView, name='annuler_rdv'),
    path('api/rdv-prochains/', views.upcomingRendezvousView, name='rdv_prochains'),
    path('api/rdv-aujourdhui/', views.todayRendezVousView, name='rdv_aujourdhui'),
    
    # Prescriptions
    path('api/creer-prescription/', views.writePrescriptionView, name='creer_prescription'),
    path('api/historique-prescriptions/<str:cin>/', views.historicPrescriptionView, name='historique_prescriptions'),
    
    # Messages
    path('api/envoyer-message/', views.writeMessageView, name='envoyer_message'),
    path('api/boite-reception/', views.seeMessagesView, name='boite_reception'),
]