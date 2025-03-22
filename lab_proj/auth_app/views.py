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

        user = authenticate(request, username = email , password=password)
        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            if created:
                token.delete()
                token = Token.objects.create(user = user)
            response_data = {
                'token': token.key,
                'username': user.username,
                'role': user.role,
            }

            if user.role.upper() == 'PATIENT':
                patient = user.cin
                if patient is not None:
                    patient_data = PatientSerializer(patient).data
                    response_data['data'] = patient_data
                return Response(response_data)
            elif user.role.upper() == 'DOCTEUR':
                docteur = user.specialite
                if docteur is not None:
                    docteur_data = DocteurSerializer(docteur).data
                    response_data['data'] = docteur_data
                    return Response(response_data)
                
        else:
            return Response({"message": "email ou mot de passe invalide"},status=status.HTTP_401_UNAUTHORIZED)
        

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
        username = request.data.get('username')

        # Vérifier si l'utilisateur existe
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "Entrer un email valide"}, status=status.HTTP_400_BAD_REQUEST)

        # Générer un token de réinitialisation unique
        reset_instance = PasswordReset.objects.create(user=user)
        reset_serializer = PasswordResetSerializer(reset_instance)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_instance.reset_id}"

        # Construire l'email
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

        # Envoyer l'email
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

        


class PasswordConfirmation(APIView):
    def post(self,request,reset_id):
        password_reset_id = PasswordReset.objects.get(reset_id =reset_id)
        
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if password != confirm_password:
            return Response({
                "erreur":"Les mots de passe ne correspondent pas."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        expiration_time = password_reset_id.created_when + timezone.timedelta(days=1)
        if timezone.now() > expiration_time :
            return Response({
                "erreur":"lien de reeinitialisation expiré"
            }, status=status.HTTP_400_BAD_REQUEST)
        user = password_reset_id.user
        user.set_password(password)
        user.save()
        token, _ = Token.objects.update_or_create(user=user)
        password_reset_id.delete()
        return Response({
            "detail":"reeinitialisation du mot de passe avec succées"
        }, status=status.HTTP_200_OK)

        