let docID = null;
let currentUserId = null;
const token = localStorage.getItem('patientoken');
let patientData = JSON.parse(localStorage.getItem('patientData')); 
function isoToDateTime(isoString) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} à ${hours}:${minutes}`;
}

document.addEventListener('DOMContentLoaded', function() {
  const logoutbutton = document.querySelector(".btn-logout")
  
  logoutbutton.addEventListener('click', function() {
    
    console.log("Token found:", token);
    
    async function logouthandling() {
      try {
        const response = await fetch("http://127.0.0.1:8000/users/logout/", {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log("Server response status:", response.status);
        const data = await response.json();
        console.log("Server response data:", data);
        
        if (response.ok) {
          console.log("Logout successful, clearing token and redirecting...");
          localStorage.removeItem('authToken');
          window.location.href = 'login.html';
        } else {
          console.error('Error:', data.detail || 'Logout failed');
          console.log(token);
        }
      } catch (error) {
        console.error('Error during logout:', error.message);
      }
    }
    
    logouthandling();
  });

  const state = {
    upcomingAppointments: [
      {
        id: 1,
        doctor: 'Dr. Martin',
        specialty: 'Cardiologist',
        date: '2023-06-15',
        time: '14:30',
        reason: 'Annual checkup'
      }
    ],
    pastAppointments: [
      {
        id: 101,
        doctor: 'Dr. Lefevre',
        specialty: 'Dermatologist',
        date: '2023-05-10',
        time: '10:00',
        reason: 'Skin rash consultation'
      },
      {
        id: 102,
        doctor: 'Dr. Petit',
        specialty: 'General',
        date: '2023-04-20',
        time: '09:30',
        reason: 'Routine checkup'
      }
    ],
    prescriptions: [
      {
        medication: 'Atorvastatine',
        dosage: '20mg',
        instructions: 'Take one tablet daily after dinner',
        doctor: 'Dr. Martin'
      },
      {
        medication: 'Ibuprofen',
        dosage: '400mg',
        instructions: 'Take one tablet every 8 hours for pain relief',
        doctor: 'Dr. Lefevre'
      }
    ],
    messages: [],
    profile: {
      name: 'Marouane Ben Haddou',
      age: 30,
      email: 'marouane@example.com',
      phone: '0123456789',
      address: '123 Rue de Exemple, Ville, Pays'
    },
    doctorsBySpecialty: {
      cardiology: ['Dr. Martin', 'Dr. Bernard'],
      dermatology: ['Dr. Lefevre', 'Dr. Moreau'],
      general: ['Dr. Petit', 'Dr. Durand']
    },
    availableTimes: ['09:00', '09:30', '10:00', '14:00', '14:30']
  };

  // Références DOM
  const DOM = {
    cancelModal: document.getElementById('cancel-modal'),
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-text'),
    tabs: document.querySelectorAll('.sidebar nav ul li'),
    contents: document.querySelectorAll('.content'),
    pageTitle: document.getElementById('page-title'),
    newAppointmentBtn: document.getElementById('btn-new-appointment'),
    contactDoctorBtn: document.getElementById('btn-contact-doctor'),
    viewPrescriptionBtn: document.getElementById('btn-view-prescription'),
    appointmentForm: document.getElementById('appointment-form'),
    specialtySelect: document.getElementById('specialty'),
    doctorSelect: document.getElementById('doctor'),
    dateInput: document.getElementById('date'),
    timeSelect: document.getElementById('time'),
    reasonTextarea: document.getElementById('reason'),
    closeModal: document.querySelector('.close-modal')
  };

  // Initialisation
  initEventListeners();
  renderAll();

  // Ajout des écouteurs
  function initEventListeners() {
    // Gestion des onglets
    DOM.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Bouton "New Appointment"
    if (DOM.newAppointmentBtn) {
      DOM.newAppointmentBtn.addEventListener('click', () => switchTab('appointments'));
    }
    
    // Bouton "Contact Doctor"
    if (DOM.contactDoctorBtn) {
      DOM.contactDoctorBtn.addEventListener('click', () => {
        switchTab('messages');
        if (DOM.messageInput) {
          DOM.messageInput.focus();
        }
      });
    }

    // Bouton "Voir détails" pour la prescription
    if (DOM.viewPrescriptionBtn) {
      DOM.viewPrescriptionBtn.addEventListener('click', () => switchTab('prescriptions'));
    }
    
    // Formulaire d'appointment
    // if (DOM.specialtySelect) {
    //   DOM.specialtySelect.addEventListener('change', updateDoctors);
    // }

    if (DOM.appointmentForm) {
      DOM.appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addAppointment();
      });
    }
    
    // Délégation d'événements pour les boutons dans les rendez-vous
    document.addEventListener('click', function(e) {
      if (e.target.closest('#cancel-main-appointment')) {
        DOM.cancelModal.classList.add('active');
      }
      if (e.target.closest('#btn-send-message')) {
        sendMessage();
      }
      if (e.target.closest('#confirm-cancel')) {
        cancelAppointment(state.upcomingAppointments[0]?.id);
        DOM.cancelModal.classList.remove('active');
      }
      // Écouteur pour le bouton "Delete" dans les rendez-vous
      // if (e.target.closest('.btn-delete')) {
      //   const id = e.target.closest('.btn-delete').dataset.id;
      //   if (confirm("Are you sure you want to delete this appointment?")) {
      //     cancelAppointment(parseInt(id));
      //   }
      // }
      // Écouteur pour le bouton "View" dans les rendez-vous
      // if (e.target.closest('.btn-view')) {
      //   const id = e.target.closest('.btn-view').dataset.id;
      //   viewAppointment(parseInt(id));
      // }
    });
    
    // Fermeture de la modal en cliquant en dehors
    window.addEventListener('click', function(e) {
      if (e.target === DOM.cancelModal) {
        DOM.cancelModal.classList.remove('active');
      }
    });
    
    // Fermeture de la modal via l'icône
    if (DOM.closeModal) {
      DOM.closeModal.addEventListener('click', () => {
        DOM.cancelModal.classList.remove('active');
      });
    }
  }

  // Changement d'onglet
  function switchTab(tabName) {
    DOM.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    DOM.contents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-content`);
    });
    const tabText = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabText) {
      DOM.pageTitle.textContent = tabText.textContent.trim();
    }
    if(tabName === 'messages'){
      renderDrList();    }
    if(tabName === 'dashboard') {
      renderNextRdv();
    }
    if (tabName === 'history') {
      renderHistory();
    }
    if (tabName === 'profile') {
      renderProfile();
    }
    if (tabName === 'prescriptions') {
      renderPrescriptions();
    }

  }

  // Rendu global
  function renderAll() {
    // renderDashboard();
    // renderAppointments();
    // renderMessages();
    renderPrescriptions();
    renderProfile();
    prendreRdv();
    renderHistory();
    renderNextRdv();
    renderPatientName();
  }

  // function renderDashboard() {
  //   const container = document.querySelector('.next-appointment');
  //   const nextAppointment = state.upcomingAppointments[0];
  //   container.innerHTML = nextAppointment ? `
  //     <p><strong>${nextAppointment.doctor}</strong> - ${nextAppointment.specialty}</p>
  //     <p><i class="far fa-calendar-alt"></i> ${formatDate(nextAppointment.date)} at ${nextAppointment.time}</p>
  //     <button class="btn-cancel" id="cancel-main-appointment">Cancel</button>
  //   ` : '<p>No upcoming appointment</p>';
  // }

  // Appointments
  // function renderAppointments() {
  //   const container = document.querySelector('.upcoming-appointments');
  //   container.innerHTML = state.upcomingAppointments.map(appointment => `
  //     <div class="appointment-item">
  //       <div class="appointment-info">
  //         <h4>${appointment.doctor} - ${appointment.specialty}</h4>
  //         <p><i class="far fa-calendar-alt"></i> ${formatDate(appointment.date)} at ${appointment.time}</p>
  //         <p><i class="far fa-comment"></i> ${appointment.reason}</p>
  //       </div>
  //       <div class="appointment-actions">
  //         <button class="btn-view" data-id="${appointment.id}">View</button>
  //         <button class="btn-delete" data-id="${appointment.id}">Delete</button>
  //       </div>
  //     </div>
  //   `).join('');
  // }

  // Messages
  // function renderMessages() {
  //   if (DOM.chatMessages) {
  //     DOM.chatMessages.innerHTML = state.messages.map(msg => `
  //       <div class="message ${msg.isPatient ? 'patient' : 'doctor'}">
  //         <p>${msg.text}</p>
  //         <span>${msg.time}</span>
  //       </div>
  //     `).join('');
  //     DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
  //   }
  // }

  async function renderPrescriptions() {
    const url = "http://127.0.0.1:8000/patient/prescriptions/voirprescriptions/";
    const container = document.querySelector('.prescription-list');
    const response = await fetch(url, {
      method:'GET',
      headers:{
        'Authorization':`Token ${token}`,
        'Content-Type':'application/json'
      }
    });
    if(response.ok){
      if (container) {
        const data = await response.json();
        container.innerHTML = data.map(prescription => `
          <div class="prescription-item">
            <div class="prescription-info">
              <h4>${prescription.diagnostique}</h4>
              <p>${prescription.traitment}</p>
              <p>${prescription.notes}</p>
            </div>
          </div>
        `).join('') ;
      }
    } else if (response.status == 404) {
      container.innerHTML = "<p>Aucune prescription trouvée pour ce patient.</p>";
    } else {
      console.log("erreur dans la fonction renderPrescriptions");
    }
  }

  // Historique
  async function renderHistory() {
    const container = document.querySelector('.history-list');
    const url = `http://127.0.0.1:8000/patient/rendezvous/historique/${patientData.cin}/`;
    const result = await fetch(url ,{
      method:'GET',
      headers:{
        'Authorization':`Token ${token}`,
        'Content-Type': "application/json"
      }
    });
    if(result.ok) {
      if (container) {
        const data = await result.json();
        container.innerHTML = data.map(appointment => `
          <div class="appointment-item">
            <div class="appointment-info">
              <h4>Dr.${appointment.docteur_nom.toUpperCase()} - ${appointment.description}</h4>
              <p><i class="far fa-calendar-alt"></i> ${isoToDateTime(appointment.date)}</p>
            </div>
          </div>
        `).join('');
      }
    } else if(result.status === 404) {
      container.innerHTML = `<p>Pas de Rendez-Vous Pour cet Patient</p>`;
    }
    else {
      console.error("error de la fonction renderHistory !");
    }

  }

  // Profil
  function renderProfile() {
    const container = document.querySelector('.profile-details');
    if (container) {
      container.innerHTML = `
        <p><strong>Nom:</strong> ${patientData.user.first_name} ${patientData.user.last_name}</p>
        <p><strong>Date De Naissance:</strong> ${patientData.date_naissance}</p>
        <p><strong>Email:</strong> ${patientData.user.email}</p>
        <p><strong>Allergie:</strong> ${patientData.allergies}</p>
        <p><strong>Sexe:</strong> ${patientData.sexe}</p>
        <p><strong>Groupe Sanguin:</strong> ${patientData.groupe_sanguin}</p>
      
        `;
    }
  }

  // Envoi de message
  // function sendMessage() {
  //   JSON(data.stringify())
  //   const text = DOM.messageInput.value.trim();
  //   if (!text) {
  //     alert("Please enter a message.");
  //     return;
  //   }
  //   const escapedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  //   state.messages.push({
  //     text: escapedText,
  //     isPatient: true,
  //     time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  //   });
  //   DOM.messageInput.value = '';
  //   renderMessages();
  //   setTimeout(() => {
  //     state.messages.push({
  //       text: 'Thank you for your message. We will respond shortly.',
  //       isPatient: false,
  //       time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  //     });
  //     renderMessages();
  //   }, 1500);
  // }

  // Suppression d'un rendez-vous
  // function cancelAppointment(id) {
  //   state.upcomingAppointments = state.upcomingAppointments.filter(a => a.id !== id);
  //   renderAppointments();
  //   renderDashboard();
  //   renderHistory();
  // }

  // Affichage des détails d'un rendez-vous
  // function viewAppointment(id) {
  //   const appointment = state.upcomingAppointments.find(a => a.id === id);
  //   if (appointment) {
  //     alert(`Appointment Details:\nDoctor: ${appointment.doctor}\nSpecialty: ${appointment.specialty}\nDate: ${formatDate(appointment.date)} at ${appointment.time}\nReason: ${appointment.reason}`);
  //   } else {
  //     alert("Appointment not found.");
  //   }
  // }

  async function renderAllDoctors(){
    const url = "http://127.0.0.1:8000/patient/list-doctors/";
    const options = document.getElementById("doctor");
  
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    try {
      const data = await response.json();
      data.forEach(info => {
        options.innerHTML += `<option value="${info.nom_doc}">${info.nom_doc}-${info.specialite}</option>`;
      });
    } catch(error) {
      console.error("erreur lors de la fonction renderAllDoctors ! : ", error);
    }
  }
  
  function toIsoFormat(dateString) {
    const date = new Date(dateString);
    return date.toISOString();
  }
  
  async function prendreRdv() {
    await renderAllDoctors();
    const docteurSelect = document.getElementById("doctor"); 
    const dateRdv = document.getElementById("date");
    const description = document.getElementById("reason");
    const url = "http://127.0.0.1:8000/patient/rendezvous/reserver/";
    const btnReserver = document.getElementById("btn-submit-appointment");
    const sucess = document.getElementById("appointment-sucess");
    const fail = document.getElementById("appointment-error");
  
    btnReserver.addEventListener('click', async() => {
      const result = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({  
          'nom_docteur': docteurSelect.value,
          'date_rendezvous': toIsoFormat(dateRdv.value),
          'description_rendezvous': description.value
        })
      });
      
      if(result.ok) {
        dateRdv.value = '';
        description.value = '';
        docteurSelect.value = '';
        sucess.innerHTML = "Rendez vous ajouté avec succés";
        setTimeout(()=>{location.reload()},3000);
      } else {
        console.log("erreur du systeme :", result);
        fail.innerHTML = "Nombre de Rendez vous atteint, le docteur a deja un Rendez vous dans la date que vous proposez, ou une erreur systeme est survenue";
      }
    });
  }
});

