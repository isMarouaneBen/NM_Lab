### main fucntionnalities of doctor app ###

- Doctor can see appointments of today
- Doctor can cancel an appointment (we need to inform patient that appointment is cancelled)
- Doctor can communicate with his patients through the app
- Doctor can write prescriptions to his patient
- Doctor can check historic prescriptions of his patient


1. Cancel Appointmentof
Endpoint: POST /cancel-rendezvous//
View Function: docteurCancelRendezvousView
Authentication: Required
Permission: IsAuthenticated
Description:
Allows doctors to cancel a scheduled appointment with a patient.
URL Parameters:
rendez_vous_id (integer): The ID of the appointment to cancel

Response:
{ "message": "rendez-vous annulé avec succées et le patient est informé dans sa boit email"}
{ "message": "error: [error details]"}
Additional Information:
Changes appointment status to 'annulé'
Automatically sends cancellation email to the patient
Email contains doctor's name and appointment details

2. Upcoming Appointments
Endpoint: GET /upcoming-rendezvous/
View Function: upcomingRendezvousView
Authentication: Required
Permission: IsAuthenticated
Description:
Returns all future appointments that are currently in 'planifié' (planned) status.
Response:
Success (200 OK): List of upcoming appointments serialized with RendezVousSerializer
Empty list if no upcoming appointments

3. Today's Appointments
Endpoint: GET /today-rendezvous/
View Function: todayRendezVousView
Authentication: Required
Permission: IsAuthenticated
Description:
Returns all appointments scheduled for the current day for the authenticated doctor.
Response:
Success (200 OK): List of today's appointments serialized with RendezVousSerializer
{ "message": "pas de rendez-vous aujourd'hui"}

Additional Information:
Automatically updates appointment statuses before returning results
Filters appointments based on authenticated user (doctor)

4. Write Prescription
Endpoint: POST /write-prescription/
View Function: writePrescriptionView
Authentication: Required
Permission: IsAuthenticated
Description:
Allows doctors to create a new prescription for a patient based on an appointment.
Request Body:


{
  "patient_cin": "AB123456",
  "date_rendezvous": "2025-04-03T09:30:00Z",
  "diagnostique": "Patient diagnosis details",
  "traitment": "Treatment details and medications",
  "notes": "Additional notes (optional)"
}


Response:
{ "message": "prescription ecrite avec succées"}
Error (400 Bad Request): Validation errors from serializer

Additional Information:
Automatically links prescription to the corresponding appointment
Requires valid patient CIN and appointment date

5. Write Message
Endpoint: POST /write-message/
View Function: writeMessageView
Authentication: Required
Permission: IsAuthenticated
Description:
Allows users to send messages to other users in the system.
Request Body:
{
  "receiver_email": "recipient@example.com",
  "message_content": "Message body text",
  "objet": "Message subject"
}


Response:
Success (201 Created): Serialized message data
{ "message": "veuiller remplire les champs."}
{ "message": "destinataire non trouvable."}

Additional Information:
Sender is automatically set to the authenticated user
Requires valid recipient email address

6. See Messages
Endpoint: POST /see-messages/
View Function: seeMessagesView
Authentication: Required
Permission: IsAuthenticated
Description:
Returns all messages sent and received by the authenticated user, ordered by date (newest first).
Response:
Success (200 OK): List of messages serialized with MessageSerializer
{ "message": "aucun message"}

Additional Information:
Retrieves both sent and received messages
Orders messages by date in descending order

7. Historic Prescriptions
Endpoint: GET /historic-prescriptions//
View Function: historicPrescriptionView
Authentication: Required
Permission: IsAuthenticated
Description:
Returns all prescriptions for a specific patient identified by their CIN.
URL Parameters:
cin (string): The patient's identification number

Response:
Success (200 OK): List of prescriptions serialized with PrescriptionSerializer
{ "message": "aucun prescriptions encore pour cet patient"}

Additional Information:
Automatically updates appointment statuses before returning results
Requires valid patient CIN

Models Information
Prescription Model
date: Foreign key to RendezVous (appointment)
diagnostique: Text field for diagnosis (required)
traitment: Text field for treatment details (required)
notes: Text field for additional notes (optional, max 256 characters)

Message Model
objet: Subject line (required, max 50 characters)
envoie: Foreign key to User (sender)
reception: Foreign key to User (recipient)
message_content: Text field for message body
date_message: Auto-filled creation timestamp

Utility Functions
update_rendez_vous_etat()
Updates appointment statuses automatically:
Changes appointments with status 'planifié' (planned) to 'completé' (completed) if their scheduled date has passed

