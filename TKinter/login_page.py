import tkinter as tk
from tkinter import messagebox
from api_functions import APIClient
from dashboard import DoctorDashboard

DARK_BLUE = "#0B3D91"
WHITE = "#FFFFFF"

class LoginPage(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Connexion Docteur")
        self.configure(bg=DARK_BLUE)
        self.geometry("400x250")
        self.client = APIClient()
        self._build_ui()

    def _build_ui(self):
        tk.Label(self, text="Email :", bg=DARK_BLUE, fg=WHITE, font=("Arial", 12)).pack(pady=(30,5))
        self.email_entry = tk.Entry(self, width=30, font=("Arial", 12))
        self.email_entry.pack()

        tk.Label(self, text="Mot de passe :", bg=DARK_BLUE, fg=WHITE, font=("Arial", 12)).pack(pady=5)
        self.password_entry = tk.Entry(self, show="*", width=30, font=("Arial", 12))
        self.password_entry.pack()

        btn = tk.Button(self, text="Se connecter", command=self._login,
                        font=("Arial", 12, "bold"), bg=WHITE, fg=DARK_BLUE, padx=10, pady=5)
        btn.pack(pady=20)

    def _login(self):
        email = self.email_entry.get()
        pwd = self.password_entry.get()
        if self.client.login(email, pwd):
            self.destroy()
            dash = DoctorDashboard(self.client)
            dash.mainloop()
        else:
            messagebox.showerror("Erreur", "Échec de la connexion\nVérifiez vos identifiants.")

if __name__ == "__main__":
    LoginPage().mainloop()
