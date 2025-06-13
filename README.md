# NMLab - Système de Gestion de Cabinet Médical

## 📋 Description

NMLab est une application web complète de gestion de cabinet médical développée avec Django et Django REST Framework. Elle permet la gestion efficace des patients, des médecins, des rendez-vous et des prescriptions médicales.

## 🚀 Fonctionnalités

- **Gestion des Utilisateurs**
  - Authentification sécurisée
  - Gestion des rôles (patients, médecins, administrateurs)
  - Système de récupération de mot de passe

- **Gestion des Patients**
  - Dossiers médicaux électroniques
  - Historique des consultations
  - Gestion des allergies et antécédents

- **Gestion des Médecins**
  - Profils détaillés des praticiens
  - Gestion des disponibilités
  - Suivi des prescriptions

- **Statistiques et Analyses**
  - Tableau de bord analytique
  - Rapports d'activité
  - Indicateurs de performance

## 🛠 Technologies Utilisées

- **Backend**: Django 4.x, Django REST Framework
- **Frontend**: HTML5, CSS3, JavaScript
- **Base de données**: SQLite3
- **Interface utilisateur**: Framework CSS moderne

## ⚙️ Installation

1. Cloner le répertoire :
```bash
git clone https://github.com/isMarouaneBen/NM_Lab
cd NM_Lab
```

2. Créer un environnement virtuel :
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

4. Appliquer les migrations :
```bash
python manage.py migrate
```

5. Lancer le serveur de développement :
```bash
cd lab_proj && python manage.py runserver
```

## 🏗 Structure du Projet

```
lab_proj/
├── auth_app/          # Gestion de l'authentification
├── docteur_app/       # Gestion des médecins
├── patient_app/       # Gestion des patients
├── stat_app/          # Statistiques et analyses
├── templates/         # Templates HTML
└── lab_proj/         # Configuration principale
```

## 🔐 Configuration

1. Créer un fichier `.env` à la racine du projet
2. Configurer les variables d'environnement nécessaires :
```
SECRET_KEY=votre_clé_secrète
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

## 👥 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence GNU General Public License v3.0 - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue ou à nous contacter directement.
