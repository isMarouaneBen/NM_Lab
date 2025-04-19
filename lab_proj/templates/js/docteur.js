const API_BASE_URL = '/api/doctor/';
const CSRF_TOKEN = document.querySelector('[name=csrfmiddlewaretoken]')?.value || "{{ csrf_token }}";
let currentDoctorId = null;

document.addEventListener('DOMContentLoaded', async function() {
  // Global state
  const state = {
    todaysAppointments: [],
    prescriptions: [],
    messages: [],
    profile: null
  };

  // DOM Elements
  const DOM = {
    tabs: document.querySelectorAll('.sidebar nav ul li'),
    contents: document.querySelectorAll('.content'),
    pageTitle: document.getElementById('page-title'),
    todayAppointmentsContainer: document.querySelector('.today-appointments'),
    appointmentListContainer: document.querySelector('.appointment-list'),
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-text'),
    btnSubmitPrescription: document.getElementById('btn-submit-prescription'),
    prescriptionHistoryList: document.querySelector('.prescription-history-list'),
    profileDetails: document.querySelector('.profile-details'),
    appointmentModal: document.getElementById('appointment-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    closeModalBtns: document.querySelectorAll('.close-modal, .btn-close-modal'),
    patientNameInput: document.getElementById('patient-name'),
    medicationInput: document.getElementById('medication'),
    dosageInput: document.getElementById('dosage'),
    instructionsInput: document.getElementById('instructions'),
    receiverEmailInput: document.getElementById('receiver-email'),
    messageSubjectInput: document.getElementById('message-subject')
  };

  // Initialize dashboard
  try {
    await loadDoctorProfile();
    await Promise.all([
      loadTodaysAppointments(),
      loadPrescriptionHistory(),
      loadMessages()
    ]);
    initEventListeners();
    renderAll();
  } catch (error) {
    console.error("Initialization error:", error);
    showAlert("Failed to initialize dashboard", "error");
  }

  // API Functions
  async function loadDoctorProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}profile/`, {
        headers: { 'X-CSRFToken': CSRF_TOKEN }
      });
      
      if (!response.ok) throw new Error(await response.text());
      
      state.profile = await response.json();
      currentDoctorId = state.profile.id;
    } catch (error) {
      console.error("Error loading profile:", error);
      throw error;
    }
  }

  async function loadTodaysAppointments() {
    try {
      const response = await fetch(`${API_BASE_URL}today-rendezvous/`, {
        headers: { 'X-CSRFToken': CSRF_TOKEN }
      });
      
      if (!response.ok) throw new Error(await response.text());
      
      state.todaysAppointments = (await response.json()).map(rdv => ({
        id: rdv.id,
        patientName: rdv.patient_name,
        specialty: rdv.specialty,
        date: rdv.date,
        time: rdv.time,
        reason: rdv.reason || "Consultation"
      }));
    } catch (error) {
      console.error("Error loading appointments:", error);
      throw error;
    }
  }

  async function cancelAppointment(id) {
    try {
      if (!confirm("Are you sure you want to cancel this appointment?")) return;
      
      const response = await fetch(`${API_BASE_URL}cancel-rendezvous/${id}/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': CSRF_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(await response.text());
      
      state.todaysAppointments = state.todaysAppointments.filter(a => a.id !== id);
      showAlert("Appointment cancelled successfully", "success");
      renderDashboard();
      renderAppointments();
    } catch (error) {
      console.error("Cancellation error:", error);
      showAlert(error.message, "error");
    }
  }

  async function addPrescription() {
    const formData = {
      patient_name: DOM.patientNameInput.value.trim(),
      medication: DOM.medicationInput.value.trim(),
      dosage: DOM.dosageInput.value.trim(),
      instructions: DOM.instructionsInput.value.trim()
    };

    try {
      const response = await fetch(`${API_BASE_URL}write-prescription/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': CSRF_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(await response.text());
      
      showAlert("Prescription saved successfully", "success");
      await loadPrescriptionHistory();
      resetForm('prescription-form');
    } catch (error) {
      console.error("Prescription error:", error);
      showAlert(error.message, "error");
    }
  }

  async function loadPrescriptionHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}historic-prescriptions/`, {
        headers: { 'X-CSRFToken': CSRF_TOKEN }
      });
      
      if (!response.ok) throw new Error(await response.text());
      
      state.prescriptions = await response.json();
    } catch (error) {
      console.error("Error loading prescriptions:", error);
      throw error;
    }
  }

  async function sendMessage() {
    const messageData = {
      receiver_email: DOM.receiverEmailInput.value.trim(),
      message_content: DOM.messageInput.value.trim(),
      objet: DOM.messageSubjectInput.value.trim()
    };

    try {
      const response = await fetch(`${API_BASE_URL}write-message/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': CSRF_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) throw new Error(await response.text());
      
      showAlert("Message sent successfully", "success");
      DOM.messageInput.value = '';
      await loadMessages();
    } catch (error) {
      console.error("Message error:", error);
      showAlert(error.message, "error");
    }
  }

  async function loadMessages() {
    try {
      const response = await fetch(`${API_BASE_URL}see-messages/`, {
        headers: { 'X-CSRFToken': CSRF_TOKEN }
      });
      
      if (!response.ok) throw new Error(await response.text());
      
      state.messages = await response.json();
    } catch (error) {
      console.error("Error loading messages:", error);
      throw error;
    }
  }

  // Render Functions
  function renderAll() {
    renderDashboard();
    renderAppointments();
    renderMessages();
    renderPrescriptionHistory();
    renderProfile();
  }

  function renderDashboard() {
    if (!DOM.todayAppointmentsContainer) return;
    
    DOM.todayAppointmentsContainer.innerHTML = state.todaysAppointments.length > 0
      ? state.todaysAppointments.map(app => `
          <div class="appointment-card">
            <h4>${app.patientName}</h4>
            <p>${app.specialty}</p>
            <time>${formatDate(app.date)} ${app.time}</time>
            <div class="actions">
              <button class="btn-view" data-id="${app.id}">View</button>
              <button class="btn-delete" data-id="${app.id}">Cancel</button>
            </div>
          </div>
        `).join('')
      : `<p class="no-appointments">No appointments today</p>`;
  }

  function renderAppointments() {
    if (!DOM.appointmentListContainer) return;
    
    DOM.appointmentListContainer.innerHTML = state.todaysAppointments.length > 0
      ? state.todaysAppointments.map(app => `
          <div class="appointment-item">
            <div class="info">
              <h4>${app.patientName}</h4>
              <p class="specialty">${app.specialty}</p>
              <p class="time">${formatDate(app.date)} at ${app.time}</p>
              <p class="reason">${app.reason}</p>
            </div>
            <div class="actions">
              <button class="btn-view" data-id="${app.id}">Details</button>
              <button class="btn-delete" data-id="${app.id}">Cancel</button>
            </div>
          </div>
        `).join('')
      : `<p class="no-data">No appointments found</p>`;
  }

  function renderMessages() {
    if (!DOM.chatMessages) return;
    
    DOM.chatMessages.innerHTML = state.messages.length > 0
      ? state.messages.map(msg => `
          <div class="message ${msg.sender === currentDoctorId ? 'sent' : 'received'}">
            <div class="content">${msg.message_content}</div>
            <div class="meta">
              <time>${formatTime(msg.date_sent)}</time>
              ${msg.sender === currentDoctorId ? '' : `<span class="sender">${msg.sender_name}</span>`}
            </div>
          </div>
        `).join('')
      : `<p class="no-data">No messages yet</p>`;
    
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
  }

  function renderPrescriptionHistory() {
    if (!DOM.prescriptionHistoryList) return;
    
    DOM.prescriptionHistoryList.innerHTML = state.prescriptions.length > 0
      ? state.prescriptions.map(pres => `
          <div class="prescription-item">
            <h4>${pres.patient_name} - ${pres.medication}</h4>
            <p class="dosage">${pres.dosage}</p>
            <p class="instructions">${pres.instructions}</p>
            <time>${formatDate(pres.date_created)}</time>
          </div>
        `).join('')
      : `<p class="no-data">No prescriptions found</p>`;
  }

  function renderProfile() {
    if (!DOM.profileDetails || !state.profile) return;
    
    DOM.profileDetails.innerHTML = `
      <div class="profile-header">
        <h3>${state.profile.name}</h3>
        <p class="specialty">${state.profile.specialty}</p>
      </div>
      <div class="profile-details">
        <p><span class="label">Email:</span> ${state.profile.email}</p>
        <p><span class="label">Phone:</span> ${state.profile.phone}</p>
        <p><span class="label">Office:</span> ${state.profile.office}</p>
      </div>
    `;
  }

  function viewAppointment(id) {
    const appointment = state.todaysAppointments.find(a => a.id === id);
    if (!appointment || !DOM.appointmentModal) return;
    
    DOM.modalTitle.textContent = "Appointment Details";
    DOM.modalBody.innerHTML = `
      <div class="appointment-details">
        <p><span class="label">Patient:</span> ${appointment.patientName}</p>
        <p><span class="label">Date:</span> ${formatDate(appointment.date)}</p>
        <p><span class="label">Time:</span> ${appointment.time}</p>
        <p><span class="label">Reason:</span> ${appointment.reason}</p>
      </div>
    `;
    
    DOM.modalCancelBtn.dataset.id = appointment.id;
    DOM.appointmentModal.classList.add('active');
  }

  // Helper Functions
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
  }

  function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
  }

  function switchTab(tabName) {
    // Update active tab
    DOM.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update active content
    DOM.contents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-content`);
    });
    
    // Update page title
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab && DOM.pageTitle) {
      DOM.pageTitle.textContent = activeTab.textContent.trim();
    }
  }

  // Event Listeners
  function initEventListeners() {
    // Tab switching
    DOM.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Appointment actions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete')) {
        cancelAppointment(e.target.closest('.btn-delete').dataset.id);
      }
      if (e.target.closest('.btn-view')) {
        viewAppointment(e.target.closest('.btn-view').dataset.id);
      }
    });

    // Modal close
    DOM.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.appointmentModal.classList.remove('active');
      });
    });

    // Form submissions
    DOM.btnSubmitPrescription?.addEventListener('click', (e) => {
      e.preventDefault();
      addPrescription();
    });

    document.getElementById('btn-send-message')?.addEventListener('click', (e) => {
      e.preventDefault();
      sendMessage();
    });
  }
});