async function renderNextRdv() {
  const nextRdv = document.getElementById("next");
  if (!nextRdv) {
    console.error("Élément 'next' non trouvé");
    return;
  }
  
  const url = `http://127.0.0.1:8000/patient/next-rdv/${patientData.cin}/`;
  const result = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (result.ok) {
    const data = await result.json();
    console.log(data.docteur_nom);
    
    nextRdv.innerHTML = `<p><strong>DR.${data.docteur_nom}</strong> - ${data.description}</p>
                          <p><i class="far fa-calendar-alt"></i> ${isoToDateTime(data.date)}</p>
                          <button class="btn-cancel">Annuler</button>`;
    
    if (!document.getElementById('modal-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'modal-styles';
      styleSheet.innerHTML = `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-container {
          background-color: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 80%;
          text-align: center;
          animation: fadeIn 0.3s;
        }
        .modal-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333;
        }
        .modal-message {
          margin-bottom: 20px;
          color: #555;
        }
        .modal-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
        }
        .modal-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .modal-btn-confirm {
          background-color: #e74c3c;
          color: white;
        }
        .modal-btn-confirm:hover {
          background-color: #c0392b;
        }
        .modal-btn-cancel {
          background-color: #ecf0f1;
          color: #333;
        }
        .modal-btn-cancel:hover {
          background-color: #bdc3c7;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(styleSheet);
    }
    
    const cancelBtn = document.querySelector(".btn-cancel");
    cancelBtn.addEventListener('click', async () => {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-container">
          <div class="modal-title">Confirmation</div>
          <div class="modal-message">Êtes-vous sûr de vouloir annuler ce rendez-vous?</div>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-cancel">Non, garder</button>
            <button class="modal-btn modal-btn-confirm">Oui, annuler</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      return new Promise((resolve) => {
        modal.querySelector('.modal-btn-confirm').addEventListener('click', async () => {
          document.body.removeChild(modal);
          
          const urlCancel = `http://127.0.0.1:8000/patient/rendezvous/annuler/${data.id}/`;
          
          try {
            const reponse = await fetch(urlCancel, {
              method: 'DELETE',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (reponse.ok) {
              showNotificationModal('Succès', 'Votre rendez-vous a été annulé avec succès.', 'success', () => {
                window.location.reload();
              });
            } else {
              showNotificationModal('Erreur', 'Échec de l\'annulation du rendez-vous. Veuillez réessayer.', 'error');
            }
          } catch (error) {
            console.error("Erreur lors de l'annulation:", error);
            showNotificationModal('Erreur', 'Une erreur s\'est produite lors de l\'annulation du rendez-vous.', 'error');
          }
          
          resolve(true);
        });
        
        modal.querySelector('.modal-btn-cancel').addEventListener('click', () => {
          document.body.removeChild(modal);
          resolve(false);
        });
      });
    });
  } else if (result.status === 404) {
    nextRdv.innerHTML = `<p style="text-align: center;">Aucun rendez-vous encore</p>`;
  } else {
    console.log("Erreur dans la fonction de nextRdv");
    nextRdv.innerHTML = `<p style="text-align: center;">Impossible de charger les rendez-vous</p>`;
  }
}

