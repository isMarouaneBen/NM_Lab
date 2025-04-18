document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const API_BASE_URL = 'http://localhost:8000/api';
  const CSS_CLASSES = {
      activeTab: 'active',
      modalVisible: 'active',
      notification: 'notification',
      messageDoctor: 'message.doctor',
      messagePatient: 'message.patient'
  };

  // State
  const state = {
      currentUser: null,
      appointments: [],
      prescriptions: [],
      messages: [],
      patients: [],
      currentPatient: null
  };

  // DOM Elements
  const DOM = {
      // Navigation
      sidebar: document.querySelector('.sidebar'),
      mainContent: document.querySelector('.main-content'),
      
      // Sections
      dashboardContent: document.getElementById('dashboard-content'),
      appointmentsContent: document.getElementById('appointments-content'),
      messagesContent: document.getElementById('messages-content'),
      prescriptionsContent: document.getElementById('prescriptions-content'),
      profileContent: document.getElementById('profile-content'),
      
      // Elements
      appointmentList: document.querySelector('.appointment-list'),
      prescriptionList: document.querySelector('.prescription-history-list'),
      messageList: document.getElementById('chat-messages'),
      messageInput: document.getElementById('message-text'),
      patientList: document.querySelector('.patients-list')
  };

  // *******************************************
  // Fonctions d'initialisation
  // *******************************************

  async function initializeApp() {
      await loadCurrentUser();
      await loadAllData();
      setupEventListeners();
      setupUI();
  }

  // *******************************************
  // Fonctions de chargement des données
  // *******************************************

  async function loadCurrentUser() {
      try {
          const response = await fetch(`${API_BASE_URL}/profil/`, {
              headers: getAuthHeaders()
          });
          state.currentUser = await response.json();
      } catch (error) {
          showError('Erreur de chargement du profil');
      }
  }

  async function loadAllData() {
      try {
          await Promise.all([
              loadAppointments(),
              loadPrescriptions(),
              loadMessages(),
              loadPatients()
          ]);
      } catch (error) {
          showError('Erreur de chargement des données');
      }
  }

  async function loadAppointments() {
      const [today, upcoming] = await Promise.all([
          fetchData('/rdv-aujourdhui/'),
          fetchData('/rdv-prochains/')
      ]);
      
      state.appointments = {
          today: processAppointments(today.results),
          upcoming: processAppointments(upcoming.results)
      };
      renderAppointments();
  }

  async function loadPrescriptions() {
      const data = await fetchData('/historique-prescriptions/');
      state.prescriptions = data.results.map(p => ({
          id: p.id,
          patient: p.date.patient,
          date: p.date.date,
          diagnostic: p.diagnostique,
          traitement: p.traitment
      }));
      renderPrescriptions();
  }

  async function loadMessages() {
      const data = await fetchData('/boite-reception/');
      state.messages = data.results.map(m => ({
          id: m.id,
          content: m.contenu,
          sender: m.envoyeur,
          date: m.date_message,
          read: m.lu
      }));
      renderMessages();
  }

  async function loadPatients() {
      const data = await fetchData('/patients/');
      state.patients = data.results;
      renderPatients();
  }

  // *******************************************
  // Fonctions de rendu
  // *******************************************

  function renderAppointments() {
      // Rendez-vous du jour
      DOM.appointmentList.innerHTML = state.appointments.today
          .map(appointment => `
              <div class="appointment-item">
                  <div class="appointment-info">
                      <h4>${appointment.patientName}</h4>
                      <p class="appointment-meta">
                          <span><i class="fas fa-calendar-day"></i> ${appointment.date}</span>
                          <span><i class="fas fa-clock"></i> ${appointment.time}</span>
                      </p>
                      <p class="appointment-reason">${appointment.reason}</p>
                  </div>
                  <div class="appointment-actions">
                      <button class="btn-view" data-id="${appointment.id}">
                          <i class="fas fa-eye"></i> Détails
                      </button>
                      <button class="btn-cancel" data-id="${appointment.id}">
                          <i class="fas fa-times"></i> Annuler
                      </button>
                  </div>
              </div>
          `).join('');

      // Rendez-vous à venir
      // ... code similaire ...
  }

  function renderPrescriptions() {
      DOM.prescriptionList.innerHTML = state.prescriptions
          .map(prescription => `
              <div class="prescription-item">
                  <div class="prescription-header">
                      <h4>${prescription.patient.user.last_name} ${prescription.patient.user.first_name}</h4>
                      <span class="prescription-date">${formatDate(prescription.date)}</span>
                  </div>
                  <div class="prescription-body">
                      <p><strong>Diagnostic:</strong> ${prescription.diagnostic}</p>
                      <p><strong>Traitement:</strong> ${prescription.traitement}</p>
                  </div>
              </div>
          `).join('');
  }

  function renderMessages() {
      DOM.messageList.innerHTML = state.messages
          .map(message => `
              <div class="${message.sender === state.currentUser.id ? 'message doctor' : 'message patient'}">
                  <div class="message-content">
                      <p>${message.content}</p>
                      <span class="message-time">${formatDateTime(message.date)}</span>
                  </div>
              </div>
          `).join('');
  }

  function renderPatients() {
      DOM.patientList.innerHTML = state.patients
          .map(patient => `
              <div class="patient-card" data-id="${patient.id}">
                  <h4>${patient.user.last_name} ${patient.user.first_name}</h4>
                  <p>CIN: ${patient.cin}</p>
              </div>
          `).join('');
  }

  // *******************************************
  // Gestion des interactions
  // *******************************************

  async function handleAppointmentCancel(appointmentId) {
      try {
          await fetch(`${API_BASE_URL}/annuler-rdv/${appointmentId}/`, {
              method: 'POST',
              headers: getAuthHeaders()
          });
          await loadAppointments();
          showSuccess('Rendez-vous annulé avec succès');
      } catch (error) {
          showError('Échec de l\'annulation');
      }
  }

  async function handleMessageSend() {
      const content = DOM.messageInput.value.trim();
      if (!content) return;

      try {
          await fetch(`${API_BASE_URL}/envoyer-message/`, {
              method: 'POST',
              headers: getAuthHeaders('json'),
              body: JSON.stringify({
                  receiver_email: state.currentPatient?.user?.email,
                  message_content: content,
                  objet: "Nouveau message"
              })
          });
          
          DOM.messageInput.value = '';
          await loadMessages();
      } catch (error) {
          showError('Échec de l\'envoi du message');
      }
  }

  // *******************************************
  // Utilitaires
  // *******************************************

  function getAuthHeaders(contentType = null) {
      const headers = {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      if (contentType === 'json') {
          headers['Content-Type'] = 'application/json';
      }
      return headers;
  }

  function formatDateTime(isoString) {
      const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      };
      return new Date(isoString).toLocaleDateString('fr-FR', options);
  }

  function showSuccess(message) {
      showNotification(message, 'success');
  }

  function showError(message) {
      showNotification(message, 'error');
  }

  function showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.innerHTML = `
          <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
          ${message}
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
  }

  // *******************************************
  // Initialisation
  // *******************************************

  function setupEventListeners() {
      // Navigation
      document.querySelectorAll('.sidebar nav ul li').forEach(tab => {
          tab.addEventListener('click', () => {
              const tabName = tab.dataset.tab;
              switchTab(tabName);
          });
      });

      // Messages
      document.getElementById('btn-send-message').addEventListener('click', handleMessageSend);
      DOM.messageInput.addEventListener('keypress', e => {
          if (e.key === 'Enter') handleMessageSend();
      });

      // Patients
      document.querySelectorAll('.patient-card').forEach(card => {
          card.addEventListener('click', () => {
              const patientId = card.dataset.id;
              state.currentPatient = state.patients.find(p => p.id === patientId);
              loadMessages();
          });
      });
  }

  function switchTab(tabName) {
      // Logique de changement d'onglet
      document.querySelectorAll('.content').forEach(content => {
          content.classList.toggle('active', content.id === `${tabName}-content`);
      });
  }

  function setupUI() {
      switchTab('dashboard');
      renderProfile();
  }

  function renderProfile() {
      document.querySelector('.profile-details').innerHTML = `
          <div class="profile-section">
              <h3><i class="fas fa-user-md"></i> Informations</h3>
              <p><strong>Nom:</strong> ${state.currentUser.user.last_name} ${state.currentUser.user.first_name}</p>
              <p><strong>Spécialité:</strong> ${state.currentUser.specialite}</p>
              <p><strong>Email:</strong> ${state.currentUser.user.email}</p>
          </div>
      `;
  }

  // Démarrage de l'application
  initializeApp();
});