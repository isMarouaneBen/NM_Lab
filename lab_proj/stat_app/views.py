from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from patient_app.models import RendezVous
from auth_app.models import Patient
from datetime import datetime

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthlyPatientView(request):
    this_month = datetime.now().month
    this_year = datetime.now().year
    try :
        monthly_patient = User.objects.filter(ROLES = 'patient' , CREATED_WHEN__month = this_month , CREATED_WHEN__year = this_year)
        if monthly_patient.exists() :
            monthly_patient_count_data = monthly_patient.count()
            return Response( {
                'monthly_patients' : monthly_patient_count_data
                },status=status.HTTP_200_OK)
        else : 
            return Response( {
                'monthly_patients' : 0
                },status=status.HTTP_200_OK)
    except Exception as e :
        return Response(status= status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def CountTodayRendezVousView(request):
    this_date = datetime.now()
    try :
        today_rendezvous = RendezVous.objects.filter(date__date = this_date) 
        if today_rendezvous.exists():
            today_rendezvous_count = today_rendezvous.count()
            return Response({
                'today_rendezvous': today_rendezvous_count
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'today_rendezvous': 0
            }, status=status.HTTP_200_OK)

    except Exception as e :
        return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def MoyenAgeView(request):
    try :
        all_patient = Patient.objects.all()
        sum_ages = 0
        for i in all_patient :
            age = (datetime.now().date() - i.date_naissance).days  
            sum_ages += age / 365
        average_age = sum_ages / len(all_patient)
        return Response({
            'average_age':round(average_age ,2)
        }, status=status.HTTP_200_OK)
    except Exception :
        return Response(status=status.HTTP_400_BAD_REQUEST)