function showNotificationModal(title, message, type, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  
  const iconType = type === 'success' 
    ? '<i class="fas fa-check-circle" style="font-size: 3rem; color: #2ecc71; margin-bottom: 15px;"></i>'
    : '<i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 15px;"></i>';
  
  modal.innerHTML = `
    <div class="modal-container">
      ${iconType}
      <div class="modal-title">${title}</div>
      <div class="modal-message">${message}</div>
      <div class="modal-buttons">
        <button class="modal-btn ${type === 'success' ? 'modal-btn-confirm' : 'modal-btn-cancel'}" style="${type === 'success' ? 'background-color: #2ecc71' : ''}">OK</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.modal-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
    if (callback) callback();
  });
}

function renderPatientName(){

  //cette fonction pour retourner la liste des docteurs pour contacter

  const name = document.getElementById("patient-name");
  name.innerHTML = `${patientData.user.first_name} ${patientData.user.last_name}`;
}

async function renderDrList() {
  const patientList = document.querySelector(".patients-list");
  const sendBtn = document.getElementById("btn-send-message");
  
  // Check if element exists first
  if (!patientList) {
    console.error("Patient list container not found");
    return;
  }

  const url = "http://127.0.0.1:8000/patient/contacts-doctors/";
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json' // Fixed content type
      }
    });

    if (response.ok) {
      const data = await response.json();
      patientList.innerHTML = '';
      
      if (data.length > 0) {
        patientList.innerHTML = data.map(contact => `
          <div class="patient-card active" id="${contact.id_doc}">
            <h2>${contact.nom_doc}</h2>
            <p>${contact.email_doc}</p>
          </div>
        `).join('');

        document.querySelectorAll('.patient-card').forEach(card => {
          sendBtn.addEventListener('click', ()=>{
            sendMessage(docID);
          })
          card.addEventListener('click', () => {
            docID = card.id;
            getConversations(card.id);
           
            
            document.querySelectorAll('.patient-card').forEach(c => {
              c.classList.remove('active');
            });
            card.classList.add('active');
          });
        });
      } else {
        patientList.innerHTML = `
          <div class="no-doctors">
            <i class="fas fa-user-md"></i>
            <p>Aucun docteur disponible</p>
          </div>`;
      }
    } else if (response.status === 404) {
      patientList.innerHTML = `
        <div class="no-doctors">
          <i class="fas fa-user-md"></i>
          <p>Aucun docteur trouvé</p>
        </div>`;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error in renderDrList:", error);
    patientList.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erreur lors du chargement des docteurs</p>
      </div>`;
  }
}
async function getConversations(idContact) {
  const chat = document.getElementById("chat-messages");
  const url = `http://127.0.0.1:8000/patient/messages/voir-messages/${idContact}/`;
  try {
    chat.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Chargement des messages...</p>
      </div>`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const messages = await response.json();
      chat.innerHTML = ''; 
      
      if (messages.length === 0) {
        // Aucun message
        chat.innerHTML = `
          <div class="empty-chat">
            <i class="fas fa-comment-dots"></i>
            <p>Envoyez votre premier message</p>
          </div>`;
        return;
      }
      
      // Get current user info once before the loop
      const userResponse = await fetch(`http://127.0.0.1:8000/patient/users/${patientData.id}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        currentUserId = userData.user_id;
      } else {
        console.error("Error fetching user data");
      }
      
      messages.sort((a, b) => new Date(a.date_message) - new Date(b.date_message));
      const groupedMessages = groupMessagesByDay(messages);
      
      for (const [date, dailyMessages] of Object.entries(groupedMessages)) {
        const dateSeparator = document.createElement('div');
        dateSeparator.className = 'date-separator';
        dateSeparator.textContent = formatChatDate(date);
        chat.appendChild(dateSeparator);
        
        dailyMessages.forEach(msg => {
          // Check if this message was sent by current user
          const isMe = msg.envoie === currentUserId;
          
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${isMe ? 'sent' : 'received'}`;
          
          messageDiv.innerHTML = `
            <div class="bubble">
              <div class="content">${msg.message_content}</div>
              <div class="time">${formatTime(msg.date_message)}</div>
            </div>
          `;
          
          chat.appendChild(messageDiv);
        });
      }
      
      setTimeout(() => {
        chat.scrollTop = chat.scrollHeight;
      }, 50);
      
    } else {
      throw new Error('Erreur de chargement');
    }
  } catch (error) {
    chat.innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-circle"></i>
        <p>Impossible de charger les messages</p>
      </div>`;
    console.error('Erreur:', error);
  }
}

// Helper: Grouper les messages par jour
function groupMessagesByDay(messages) {
  return messages.reduce((groups, msg) => {
    const date = new Date(msg.date_message).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});
}

// Helper: Formater la date pour les séparateurs
function formatChatDate(dateString) {
  const today = new Date().toDateString();
  const date = new Date(dateString);
  
  if (date.toDateString() === today) {
    return "Aujourd'hui";
  }
  
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('fr-FR', options);
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function sendMessage(docID) {
  const url = "http://127.0.0.1:8000/patient/messages/envoyer-message/";
  const messageInput = document.getElementById("message-text");
  
  // Check if message is empty
  if (!messageInput.value.trim()) {
    return; 
  }


  
  let messageData = {
    'objet': 'message',
    'envoie': currentUserId,
    'reception': docID,
    'message_content': messageInput.value
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData) 
    });
    
    if (response.ok) {
      const chat = document.getElementById("chat-messages");
      
      const today = new Date().toDateString();
      let todaySeparator = Array.from(chat.querySelectorAll('.date-separator')).find(
        sep => sep.textContent === "Aujourd'hui"
      );
      
      if (!todaySeparator) {
        todaySeparator = document.createElement('div');
        todaySeparator.className = 'date-separator';
        todaySeparator.textContent = "Aujourd'hui";
        chat.appendChild(todaySeparator);
      }
      
      // Create message element
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message sent';
      
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit', 
        minute: '2-digit'
      });
      
      messageDiv.innerHTML = `
        <div class="bubble">
          <div class="content"><p>${messageInput.value}</p></div>
          <div class="time">${formattedTime}</div>
          <span class="status"><i class="fas fa-check"></i></span>
        </div>
      `;
      
      chat.appendChild(messageDiv);
      
      // Scroll to bottom
      chat.scrollTop = chat.scrollHeight;
      
      // Clear input field
      messageInput.value = '';
      
      // Optional: reload conversation from server to get proper message ID
      getConversations(docID);
      
    } else {
      console.error('Failed to send message:', await response.text());
      // Show error to user
      const errorToast = document.createElement('div');
      errorToast.className = 'error-toast';
      errorToast.textContent = "Échec de l'envoi du message";
      document.body.appendChild(errorToast);
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        errorToast.remove();
      }, 3000);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}