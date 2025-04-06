### Main functionnalities of patient_app ###

- Patient can reserve an appointment
- Patient can cancel an appointment 
- Patient can see his historical appointments
- Patient can see actual prescriptions
- Patient can communicate with the Doctor ( or ai supported chatbot )




"every endpoint need authorization permissons in this collection ". 



RESERVER UN RENDEZ VOUS ( POST ):
url : "localhost_url + /patient/rendezvous/reserver/"
exemple JSON to send (description is not required):
{ "nom_docteur": "John Doe", "date_rendezvous": "2025-04-10T14:30", "description_rendezvous": "Consultation générale" }
responses :
201 if reservation went successful.
400 for bad requests and errors .
Annuler un rdv (DELETE) :
url : "localhost_url + /patient/rendezvous/annuler/"
responses :
202 if request went successful.
404 for bad requests and errors .
JSON of response (202):

  {"message":"rendez-vous annulé avec succés"  }


Envoyer un message (POST) :
url : "localhost_url + /patient/messages/envoyer-message/"
exemple JSON to send :
{ "receiver_email": "destinataire@example.com", "message_content": "Bonjour, voici un message de test hpour vérifier le bon fonctionnement de l'API de messagerie.", "objet": "Test de l'API de messagerie" }
responses :
201 if request went successful.
400 for bad requests and errors .
voir les messages (GET) :
url : "localhost_url + /patient/messages/voir-messages/"
exemple JSON :


[
    {
        "id": 2,
        "objet": "Confirmation rendez-vous",
        "message_content": "Bonjour, je souhaite confirmer notre rendez-vous de demain à 14h. Merci de me confirmer votre disponibilité.",
        "date_message": "2025-04-02T02:45:34.799530Z",
        "envoie": 4,
        "reception": 5
    }
]


responses :
200 if request went successful.
400 for bad requests and errors .
HISTORIQUE DES RENDEZ VOUS ( GET ):
url : "localhost_url + /patient/rendezvous/historique//"
responses :
201 if reservation went successful.
404 for bad requests and errors .
HISTORIQUE DES PRESCRIPTIONS ( GET ) :
exemple JSON :

{
    "message": "Aucune prescription trouvée pour ce patient."
}


responses :
200 if request went successful.
404 for bad requests and errors ( like the one in the example )


