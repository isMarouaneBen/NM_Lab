import requests

BASE_URL = "http://127.0.0.1:8000"


def login(email, password):
    url = f"{BASE_URL}/users/login/"
    resp = requests.post(url, json={'email': email, 'password': password})
    if resp.status_code == 200:
        data = resp.json()
        return True, data.get('token'), data
    return False, None, None


def get_today_rendezvous(token):
    url = f"{BASE_URL}/docteur/today-rendezvous/"
    headers = {'Authorization': f"Token {token}"}
    resp = requests.get(url, headers=headers)
    if resp.ok:
        return resp.json()
    return []


def write_prescription(token, patient_id, prescription_text):
    url = f"{BASE_URL}/docteur/write-prescription/"
    headers = {'Authorization': f"Token {token}"}
    payload = {'patient_id': patient_id, 'prescription': prescription_text}
    return requests.post(url, json=payload, headers=headers)


def logout(token):
    url = f"{BASE_URL}/users/logout/"
    headers = {'Authorization': f"Token {token}"}
    return requests.post(url, headers=headers)
