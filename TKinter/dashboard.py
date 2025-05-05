import tkinter as tk
from tkinter import messagebox, scrolledtext
import api_functions

class MainDashboard:
    def __init__(self, token, user_data):
        self.token = token
        self.user = user_data
        self.root = tk.Tk()
        self.root.title("Tableau de bord Docteur")
        self.root.geometry("800x600")
        self.root.configure(bg="#0A2740")
        self.create_widgets()
        self.root.mainloop()

    def create_widgets(self):
        # Boutons principaux
        btn_frame = tk.Frame(self.root, bg="#0A2740")
        btn_frame.pack(pady=20)

        tk.Button(btn_frame, text="Rendez-vous du jour", command=self.show_appointments,
                  fg="white", bg="#1E3A8A", width=20, bd=0, pady=5).grid(row=0, column=0, padx=10)
        tk.Button(btn_frame, text="Rédiger ordonnance", command=self.write_prescription,
                  fg="white", bg="#1E3A8A", width=20, bd=0, pady=5).grid(row=0, column=1, padx=10)
        tk.Button(btn_frame, text="Profil Docteur", command=self.view_profile,
                  fg="white", bg="#1E3A8A", width=20, bd=0, pady=5).grid(row=0, column=2, padx=10)
        tk.Button(btn_frame, text="Déconnexion", command=self.logout,
                  fg="white", bg="#B91C1C", width=20, bd=0, pady=5).grid(row=0, column=3, padx=10)

        # Zone de contenu
        self.content_frame = tk.Frame(self.root, bg="#0A2740")
        self.content_frame.pack(fill="both", expand=True, padx=20, pady=10)

    def clear_content(self):
        for widget in self.content_frame.winfo_children():
            widget.destroy()

    def show_appointments(self):
        self.clear_content()
        appts = api_functions.get_today_rendezvous(self.token)
        tk.Label(self.content_frame, text="Rendez-vous du jour", fg="white", bg="#0A2740", font=(None, 14, 'bold')).pack(pady=10)
        text = scrolledtext.ScrolledText(self.content_frame, width=80, height=20)
        text.pack()
        if appts:
            for rdv in appts:
                text.insert(tk.END, f"- {rdv['heure']} : {rdv['patient_nom']}\n")
        else:
            text.insert(tk.END, "Aucun rendez-vous pour aujourd'hui.")

    def write_prescription(self):
        self.clear_content()
        tk.Label(self.content_frame, text="Rédiger une ordonnance", fg="white", bg="#0A2740", font=(None, 14, 'bold')).pack(pady=10)
        tk.Label(self.content_frame, text="ID Patient:", fg="white", bg="#0A2740").pack(pady=(5,2))
        self.patient_entry = tk.Entry(self.content_frame, width=30)
        self.patient_entry.pack()
        tk.Label(self.content_frame, text="Texte ordonnance:", fg="white", bg="#0A2740").pack(pady=(10,2))
        self.presc_text = scrolledtext.ScrolledText(self.content_frame, width=80, height=10)
        self.presc_text.pack()
        tk.Button(self.content_frame, text="Envoyer", command=self.submit_prescription,
                  fg="white", bg="#1E3A8A", width=15, bd=0, pady=5).pack(pady=10)

    def submit_prescription(self):
        pid = self.patient_entry.get()
        text = self.presc_text.get("1.0", tk.END).strip()
        if not pid or not text:
            messagebox.showwarning("Champs manquants", "Veuillez renseigner tous les champs.")
            return
        resp = api_functions.write_prescription(self.token, pid, text)
        if resp.ok:
            messagebox.showinfo("Succès", "Ordonnance envoyée.")
        else:
            messagebox.showerror("Erreur", "Impossible d'envoyer l'ordonnance.")

    def view_profile(self):
        self.clear_content()
        tk.Label(self.content_frame, text="Profil Docteur", fg="white", bg="#0A2740", font=(None, 14, 'bold')).pack(pady=10)
        tk.Label(self.content_frame, text=f"Nom: {self.user.get('nom', 'N/A')}", fg="white", bg="#0A2740").pack(pady=5)
        tk.Label(self.content_frame, text=f"Email: {self.user.get('email', 'N/A')}", fg="white", bg="#0A2740").pack(pady=5)

    def logout(self):
        api_functions.logout(self.token)
        self.root.destroy()
        import auth_page
        auth_page.AuthPage()