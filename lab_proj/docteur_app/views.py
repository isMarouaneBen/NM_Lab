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
    maintenant = timezone.localtime(timezone.now())
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
        date__time__gte=now.time(),
        date__date__gte = now.date(),   
        etat='planifié'
    ).exclude(etat = "completé").exclude(etat = "annulé").order_by("date")
    if appointments.exists() :
        serialized_data = RendezVousSerializer(appointments, many=True).data
        return Response(serialized_data)
    else : 
        return Response({
            "message" : "pas de rendez-vous courant"
        } , status=status.HTTP_404_NOT_FOUND)

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
    serializer = MessageSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(status=status.HTTP_200_OK)
    else :
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seeMessagesView(request, contact_id):
    try:
        contact = User.objects.get(id=contact_id)

        messages_from_contact = Message.objects.filter(envoie=contact, reception=request.user)
        messages_from_user = Message.objects.filter(envoie=request.user, reception=contact)
        conversation = messages_from_contact.union(messages_from_user).order_by('date_message')

        if conversation.exists():
            print("Utilisateur connecté :", request.user.id)
            serializer = MessageSerializer(conversation, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"message": "Contact introuvable"}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ListContactPatientView(request):
    rendez_vous = RendezVous.objects.filter(docteur = request.user.docteur)
    try:
        if rendez_vous.exists():
            listContact = []
            ids = set()
            for rdv in rendez_vous : 
                patient = rdv.patient
                if not patient.id in ids :
                    listContact.append({
                            'nom_patient':patient.user.get_full_name(),
                            'email_patient':patient.user.email,
                            'id':patient.user.id
                    })
                    ids.add(patient.id)
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
        docteur = Docteur.objects.get(id = id)
        user = User.objects.get(email = docteur.user.email)
        return Response({
            "user_id": user.id
        }, status=status.HTTP_200_OK)
    except Exception as e :
        return Response({
            "message_error":str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nextRdvListView(request):
    try:
        update_rendez_vous_etat()
        rdv = RendezVous.objects.filter(docteur = request.user.docteur).exclude(etat = 'completé').exclude(etat = 'annulé').order_by('date')
        if rdv.exists():
            serializer = RendezVousSerializer(rdv,many = True)
            return Response(serializer.data , status= status.HTTP_200_OK)
        else :
            return Response(status=status.HTTP_404_NOT_FOUND)
    except Exception as e :
        return Response({
            'error':str(e)
        }, status=status.HTTP_400_BAD_REQUEST)