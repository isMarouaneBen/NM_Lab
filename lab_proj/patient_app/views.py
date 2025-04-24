from django.shortcuts import render

from django.db.models import Q 
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from .serializers import RendezVousSerializer
from .models import *
from auth_app.models import User
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from docteur_app.serializers import MessageSerializer
from docteur_app.models import Prescription,Message
from docteur_app.serializers import PrescriptionSerializer
from datetime import date,datetime
from docteur_app.views import update_rendez_vous_etat



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
    rendez_vous = RendezVous.objects.filter(patient = patient).exclude(etat = 'annulé')
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
    serializer = MessageSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(status=status.HTTP_200_OK)
    else :
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getConversationView(request, contact_id):
    try:
        contact = User.objects.get(id=contact_id)

        messages_from_contact = Message.objects.filter(envoie=contact, reception=request.user)
        messages_from_user = Message.objects.filter(envoie=request.user, reception=contact)
        conversation = messages_from_contact.union(messages_from_user).order_by('date_message')

        if conversation.exists():
            print("Utilisateur connecté :", request.user.id)
            print("id_patient ", request.user.patient.id)
            serializer = MessageSerializer(conversation, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)  # Return empty array instead of 404

    except User.DoesNotExist:
        return Response({"message": "Contact introuvable"}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ListDoctorsViews(request): 
    try:
        docteurs = Docteur.objects.all()
        data =[]
        for docteur in docteurs : 
            data.append({
                'nom_doc': docteur.user.get_full_name() ,
                'specialite':docteur.specialite
                })
        return Response(data,status=status.HTTP_200_OK)
    except Docteur.DoesNotExist :
        return Response(status=status.HTTP_400_BAD_REQUEST)
        

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nextAppointmentView(request, cin):
    update_rendez_vous_etat()
    patient = Patient.objects.filter(cin=cin).first()
    if patient:
        today = date.today()
        now = datetime.now()
        time_now = now.time()
        rdv = RendezVous.objects.filter(
            patient=patient,
            date__date__gte=today,
            date__time__gte=time_now
        ).order_by('date')
        
        if rdv.exists():
            serializer = RendezVousSerializer(rdv.first())
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No upcoming appointments found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({"message": "Patient not found"}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ListContactDocView(request):
    rendez_vous = RendezVous.objects.filter(patient = request.user.patient) 
    try:
        if rendez_vous.exists():
            listContact = []
            ids = set()
            for rdv in rendez_vous : 
                docteur = rdv.docteur
                if not docteur.id in ids:
                    listContact.append({
                        'nom_doc':docteur.user.get_full_name(),
                        'email_doc':docteur.user.email,
                        'id_doc':docteur.user.id
                    })
                    ids.add(docteur.id)
            return Response(listContact,status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
    except Exception as e :
        return Response({
            'error':str(e)
        },status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserId(request, id):
    try: 
        patient = Patient.objects.get(id = id)
        user = User.objects.get(email = patient.user.email)
        return Response({
            "user_id": user.id
        }, status=status.HTTP_200_OK)
    except Exception as e :
        return Response({
            "message_error":str(e)
        }, status=status.HTTP_400_BAD_REQUEST)