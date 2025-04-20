from django.conf import settings
from django.shortcuts import render
from .models import *
from auth_app.models import User
from .serializers import *
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from datetime import date
from patient_app.serializers import RendezVousSerializer 
from django.utils import timezone
from datetime import datetime

def update_rendez_vous_etat():
    """Met à jour automatiquement l'état des rendez-vous en fonction de la date."""
    maintenant = datetime.now()
    RendezVous.objects.filter(
        etat='planifié', 
        date__lt = maintenant
    ).update(etat='completé')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def docteurCancelRendezvousView(request, rendez_vous_id):
    try:    
        rendez_vous = get_object_or_404(RendezVous, id=rendez_vous_id)
        rendez_vous.delete()
        # subject = "Annulation d'un Rendez vous"
        # message = f"""
        # Bonjour {rendez_vous.patient.user.last_name.upper()},

        # Votre Rendez-vous avec Dr.{rendez_vous.docteur.user.last_name.upper()} à {rendez_vous.date} a été annulé .

        # Pour plus de details ,veuillez contacter le docteur, ou vous pouvez simplement reserver une autre date.

        # on s'excuse et on vous souhaite une bonne journée.
        # Cordialement,
        # Équipe NM_LAB
        # """
        # send_mail(
        #     subject=subject,
        #     message=message,
        #     from_email=settings.DEFAULT_FROM_EMAIL,
        #     recipient_list=[rendez_vous.patient.user.email],
        #     fail_silently=False,
        # )
    except Exception as e:
        return Response({
            "message":f"error : {str(e)}"
        }, status=status.HTTP_400_BAD_REQUEST)
    return Response({
        "message": "rendez-vous annulé avec succées et le patient est informé dans sa boit email"
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upcomingRendezvousView(request):
    update_rendez_vous_etat()
    now = timezone.now()
    appointments = RendezVous.objects.filter(
        date__gte=now,   
        etat='planifié' 
    )
    serialized_data = RendezVousSerializer(appointments, many=True).data
    return Response(serialized_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def todayRendezVousView(request):
    update_rendez_vous_etat()
    today = date.today()
    today_rendezvous = RendezVous.objects.filter(date__date=today , docteur__user = request.user)
    serializer = RendezVousSerializer(today_rendezvous, many=True)
    if not serializer.data:
        return Response({
            "message": "pas de rendez-vous aujourd'hui"
        }, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def writePrescriptionView(request):
    serializer = PrescriptionSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message":"prescription ecrite avec succées"
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])

def writeMessageView(request):
    sender = request.user
    receiver_email = request.data.get('receiver_email')
    message_content = request.data.get('message_content')
    objet = request.data.get('objet')
    if not receiver_email or not message_content or not objet:
        return Response({"message": "veuiller remplire les champs."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        receiver = User.objects.get(email=receiver_email)
    except User.DoesNotExist:
        return Response({"message": "destinataire non trouvable."}, status=status.HTTP_404_NOT_FOUND)
    message_data = {
        'objet': objet,
        'envoie': sender.id,
        'reception': receiver.id,
        'message_content': message_content
    }
    serializer = MessageSerializer(message_data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def seeMessagesView(request):
    messages_envoyes = Message.objects.filter(envoie = request.user)
    messages_reçu = Message.objects.filter(reception = request.user)
    list_messages = messages_envoyes.union(messages_reçu).order_by('-date_message')
    if list_messages.exists():
        serializer = MessageSerializer(list_messages, many = True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({
            "message": "aucun message"
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historicPrescriptionView(request, cin):
    try :
        update_rendez_vous_etat()
        patient = Patient.objects.get(cin = cin)
        rendez_vous = Prescription.objects.filter(date__patient__cin = cin)
        serializer = PrescriptionSerializer(rendez_vous , many = True)
        reponse = {
            'nom_patient':f"{patient.user.get_full_name()}",
            'prescriptions':serializer.data
        }
        return Response(reponse, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail":str(e)},status=status.HTTP_404_NOT_FOUND)
@api_view(['GET'])
def list_messages(request):
    messages = Message.objects.all()
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)
