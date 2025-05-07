# dashboard.py
import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime
from api_functions import APIClient

DARK_BLUE = "#0B3D91"
WHITE = "#FFFFFF"

class DoctorDashboard(tk.Tk):
    def __init__(self, client: APIClient):
        super().__init__()
        self.client = client
        self.title("Dashboard Docteur")
        self.configure(bg=DARK_BLUE)
        self.geometry("800x600")
        self._build_ui()

    def _build_ui(self):
        style = ttk.Style(self)
        style.theme_use('clam')
        style.configure('TNotebook.Tab', background=DARK_BLUE, foreground=WHITE, padding=10)
        style.map('TNotebook.Tab', background=[('selected', WHITE)], foreground=[('selected', DARK_BLUE)])

        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill='both', expand=True, padx=10, pady=10)

        self._tab_today()
        self._tab_prescription()
        self._tab_profile()

    def _tab_today(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="Aujourd'hui")
        data = self.client.get_today_appointments()
        if isinstance(data, dict) and data.get("message"):
            lbl = tk.Label(frame, text=data["message"], bg=WHITE, fg="black", font=("Arial", 14))
            lbl.pack(pady=20)
            return

        for rdv in data:
            rdv_frame = tk.Frame(frame, bg=WHITE, bd=1, relief='solid', padx=10, pady=10)
            rdv_frame.pack(fill='x', pady=5)
            info = f"{rdv['heure']} - Patient: {rdv['patient_nom']} {rdv['patient_prenom']}"
            tk.Label(rdv_frame, text=info, bg=WHITE, anchor='w').grid(row=0, column=0, sticky='w')
            btn = tk.Button(rdv_frame, text="Annuler",
                            command=lambda id=rdv['id']: self._cancel(rdv_frame, id))
            btn.grid(row=0, column=1, padx=10)

    def _cancel(self, widget, rdv_id):
        res = self.client.cancel_appointment(rdv_id)
        if "succées" in res.get("message", ""):
            widget.destroy()
            messagebox.showinfo("Succès", "Rendez-vous annulé et patient informé.")
        else:
            messagebox.showerror("Erreur", res.get("message", "Erreur inconnue"))

    def _tab_prescription(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="Ordonnances")

        labels = ["CIN Patient", "Date et heure (ISO)", "Diagnostic", "Traitement", "Notes (opt.)"]
        self.entries = {}
        for i, txt in enumerate(labels):
            tk.Label(frame, text=txt, bg=WHITE).grid(row=i, column=0, sticky='e', pady=5, padx=5)
            ent = tk.Entry(frame, width=50)
            ent.grid(row=i, column=1, pady=5, padx=5)
            self.entries[txt] = ent

        btn = tk.Button(frame, text="Enregistrer",
                        command=self._write_prescription, bg=DARK_BLUE, fg=WHITE, padx=10, pady=5)
        btn.grid(row=len(labels), column=1, sticky='e', pady=20)

    def _write_prescription(self):
        vals = {k: e.get() for k, e in self.entries.items()}
        res = self.client.write_prescription(
            vals["CIN Patient"],
            vals["Date et heure (ISO)"],
            vals["Diagnostic"],
            vals["Traitement"],
            vals["Notes (opt.)"]
        )
        if "succées" in res.get("message", ""):
            messagebox.showinfo("Succès", "Prescription enregistrée.")
            for e in self.entries.values():
                e.delete(0, tk.END)
        else:
            messagebox.showerror("Erreur", res.get("message", "Erreur inconnue"))

    def _tab_profile(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="Profil")
        profile = self.client.get_profile()
        for i, (k, v) in enumerate(profile.items()):
            tk.Label(frame, text=f"{k} :", bg=WHITE).grid(row=i, column=0, sticky='e', pady=5, padx=5)
            tk.Label(frame, text=v, bg=WHITE).grid(row=i, column=1, sticky='w', pady=5, padx=5)

        btn = tk.Button(frame, text="Se déconnecter", command=self._logout,
                        bg=DARK_BLUE, fg=WHITE, padx=10, pady=5)
        btn.grid(row=len(profile), column=1, sticky='e', pady=20)

    def _logout(self):
        if self.client.logout():
            self.destroy()
            # relancer la page de connexion
            from login_page import LoginPage
            LoginPage().mainloop()
        else:
            messagebox.showerror("Erreur", "Échec de la déconnexion.")

