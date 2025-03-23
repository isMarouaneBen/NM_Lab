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



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ReserverRendezvousView(request):
    serializer = RendezVousSerializer(data = request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data , status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historicRendezvousView(request,cin):
    patient = get_object_or_404(Patient , cin = cin)
    rendez_vous = RendezVous.objects.filter(patient = patient)
    serializer = RendezVousSerializer(rendez_vous, many = True)
    try :
        return Response(serializer.data, status=status.HTTP_200_OK)
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
    },status = status.HTTP_204_NO_CONTENT)


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
    

