from django.urls import path
from .views import ReserverRendezvousView, historicRendezvousView, cancelRendezvousView

urlpatterns = [
    path('rendezvous/reserver/', ReserverRendezvousView, name='reserver_rendezvous'),
    path('rendezvous/historique/<str:cin>/', historicRendezvousView, name='historique_rendezvous'),
    path('rendezvous/annuler/<int:rendez_vous_id>/', cancelRendezvousView, name='annuler_rendezvous'),
]
