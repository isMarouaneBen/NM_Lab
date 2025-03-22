from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from .serializers import RendezVousSerializer
from .models import *
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404



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

