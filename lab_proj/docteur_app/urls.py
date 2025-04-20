from django.urls import path
from . import views

urlpatterns = [
    path('cancel-rendezvous/<int:rendez_vous_id>/', views.docteurCancelRendezvousView, name='cancel_rendezvous'),
    path('upcoming-rendezvous/', views.upcomingRendezvousView, name='upcoming_rendezvous'),
    path('today-rendezvous/', views.todayRendezVousView, name='today_rendezvous'),
    path('write-prescription/', views.writePrescriptionView, name='write_prescription'),
    path('write-message/', views.writeMessageView, name='write_message'),
    path('see-messages/', views.seeMessagesView, name='see_messages'),
    path('historic-prescriptions/<str:cin>/', views.historicPrescriptionView, name='historic_prescriptions'),
]
