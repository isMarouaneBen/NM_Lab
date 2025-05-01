//author:Marouane Ben Haddou
try {
  const tokenTest = sessionStorage.getItem('patientoken');

  if (tokenTest === null) {
    throw new Error("Token not found");
  }

} catch (error) {
  window.location.href = "login.html";
}

const token = sessionStorage.getItem('patientoken');
let docID = null;
let currentUserId = null;
let patientData = JSON.parse(sessionStorage.getItem('patientData'));
function isoToDateTime(isoString) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
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
          sessionStorage.removeItem('authToken');
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

  initEventListeners();
  renderAll();

  function initEventListeners() {
    DOM.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    if (DOM.newAppointmentBtn) {
      DOM.newAppointmentBtn.addEventListener('click', () => switchTab('appointments'));
    }
    const seePrescriptions = document.getElementById('btn-check-prescriptions');
    seePrescriptions.addEventListener('click', () => switchTab('prescriptions'));
    if (DOM.contactDoctorBtn) {
      DOM.contactDoctorBtn.addEventListener('click', () => {
        switchTab('messages');
        if (DOM.messageInput) {
          DOM.messageInput.focus();
        }
      });
    }
    if (DOM.viewPrescriptionBtn) {
      DOM.viewPrescriptionBtn.addEventListener('click', () => switchTab('prescriptions'));
    }

    if (DOM.appointmentForm) {
      DOM.appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addAppointment();
      });
    }
    
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

    });
    
    window.addEventListener('click', function(e) {
      if (e.target === DOM.cancelModal) {
        DOM.cancelModal.classList.remove('active');
      }
    });
    
    if (DOM.closeModal) {
      DOM.closeModal.addEventListener('click', () => {
        DOM.cancelModal.classList.remove('active');
      });
    }
  }

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

  function renderAll() {
    renderPrescriptions();
    renderProfile();
    prendreRdv();
    renderHistory();
    renderNextRdv();
    renderPatientName();
  }

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


  const name = document.getElementById("patient-name");
  name.innerHTML = `${patientData.user.first_name} ${patientData.user.last_name}`;
}

async function renderDrList() {

  const patientList = document.querySelector(".patients-list");
  const sendBtn = document.getElementById("btn-send-message");
  
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
        'Content-Type': 'application/json'
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
        chat.innerHTML = `
          <div class="empty-chat">
            <i class="fas fa-comment-dots"></i>
            <p>Envoyez votre premier message</p>
          </div>`;
        return;
      }
      
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

function groupMessagesByDay(messages) {
  return messages.reduce((groups, msg) => {
    const date = new Date(msg.date_message).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});
}

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
      
      chat.scrollTop = chat.scrollHeight;
      
      messageInput.value = '';
      
      getConversations(docID);
      
    } else {
      console.error('Failed to send message:', await response.text());
      const errorToast = document.createElement('div');
      errorToast.className = 'error-toast';
      errorToast.textContent = "Échec de l'envoi du message";
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        errorToast.remove();
      }, 3000);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}