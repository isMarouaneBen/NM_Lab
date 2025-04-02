from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from .serializers import RendezVousSerializer
from .models import *
from auth_app.models import User
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from docteur_app.models import Message
from docteur_app.serializers import MessageSerializer
from docteur_app.models import Prescription
from docteur_app.serializers import PrescriptionSerializer




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ReserverRendezvousView(request):
    try:
        patient = Patient.objects.get(user=request.user)
        nom_docteur = request.data.get('nom_docteur')
        date_rdv = request.data.get('date_rendezvous')
        description = request.data.get('description_rendezvous', '')

        docteur = Docteur.objects.filter(
            user__first_name=nom_docteur.split()[0], 
            user__last_name=" ".join(nom_docteur.split()[1:])
        ).first()

        if not docteur:
            return Response({"error": "Docteur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RendezVousSerializer(data={
            'docteur': docteur.id,
            'patient': patient.id,
            'date': date_rdv,
            'description': description,
            'etat': 'planifié'
        })

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Patient.DoesNotExist:
        return Response({"error": "Patient non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])

def historicRendezvousView(request,cin):
    patient = get_object_or_404(Patient , cin = cin)
    rendez_vous = RendezVous.objects.filter(patient = patient)
    serializer = RendezVousSerializer(rendez_vous, many = True)
    try :
        if rendez_vous.exists():
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({
            "message" : "aucun rendez vous pour cet/cette patient(e)"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "error":str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])

def cancelRendezvousView(request, rendez_vous_id): 
    rendez_vous = get_object_or_404(RendezVous, id = rendez_vous_id)
    rendez_vous.delete()
    return Response({
        "message":"rendez-vous annulé avec succés"
    },status = status.HTTP_202_ACCEPTED)


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
    serializer = MessageSerializer(data = message_data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
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
    



@permission_classes([IsAuthenticated])
@api_view(['GET'])
def patientPrescriptionsView(request):
    patient = request.user
    patient_prescriptions = Prescription.objects.filter(date__patient__user = patient)
    if patient_prescriptions.exists():
        serializer = PrescriptionSerializer(patient_prescriptions, many = True)
        return Response(serializer.data ,status=status.HTTP_200_OK)
    else:
        return Response(
            {"message": "Aucune prescription trouvée pour ce patient."},
            status=status.HTTP_404_NOT_FOUND
        )