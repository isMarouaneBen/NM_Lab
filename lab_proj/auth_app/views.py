from auth_app.models import User
from auth_app.serializers import *
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta




class PatientRegisterationView(APIView):
    def post(self , request):
        serializer = PatientSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(request.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DoctorRegisterationView(APIView):
    def post(self , request):
        serializer = DocteurSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(request.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            
            response_data = {
                'token': token.key,
                'username': user.username,
                'role': user.role,
            }

            if user.role.upper() == 'PATIENT':
                try:
                    patient = Patient.objects.get(user=user)
                    patient_data = PatientSerializer(patient).data
                    response_data['data'] = patient_data
                except Patient.DoesNotExist:
                    pass
                return Response(response_data)
                
            elif user.role.upper() == 'DOCTEUR':
                try:
                    docteur = Docteur.objects.get(user=user)
                    docteur_data = DocteurSerializer(docteur).data
                    response_data['data'] = docteur_data
                except Docteur.DoesNotExist:
                    pass
                return Response(response_data)
                
        else:
            return Response({"message": "email ou mot de passe invalide"}, status=status.HTTP_401_UNAUTHORIZED)
        

class UserLogoutVIew(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(request.headers)
        token_key = request.auth.key
        token = Token.objects.get(key=token_key)
        token.delete()

        return Response({
            "detail": "deconnecté avec succés"
        })

class PasswordResetView(APIView):
    def post(self, request):
        email = request.data.get('email')

        try:
            user = User.objects.get(email = email)
        except User.DoesNotExist:
            return Response({"detail": "Entrer un email valide"}, status=status.HTTP_400_BAD_REQUEST)

        reset_instance = PasswordReset.objects.create(user=user)
        serializer = PasswordResetSerializer(reset_instance)
        if serializer.is_valid():
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_instance.reset_id}"

            subject = "Réinitialisation du mot de passe"
            message = f"""
            Bonjour {user.last_name.upper()},

            Voici le lien à suivre pour réinitialiser votre mot de passe : {reset_url}

            NB :
            - Le lien expire dans 24 heures.
            - Si vous n'avez pas demandé une réinitialisation, ignorez cet email ou contactez le support.

            Cordialement,
            Équipe LM_LAB
            """

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response(
                {"message": "Un email de confirmation a été envoyé si le compte existe"},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors , status = status.HTTP_400_BAD_REQUEST)

        




class PasswordConfirmation(APIView):
    def post(self, request, reset_id):
        try:
            password_reset = PasswordReset.objects.get(reset_id=reset_id)
            if request.data['password'] != request.data['confirm_password']:
                return Response({"erreur": "Les mots de passe ne correspondent pas"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            if timezone.now() > password_reset.created_when + timedelta(days=1):
                return Response({"erreur": "Lien expiré"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            user = password_reset.user
            user.set_password(request.data['password'])
            user.save()
            password_reset.delete()
            return Response({"detail": "Mot de passe mis à jour"}, 
                          status=status.HTTP_200_OK)
        except PasswordReset.DoesNotExist:
            return Response({"erreur": "Lien invalide"}, 
                          status=status.HTTP_404_NOT_FOUND)
        