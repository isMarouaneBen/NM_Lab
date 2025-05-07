import customtkinter as ctk
import tkinter as tk
from tkinter import messagebox
import requests
from datetime import datetime
import json

# Configuration générale
ctk.set_appearance_mode("System")  # Modes: "System" (standard), "Dark", "Light"
ctk.set_default_color_theme("blue")  # Thèmes: "blue" (standard), "green", "dark-blue"

class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Configuration de la fenêtre principale
        self.title("Gestion de Cabinet Médical")
        self.geometry("1100x650")
        self.minsize(1000, 600)
        
        # Variables de session
        self.token = None
        self.user_data = None
        
        # Initialisation des frames
        self.login_frame = None
        self.dashboard_frame = None
        
        # Démarrer avec la page de connexion
        self.afficher_login()
        
    def afficher_login(self):
        # Supprimer les frames existants
        if self.login_frame:
            self.login_frame.destroy()
        if self.dashboard_frame:
            self.dashboard_frame.destroy()
            
        # Créer le nouveau frame de connexion
        self.login_frame = ctk.CTkFrame(self)
        self.login_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Titre
        title_label = ctk.CTkLabel(self.login_frame, text="Connexion au Cabinet Médical", 
                                   font=ctk.CTkFont(size=24, weight="bold"))
        title_label.pack(pady=(50, 30))
        
        # Formulaire de connexion
        login_form = ctk.CTkFrame(self.login_frame)
        login_form.pack(pady=20, padx=100, fill="x")
        
        # Email
        email_label = ctk.CTkLabel(login_form, text="Email :", 
                                   font=ctk.CTkFont(size=14))
        email_label.pack(anchor="w", pady=(10, 0), padx=10)
        
        self.email_entry = ctk.CTkEntry(login_form, width=300, placeholder_text="Entrez votre email")
        self.email_entry.pack(fill="x", pady=(0, 15), padx=10)
        
        # Mot de passe
        password_label = ctk.CTkLabel(login_form, text="Mot de passe :", 
                                      font=ctk.CTkFont(size=14))
        password_label.pack(anchor="w", pady=(0, 0), padx=10)
        
        self.password_entry = ctk.CTkEntry(login_form, width=300, 
                                           placeholder_text="Entrez votre mot de passe", show="•")
        self.password_entry.pack(fill="x", pady=(0, 20), padx=10)
        
        # Bouton de connexion
        login_button = ctk.CTkButton(login_form, text="Se connecter", 
                                     font=ctk.CTkFont(size=14), 
                                     command=self.authentifier)
        login_button.pack(pady=(10, 20), padx=10)
        
    def authentifier(self):
        email = self.email_entry.get()
        password = self.password_entry.get()
        
        if not email or not password:
            messagebox.showerror("Erreur", "Veuillez remplir tous les champs")
            return
        
        # Préparation des données pour l'API
        payload = {
            "email": email,
            "password": password
        }
        
        try:
            # Requête d'authentification
            response = requests.post("http://127.0.0.1:8000/users/login/", 
                                    json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Vérifier si c'est bien un docteur
                if data["role"] != "docteur":
                    messagebox.showerror("Accès refusé", 
                                         "Cette application est réservée aux docteurs")
                    return
                
                # Stocker les informations de session
                self.token = data["token"]
                self.user_data = data["data"]
                
                # Afficher le dashboard
                self.afficher_dashboard()
            else:
                messagebox.showerror("Erreur d'authentification", 
                                     "Email ou mot de passe incorrect")
                
        except requests.exceptions.RequestException:
            messagebox.showerror("Erreur de connexion", 
                                "Impossible de se connecter au serveur")
    
    def afficher_dashboard(self):
        # Supprimer les frames existants
        if self.login_frame:
            self.login_frame.destroy()
        if self.dashboard_frame:
            self.dashboard_frame.destroy()
            
        # Créer le nouveau frame de dashboard
        self.dashboard_frame = ctk.CTkFrame(self)
        self.dashboard_frame.pack(fill="both", expand=True)
        
        # Structure du dashboard en deux colonnes
        sidebar = ctk.CTkFrame(self.dashboard_frame, width=200, corner_radius=0)
        sidebar.pack(side="left", fill="y", padx=0, pady=0)
        sidebar.pack_propagate(False)  # Empêcher le redimensionnement
        
        content_frame = ctk.CTkFrame(self.dashboard_frame)
        content_frame.pack(side="right", fill="both", expand=True, padx=10, pady=10)
        
        # En-tête de la sidebar
        header_frame = ctk.CTkFrame(sidebar, fg_color="transparent")
        header_frame.pack(fill="x", padx=10, pady=(20, 10))
        
        doctor_name = f"Dr. {self.user_data['user']['first_name']} {self.user_data['user']['last_name']}"
        doctor_label = ctk.CTkLabel(header_frame, text=doctor_name, 
                                   font=ctk.CTkFont(size=16, weight="bold"))
        doctor_label.pack(anchor="w")
        
        specialty_label = ctk.CTkLabel(header_frame, text=self.user_data['specialite'],
                                     font=ctk.CTkFont(size=12))
        specialty_label.pack(anchor="w")
        
        separator = ctk.CTkFrame(sidebar, height=1, fg_color="gray70")
        separator.pack(fill="x", padx=10, pady=10)
        
        # Éléments de navigation de la sidebar
        self.nav_buttons = []
        
        # Fonction pour gérer les clics sur les boutons de navigation
        def handle_nav_click(section):
            for btn in self.nav_buttons:
                btn.configure(fg_color="transparent")
            
            sender = next((btn for btn in self.nav_buttons if btn.cget("text") == section), None)
            if sender:
                sender.configure(fg_color="#3B8ED0")
            
            # Vider le contenu existant
            for widget in content_frame.winfo_children():
                widget.destroy()
                
            # Afficher le contenu approprié
            if section == "Rendez-vous aujourd'hui":
                self.afficher_rendez_vous(content_frame)
            elif section == "Écrire prescription":
                self.afficher_prescription(content_frame)
            elif section == "Profil":
                self.afficher_profil(content_frame)
        
        # Boutons de navigation
        for index, section in enumerate(["Rendez-vous aujourd'hui", "Écrire prescription", "Profil"]):
            btn = ctk.CTkButton(sidebar, text=section, font=ctk.CTkFont(size=14),
                               height=40, anchor="w", fg_color="transparent", 
                               text_color=("gray10", "gray90"),
                               hover_color=("gray70", "gray30"),
                               command=lambda s=section: handle_nav_click(s))
            btn.pack(fill="x", pady=(5, 5), padx=5)
            self.nav_buttons.append(btn)
        
        # Séparateur en bas
        separator2 = ctk.CTkFrame(sidebar, height=1, fg_color="gray70")
        separator2.pack(fill="x", padx=10, pady=(250, 10))
        
        # Bouton de déconnexion
        logout_btn = ctk.CTkButton(sidebar, text="Déconnexion", font=ctk.CTkFont(size=14),
                                  height=40, fg_color="#E74C3C", hover_color="#C0392B",
                                  command=self.deconnecter)
        logout_btn.pack(fill="x", pady=10, padx=10)
        
        # Sélectionner le premier onglet par défaut
        handle_nav_click("Rendez-vous aujourd'hui")
    
    def afficher_rendez_vous(self, parent_frame):
        # Titre
        title_frame = ctk.CTkFrame(parent_frame, fg_color="transparent")
        title_frame.pack(fill="x", padx=10, pady=(20, 10))
        
        title_label = ctk.CTkLabel(title_frame, text="Rendez-vous d'aujourd'hui", 
                                  font=ctk.CTkFont(size=24, weight="bold"))
        title_label.pack(anchor="w")
        
        date_now = datetime.now().strftime("%d/%m/%Y")
        date_label = ctk.CTkLabel(title_frame, text=f"Date : {date_now}", 
                                 font=ctk.CTkFont(size=14))
        date_label.pack(anchor="w")
        
        # Tableau des rendez-vous
        table_frame = ctk.CTkFrame(parent_frame)
        table_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # En-tête du tableau
        headers = ["Patient", "Description", "Heure"]
        header_frame = ctk.CTkFrame(table_frame, fg_color="#3B8ED0", height=40)
        header_frame.pack(fill="x", padx=1, pady=(1, 0))
        header_frame.grid_columnconfigure((0, 1, 2), weight=1, uniform="column")
        
        for col, header in enumerate(headers):
            ctk.CTkLabel(header_frame, text=header, font=ctk.CTkFont(size=14, weight="bold"),
                       text_color="white").grid(row=0, column=col, padx=10, pady=10, sticky="w")
        
        # Frame pour les données
        data_frame = ctk.CTkScrollableFrame(table_frame)
        data_frame.pack(fill="both", expand=True, padx=1, pady=(0, 1))
        data_frame.grid_columnconfigure((0, 1, 2), weight=1, uniform="column")
        
        # Récupérer les rendez-vous
        try:
            headers = {"Authorization": f"Token {self.token}"}
            response = requests.get("http://127.0.0.1:8000/docteur/today-rendezvous/", 
                                   headers=headers)
            
            if response.status_code == 200:
                rendez_vous = response.json()
                
                if not rendez_vous:  # Liste vide
                    ctk.CTkLabel(data_frame, text="Aucun rendez-vous pour aujourd'hui",
                               font=ctk.CTkFont(size=14)).grid(row=0, column=0, columnspan=3, 
                                                              padx=10, pady=20)
                else:
                    for row, rdv in enumerate(rendez_vous):
                        bg_color = "#F0F0F0" if row % 2 == 0 else "#FFFFFF"
                        row_frame = ctk.CTkFrame(data_frame, fg_color=bg_color)
                        row_frame.grid(row=row, column=0, columnspan=3, sticky="ew", padx=1, pady=1)
                        row_frame.grid_columnconfigure((0, 1, 2), weight=1, uniform="column")
                        
                        # Convertir la date ISO en format lisible
                        date_obj = datetime.fromisoformat(rdv["date"].replace("Z", "+00:00"))
                        heure_formattee = date_obj.strftime("%H:%M")
                        
                        ctk.CTkLabel(row_frame, text=rdv["patient_nom"]).grid(row=0, column=0, padx=10, pady=10, sticky="w")
                        ctk.CTkLabel(row_frame, text=rdv["description"]).grid(row=0, column=1, padx=10, pady=10, sticky="w")
                        ctk.CTkLabel(row_frame, text=heure_formattee).grid(row=0, column=2, padx=10, pady=10, sticky="w")
            
            elif response.status_code == 404:
                ctk.CTkLabel(data_frame, text="Aucun rendez-vous pour aujourd'hui",
                           font=ctk.CTkFont(size=14)).grid(row=0, column=0, columnspan=3, 
                                                          padx=10, pady=20)
            else:
                ctk.CTkLabel(data_frame, text="Problème serveur lors de la récupération des rendez-vous",
                           font=ctk.CTkFont(size=14)).grid(row=0, column=0, columnspan=3, 
                                                          padx=10, pady=20)
        
        except requests.exceptions.RequestException:
            ctk.CTkLabel(data_frame, text="Impossible de se connecter au serveur",
                       font=ctk.CTkFont(size=14)).grid(row=0, column=0, columnspan=3, 
                                                      padx=10, pady=20)
    
    def afficher_prescription(self, parent_frame):
        # Titre
        title_label = ctk.CTkLabel(parent_frame, text="Écrire une prescription", 
                                  font=ctk.CTkFont(size=24, weight="bold"))
        title_label.pack(anchor="w", padx=20, pady=(20, 30))
        
        # Formulaire
        form_frame = ctk.CTkFrame(parent_frame)
        form_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        # CIN du patient
        cin_label = ctk.CTkLabel(form_frame, text="CIN du patient :", 
                               font=ctk.CTkFont(size=14))
        cin_label.pack(anchor="w", pady=(15, 0), padx=15)
        
        self.cin_entry = ctk.CTkEntry(form_frame, placeholder_text="ex: AB123456")
        self.cin_entry.pack(fill="x", pady=(0, 15), padx=15)
        
        # Date et heure du rendez-vous
        date_label = ctk.CTkLabel(form_frame, text="Date du rendez-vous :", 
                                font=ctk.CTkFont(size=14))
        date_label.pack(anchor="w", pady=(0, 0), padx=15)
        
        date_frame = ctk.CTkFrame(form_frame, fg_color="transparent")
        date_frame.pack(fill="x", padx=15)
        
        self.date_entry = ctk.CTkEntry(date_frame, placeholder_text="JJ/MM/AAAA")
        self.date_entry.pack(side="left", fill="x", expand=True, padx=(0, 5))
        
        heure_label = ctk.CTkLabel(date_frame, text="Heure :", 
                                 font=ctk.CTkFont(size=14))
        heure_label.pack(side="left", padx=(10, 5))
        
        self.heure_entry = ctk.CTkEntry(date_frame, placeholder_text="HH:MM", width=100)
        self.heure_entry.pack(side="left", padx=(0, 0))
        
        # Diagnostique
        diag_label = ctk.CTkLabel(form_frame, text="Diagnostique :", 
                                font=ctk.CTkFont(size=14))
        diag_label.pack(anchor="w", pady=(15, 0), padx=15)
        
        self.diag_text = ctk.CTkTextbox(form_frame, height=100)
        self.diag_text.pack(fill="x", pady=(0, 15), padx=15)
        
        # Traitement
        trait_label = ctk.CTkLabel(form_frame, text="Traitement :", 
                                 font=ctk.CTkFont(size=14))
        trait_label.pack(anchor="w", pady=(0, 0), padx=15)
        
        self.trait_text = ctk.CTkTextbox(form_frame, height=100)
        self.trait_text.pack(fill="x", pady=(0, 15), padx=15)
        
        # Notes
        notes_label = ctk.CTkLabel(form_frame, text="Notes (optionnel) :", 
                                 font=ctk.CTkFont(size=14))
        notes_label.pack(anchor="w", pady=(0, 0), padx=15)
        
        self.notes_text = ctk.CTkTextbox(form_frame, height=60)
        self.notes_text.pack(fill="x", pady=(0, 15), padx=15)
        
        # Bouton pour envoyer
        submit_btn = ctk.CTkButton(form_frame, text="Enregistrer la prescription", 
                                  font=ctk.CTkFont(size=14),
                                  height=40,
                                  command=self.envoyer_prescription)
        submit_btn.pack(pady=(10, 20), padx=15)
    
    def envoyer_prescription(self):
        # Récupérer les valeurs
        cin = self.cin_entry.get()
        date_str = self.date_entry.get()
        heure_str = self.heure_entry.get()
        diagnostique = self.diag_text.get("1.0", "end-1c")
        traitement = self.trait_text.get("1.0", "end-1c")
        notes = self.notes_text.get("1.0", "end-1c")
        
        # Validation des champs obligatoires
        if not all([cin, date_str, heure_str, diagnostique, traitement]):
            messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires")
            return
        
        try:
            # Convertir la date et l'heure en format ISO
            date_format = datetime.strptime(f"{date_str} {heure_str}", "%d/%m/%Y %H:%M")
            date_iso = date_format.strftime("%Y-%m-%dT%H:%M:00Z")
            
            # Préparation des données
            payload = {
                "patient_cin": cin,
                "date_rendezvous": date_iso,
                "diagnostique": diagnostique,
                "traitment": traitement,
                "notes": notes
            }
            
            # Envoi à l'API
            headers = {"Authorization": f"Token {self.token}"}
            response = requests.post("http://127.0.0.1:8000/docteur/write-prescription/", 
                                   json=payload, headers=headers)
            
            if response.status_code == 200:
                messagebox.showinfo("Succès", "Prescription enregistrée avec succès")
                # Vider les champs
                self.cin_entry.delete(0, "end")
                self.date_entry.delete(0, "end")
                self.heure_entry.delete(0, "end")
                self.diag_text.delete("1.0", "end")
                self.trait_text.delete("1.0", "end")
                self.notes_text.delete("1.0", "end")
            else:
                messagebox.showerror("Erreur", f"Échec de l'enregistrement (code {response.status_code})")
                
        except ValueError:
            messagebox.showerror("Erreur de format", 
                                "Format de date ou heure incorrect. Utilisez JJ/MM/AAAA et HH:MM")
        
        except requests.exceptions.RequestException:
            messagebox.showerror("Erreur de connexion", 
                                "Impossible de se connecter au serveur")
    
    def afficher_profil(self, parent_frame):
        # Titre
        title_label = ctk.CTkLabel(parent_frame, text="Mon profil", 
                                  font=ctk.CTkFont(size=24, weight="bold"))
        title_label.pack(anchor="w", padx=20, pady=(20, 30))
        
        # Informations du profil
        profile_frame = ctk.CTkFrame(parent_frame)
        profile_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        # Photo de profil (placeholder)
        avatar_frame = ctk.CTkFrame(profile_frame, width=150, height=150, 
                                   fg_color="#3B8ED0", corner_radius=75)
        avatar_frame.pack(pady=(30, 20))
        avatar_frame.pack_propagate(False)
        
        initials = f"{self.user_data['user']['first_name'][0]}{self.user_data['user']['last_name'][0]}"
        avatar_label = ctk.CTkLabel(avatar_frame, text=initials.upper(), 
                                   font=ctk.CTkFont(size=50, weight="bold"),
                                   text_color="white")
        avatar_label.place(relx=0.5, rely=0.5, anchor="center")
        
        # Détails du profil
        details_frame = ctk.CTkFrame(profile_frame, fg_color="transparent")
        details_frame.pack(fill="x", padx=20, pady=10)
        
        # Nom complet
        full_name = f"{self.user_data['user']['first_name']} {self.user_data['user']['last_name']}"
        name_label = ctk.CTkLabel(details_frame, text=full_name, 
                                font=ctk.CTkFont(size=20, weight="bold"))
        name_label.pack(anchor="center", pady=(0, 10))
        
        # Spécialité
        spec_label = ctk.CTkLabel(details_frame, text=f"Spécialité : {self.user_data['specialite']}", 
                                font=ctk.CTkFont(size=16))
        spec_label.pack(anchor="center", pady=(0, 5))
        
        # Email
        email_label = ctk.CTkLabel(details_frame, text=f"Email : {self.user_data['user']['email']}", 
                                 font=ctk.CTkFont(size=16))
        email_label.pack(anchor="center", pady=(0, 20))
        
        # Rôle
        role_label = ctk.CTkLabel(details_frame, text=f"Rôle : {self.user_data['user']['role'].capitalize()}", 
                                font=ctk.CTkFont(size=16))
        role_label.pack(anchor="center", pady=(0, 5))
        
        # ID
        id_label = ctk.CTkLabel(details_frame, text=f"ID : {self.user_data['id']}", 
                              font=ctk.CTkFont(size=16))
        id_label.pack(anchor="center", pady=(0, 5))
    
    def deconnecter(self):
        try:
            # Appel à l'API de déconnexion
            headers = {"Authorization": f"Token {self.token}"}
            response = requests.post("http://127.0.0.1:8000/users/logout/", headers=headers)
            
            # Même en cas d'échec, on déconnecte localement
            self.token = None
            self.user_data = None
            
            # Retourner à la page de connexion
            self.afficher_login()
            
        except requests.exceptions.RequestException:
            # En cas d'erreur de connexion, on déconnecte quand même localement
            self.token = None
            self.user_data = None
            self.afficher_login()
            messagebox.showwarning("Déconnexion partielle", 
                                  "Impossible de contacter le serveur. Déconnexion locale effectuée.")

if __name__ == "__main__":
    app = App()
    app.mainloop()