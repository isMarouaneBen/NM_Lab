import tkinter as tk
from tkinter import messagebox
import api_functions

class AuthPage:
    def __init__(self, root=None):
        self.root = root or tk.Tk()
        self.root.title("Authentification Docteur")
        self.root.geometry("400x250")
        self.root.configure(bg="#0A2740")  # bleu foncé

        # Email
        tk.Label(self.root, text="Email:", fg="white", bg="#0A2740").pack(pady=(20,5))
        self.email_entry = tk.Entry(self.root, width=30)
        self.email_entry.pack()

        # Mot de passe
        tk.Label(self.root, text="Mot de passe:", fg="white", bg="#0A2740").pack(pady=(10,5))
        self.password_entry = tk.Entry(self.root, width=30, show="*")
        self.password_entry.pack()

        # Bouton de connexion
        tk.Button(
            self.root, text="Se connecter", command=self.login,
            fg="white", bg="#1E3A8A", width=15, bd=0, pady=5
        ).pack(pady=(20,10))

        self.root.mainloop()

    def login(self):
        email = self.email_entry.get()
        password = self.password_entry.get()
        success, token, user_data = api_functions.login(email, password)
        if success:
            messagebox.showinfo("Succès", "Authentification réussie !")
            self.root.destroy()
            import dashboard
            dashboard.MainDashboard(token, user_data)
        else:
            messagebox.showerror("Erreur", "Email ou mot de passe invalide.")


if __name__ == "__main__":
    AuthPage()