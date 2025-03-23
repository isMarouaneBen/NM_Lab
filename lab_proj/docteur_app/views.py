from django.conf import settings
from django.shortcuts import render
from .models import *
from auth_app.models import User
from .serializers import *
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from .models import *
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from datetime import date
from patient_app.serializers import RendezVousSerializer 


@api_view(['DELETE'])
@permission_classes(IsAuthenticated)
def docteurCancelRendezvousView(request, rendez_vous_id):
    rendez_vous = get_object_or_404(RendezVous, id = rendez_vous_id)
    try:
        rendez_vous.delete()
        subject = "Annulation d'un Rendez vous"
        message = f"""
        Bonjour {Patient.user.last_name.upper()},

        Votre Rendez-vous avec Dr.{Docteur.user.last_name.upper()} à {RendezVous.date} a été annulé .

        Pour plus de details ,veuillez contacter le docteur, ou vous pouvez simplement reserver une autre date.

        on s'excuse et on vous souhaite une bonne journée.
        Cordialement,
        Équipe LM_LAB
        """
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[Patient.user.email],
            fail_silently=False,
        )
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
    today = date.today()
    upcoming_rendezvous = RendezVous.objects.filter(date__date__gte=today)
    serializer = RendezVousSerializer(upcoming_rendezvous, many=True)
    
    if serializer.is_valid():
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response({
        "message": "Une erreur a été produite"
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes(IsAuthenticated)
def todayRendezVousView(request):
    today = date.today()
    today_rendezvous = RendezVous.objects.filter(date__date=today)
    serializer = RendezVousSerializer(today_rendezvous, many=True)
    if serializer.is_valid():
        if not serializer.data:
            return Response({
                "message": "pas de rendez-vous aujourd'hui"
            }, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response({
        "message": "Une erreur a été produite"
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes(IsAuthenticated)
def writePrescriptionView(request):
    serializer = PrescriptionSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "prescription écrite avec succées"
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def writeMessageView(request):
    sender = request.User
    receiver_email = request.data.get('receiver_email')
    message_content = request.data.get('message_content')
    objet = request.data.get('objet')
    if not receiver_email or not message_content or not objet:
        return Response({"message": "veuiller remplire les champs."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        receiver = User.objects.get(email=receiver_email)
    except User.DoesNotExist:
        return Response({"message": "destinataire non trouvable."}, status=status.HTTP_404_NOT_FOUND)
    message = Message.objects.create(
        envoie=sender,
        reception=receiver,
        message_content=message_content,
        objet=objet
    )
    serializer = MessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes(IsAuthenticated)
def seeMessagesView(request):
    messages_envoyes = Message.objects.filter(envoie = request.User)
    messages_reçu = Message.objects.filter(reception = request.User)
    list_messages = messages_envoyes.union(messages_reçu).order_by('-date_message')
    if list_messages.exists():
        serializer = MessageSerializer(list_messages, many = True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({
            "message": "aucun message"
        }, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
@permission_classes(IsAuthenticated)
def historicPrescriptionView(request, cin):
    patient = get_object_or_404(Patient, cin = cin)
    rendez_vous = RendezVous.objects.filter(Patient = patient)
    if rendez_vous is not None :
        serializer = RendezVousSerializer(rendez_vous, many = True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({
        "message":"aucun prescriptions encore pour cet patient"
    })
    