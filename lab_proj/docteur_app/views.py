from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.utils import timezone
from datetime import datetime, date
from .models import Message, Prescription
from auth_app.models import User
from patient_app.models import RendezVous
from .serializers import PrescriptionSerializer, MessageSerializer
from patient_app.serializers import RendezVousSerializer
from django.db.models import Q

def update_rendez_vous_etat():
    """Met à jour automatiquement l'état des rendez-vous en fonction de la date."""
    RendezVous.objects.filter(
        etat='planifié', 
        date__lt=timezone.now()
    ).update(etat='completé')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def docteur_cancel_rendezvous(request, rendez_vous_id):
    """
    Annule un rendez-vous et notifie le patient par email
    """
    rendez_vous = get_object_or_404(RendezVous, id=rendez_vous_id, docteur__user=request.user)
    
    try:
        rendez_vous.etat = 'annulé'
        rendez_vous.save()
        
        # Envoi d'email
        subject = f"Annulation de votre rendez-vous du {rendez_vous.date.strftime('%d/%m/%Y')}"
        message = f"""
        Bonjour {rendez_vous.patient.user.get_full_name()},

        Votre rendez-vous avec le Dr. {rendez_vous.docteur.user.get_full_name()} 
        prévu le {rendez_vous.date.strftime('%d/%m/%Y à %H:%M')} a été annulé.

        Pour plus d'informations ou reprogrammer un rendez-vous, 
        veuillez contacter le secrétariat.

        Cordialement,
        Équipe NM_LAB
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[rendez_vous.patient.user.email],
            fail_silently=False,
        )
        
        return Response({
            "success": True,
            "message": "Rendez-vous annulé avec succès",
            "patient_notified": True
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "success": False,
            "message": f"Erreur lors de l'annulation: {str(e)}",
            "patient_notified": False
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upcoming_rendezvous(request):
    """
    Liste les rendez-vous à venir pour le docteur connecté
    """
    update_rendez_vous_etat()
    
    appointments = RendezVous.objects.filter(
        docteur__user=request.user,
        date__gte=timezone.now(),
        etat='planifié'
    ).select_related('patient__user', 'docteur__user')
    
    serializer = RendezVousSerializer(appointments, many=True)
    return Response({
        "count": appointments.count(),
        "results": serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_rendezvous(request):
    """
    Liste les rendez-vous du jour pour le docteur connecté
    """
    update_rendez_vous_etat()
    
    today_start = timezone.now().replace(hour=0, minute=0, second=0)
    today_end = today_start.replace(hour=23, minute=59, second=59)
    
    appointments = RendezVous.objects.filter(
        docteur__user=request.user,
        date__range=(today_start, today_end),
        etat='planifié'
    ).select_related('patient__user')
    
    if not appointments.exists():
        return Response({
            "message": "Aucun rendez-vous programmé aujourd'hui",
            "count": 0
        }, status=status.HTTP_200_OK)
        
    serializer = RendezVousSerializer(appointments, many=True)
    return Response({
        "count": appointments.count(),
        "results": serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def write_prescription(request):
    """
    Crée une nouvelle prescription avec validation avancée
    """
    serializer = PrescriptionSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        prescription = serializer.save()
        return Response({
            "success": True,
            "prescription_id": prescription.id,
            "message": "Prescription enregistrée avec succès"
        }, status=status.HTTP_201_CREATED)
        
    return Response({
        "success": False,
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """
    Envoie un message entre utilisateurs avec validation
    """
    required_fields = ['receiver_email', 'message_content', 'objet']
    if not all(field in request.data for field in required_fields):
        return Response({
            "success": False,
            "message": "Tous les champs sont obligatoires"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        receiver = User.objects.get(email=request.data['receiver_email'])
    except User.DoesNotExist:
        return Response({
            "success": False,
            "message": "Destinataire introuvable"
        }, status=status.HTTP_404_NOT_FOUND)
    
    message_data = {
        'objet': request.data['objet'],
        'envoyeur': request.user.id,
        'destinataire': receiver.id,
        'contenu': request.data['message_content']
    }
    
    serializer = MessageSerializer(data=message_data)
    if serializer.is_valid():
        message = serializer.save()
        return Response({
            "success": True,
            "message_id": message.id,
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    return Response({
        "success": False,
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def message_inbox(request):
    """
    Récupère la boîte de messages de l'utilisateur
    """
    messages = Message.objects.filter(
        Q(envoyeur=request.user) | Q(destinataire=request.user)
    ).order_by('-date_message').select_related('envoyeur', 'destinataire')
    
    serializer = MessageSerializer(messages, many=True)
    return Response({
        "count": messages.count(),
        "unread": messages.filter(lu=False, destinataire=request.user).count(),
        "results": serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_prescription_history(request, cin):
    """
    Historique des prescriptions pour un patient donné
    """
    update_rendez_vous_etat()
    
    prescriptions = Prescription.objects.filter(
        date__patient__cin=cin,
        date__docteur__user=request.user
    ).select_related('date__patient__user', 'date__docteur__user')
    
    if not prescriptions.exists():
        return Response({
            "message": "Aucune prescription trouvée pour ce patient",
            "count": 0
        }, status=status.HTTP_200_OK)
        
    serializer = PrescriptionSerializer(prescriptions, many=True)
    return Response({
        "patient_cin": cin,
        "count": prescriptions.count(),
        "results": serializer.data
    })