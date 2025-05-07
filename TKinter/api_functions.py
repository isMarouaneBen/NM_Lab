import requests

BASE_URL = "http://127.0.0.1:8000"

class APIClient:
    def __init__(self):
        self.token = None

    def login(self, email: str, password: str) -> bool:
        url = f"{BASE_URL}/users/login/"
        resp = requests.post(url, json={"email": email, "password": password})
        if resp.status_code == 200:
            self.token = resp.json().get("access")
            return True
        return False

    def logout(self) -> bool:
        url = f"{BASE_URL}/users/logout/"
        headers = {"Authorization": f"Bearer {self.token}"}
        resp = requests.post(url, headers=headers)
        if resp.status_code == 200:
            self.token = None
            return True
        return False

    def get_today_appointments(self):
        url = f"{BASE_URL}/docteur/today-rendezvous/"
        headers = {"Authorization": f"Bearer {self.token}"}
        return requests.get(url, headers=headers).json()

    def get_upcoming_appointments(self):
        url = f"{BASE_URL}/docteur/upcoming-rendezvous/"
        headers = {"Authorization": f"Bearer {self.token}"}
        return requests.get(url, headers=headers).json()

    def cancel_appointment(self, rendez_vous_id: int):
        url = f"{BASE_URL}/docteur/cancel-rendezvous/{rendez_vous_id}/"
        headers = {"Authorization": f"Bearer {self.token}"}
        return requests.post(url, headers=headers).json()

    def write_prescription(self, patient_cin: str, date_rdv: str,
                           diagnostique: str, traitment: str, notes: str = ""):
        url = f"{BASE_URL}/docteur/write-prescription/"
        headers = {"Authorization": f"Bearer {self.token}"}
        data = {
            "patient_cin": patient_cin,
            "date_rendezvous": date_rdv,
            "diagnostique": diagnostique,
            "traitment": traitment,
            "notes": notes
        }
        return requests.post(url, json=data, headers=headers).json()

    def get_historic_prescriptions(self, cin: str):
        url = f"{BASE_URL}/docteur/historic-prescriptions/?cin={cin}"
        headers = {"Authorization": f"Bearer {self.token}"}
        return requests.get(url, headers=headers).json()

    def get_profile(self):
        url = f"{BASE_URL}/docteur/profile/"
        headers = {"Authorization": f"Bearer {self.token}"}
        return requests.get(url, headers=headers).json()
