from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'role', 'password']
        extra_kwargs = {'password' : {'write_only': True}}
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class DocteurSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Docteur
        fields = '__all__'
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        docteur = Docteur.objects.create(user=user, **validated_data)
        return docteur

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer()    
    class Meta:
        model = Patient
        fields = '__all__'
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        patient = Patient.objects.create(user=user, **validated_data)
        return patient

class PasswordResetSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordReset
        fields = ['user', 'reset_id', 'created_when']
        read_only_fields = ['reset_id', 'created_when']