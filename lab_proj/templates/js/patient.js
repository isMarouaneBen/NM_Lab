document.addEventListener('DOMContentLoaded', function() {
  const logoutbutton = document.querySelector(".btn-logout")
  
  // Add the event listener with debug logging
  logoutbutton.addEventListener('click', function() {
    console.log("Logout button clicked");
    
    // Check if token exists
    const data = localStorage.getItem('data');
    console.log("Token found:", data.token);
    
    async function logouthandling() {
      try {
        const response = await fetch("http://127.0.0.1:8000/users/logout/", {
          method: 'POST',
          headers: {
            'Authorization': `Token ${data.token}`,
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
    if (DOM.specialtySelect) {
      DOM.specialtySelect.addEventListener('change', updateDoctors);
    }
    if (DOM.dateInput) {
      DOM.dateInput.addEventListener('change', updateTimes);
    }
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
      if (e.target.closest('.btn-delete')) {
        const id = e.target.closest('.btn-delete').dataset.id;
        if (confirm("Are you sure you want to delete this appointment?")) {
          cancelAppointment(parseInt(id));
        }
      }
      // Écouteur pour le bouton "View" dans les rendez-vous
      if (e.target.closest('.btn-view')) {
        const id = e.target.closest('.btn-view').dataset.id;
        viewAppointment(parseInt(id));
      }
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
    if (tabName === 'history') {
      renderHistory();
    }
    if (tabName === 'profile') {
      renderProfile();
    }
  }

  // Rendu global
  function renderAll() {
    renderDashboard();
    renderAppointments();
    renderMessages();
    renderPrescriptions();
    renderHistory();
    renderProfile();
  }

  // Dashboard
  function renderDashboard() {
    const container = document.querySelector('.next-appointment');
    const nextAppointment = state.upcomingAppointments[0];
    container.innerHTML = nextAppointment ? `
      <p><strong>${nextAppointment.doctor}</strong> - ${nextAppointment.specialty}</p>
      <p><i class="far fa-calendar-alt"></i> ${formatDate(nextAppointment.date)} at ${nextAppointment.time}</p>
      <button class="btn-cancel" id="cancel-main-appointment">Cancel</button>
    ` : '<p>No upcoming appointment</p>';
  }

  // Appointments
  function renderAppointments() {
    const container = document.querySelector('.upcoming-appointments');
    container.innerHTML = state.upcomingAppointments.map(appointment => `
      <div class="appointment-item">
        <div class="appointment-info">
          <h4>${appointment.doctor} - ${appointment.specialty}</h4>
          <p><i class="far fa-calendar-alt"></i> ${formatDate(appointment.date)} at ${appointment.time}</p>
          <p><i class="far fa-comment"></i> ${appointment.reason}</p>
        </div>
        <div class="appointment-actions">
          <button class="btn-view" data-id="${appointment.id}">View</button>
          <button class="btn-delete" data-id="${appointment.id}">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // Messages
  function renderMessages() {
    if (DOM.chatMessages) {
      DOM.chatMessages.innerHTML = state.messages.map(msg => `
        <div class="message ${msg.isPatient ? 'patient' : 'doctor'}">
          <p>${msg.text}</p>
          <span>${msg.time}</span>
        </div>
      `).join('');
      DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
    }
  }

  // Prescriptions
  function renderPrescriptions() {
    const container = document.querySelector('.prescription-list');
    if (container) {
      container.innerHTML = state.prescriptions.length ? state.prescriptions.map(prescription => `
        <div class="prescription-item">
          <div class="prescription-info">
            <h4>${prescription.medication} - ${prescription.dosage}</h4>
            <p>${prescription.instructions}</p>
            <p>Prescribed by ${prescription.doctor}</p>
          </div>
        </div>
      `).join('') : '<p>No prescriptions recorded.</p>';
    }
  }

  // Historique
  function renderHistory() {
    const container = document.querySelector('.history-list');
    if (container) {
      container.innerHTML = state.pastAppointments.length ? state.pastAppointments.map(appointment => `
        <div class="appointment-item">
          <div class="appointment-info">
            <h4>${appointment.doctor} - ${appointment.specialty}</h4>
            <p><i class="far fa-calendar-alt"></i> ${formatDate(appointment.date)} at ${appointment.time}</p>
            <p><i class="far fa-comment"></i> ${appointment.reason}</p>
          </div>
        </div>
      `).join('') : '<p>No past appointments available.</p>';
    }
  }

  // Profil
  function renderProfile() {
    const container = document.querySelector('.profile-details');
    if (container) {
      const p = state.profile;
      container.innerHTML = `
        <p><strong>Name:</strong> ${p.name}</p>
        <p><strong>Age:</strong> ${p.age}</p>
        <p><strong>Email:</strong> ${p.email}</p>
        <p><strong>Phone:</strong> ${p.phone}</p>
        <p><strong>Address:</strong> ${p.address}</p>
      `;
    }
  }

  // Envoi de message
  function sendMessage() {
    const text = DOM.messageInput.value.trim();
    if (!text) {
      alert("Please enter a message.");
      return;
    }
    const escapedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    state.messages.push({
      text: escapedText,
      isPatient: true,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    });
    DOM.messageInput.value = '';
    renderMessages();
    setTimeout(() => {
      state.messages.push({
        text: 'Thank you for your message. We will respond shortly.',
        isPatient: false,
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      });
      renderMessages();
    }, 1500);
  }

  // Suppression d'un rendez-vous
  function cancelAppointment(id) {
    state.upcomingAppointments = state.upcomingAppointments.filter(a => a.id !== id);
    renderAppointments();
    renderDashboard();
    renderHistory();
  }

  // Affichage des détails d'un rendez-vous
  function viewAppointment(id) {
    const appointment = state.upcomingAppointments.find(a => a.id === id);
    if (appointment) {
      alert(`Appointment Details:\nDoctor: ${appointment.doctor}\nSpecialty: ${appointment.specialty}\nDate: ${formatDate(appointment.date)} at ${appointment.time}\nReason: ${appointment.reason}`);
    } else {
      alert("Appointment not found.");
    }
  }

  // Mise à jour des médecins selon la spécialité
  function updateDoctors() {
    const specialty = DOM.specialtySelect.value;
    DOM.doctorSelect.innerHTML = '<option value="">Select a doctor</option>';
    if (specialty && state.doctorsBySpecialty[specialty]) {
      state.doctorsBySpecialty[specialty].forEach(doctor => {
        DOM.doctorSelect.innerHTML += `<option value="${doctor}">${doctor}</option>`;
      });
    }
  }

  // Mise à jour des horaires disponibles
  function updateTimes() {
    DOM.timeSelect.innerHTML = '<option value="">Select a time</option>';
    state.availableTimes.forEach(time => {
      DOM.timeSelect.innerHTML += `<option value="${time}">${time}</option>`;
    });
  }

  // Format de date
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  }

  // Ajout d'un nouveau rendez-vous
  function addAppointment() {
    const specialtyVal = DOM.specialtySelect.value;
    const doctorVal = DOM.doctorSelect.value;
    const dateVal = DOM.dateInput.value;
    const timeVal = DOM.timeSelect.value;
    const reasonVal = DOM.reasonTextarea.value.trim();
    if (!specialtyVal || !doctorVal || !dateVal || !timeVal || !reasonVal) {
      alert("Please fill in all fields.");
      return;
    }
    const newAppointment = {
      id: Date.now(),
      doctor: doctorVal,
      specialty: specialtyVal === 'cardiology' ? 'Cardiologist' : specialtyVal === 'dermatology' ? 'Dermatologist' : 'General',
      date: dateVal,
      time: timeVal,
      reason: reasonVal
    };
    state.upcomingAppointments.push(newAppointment);
    // Simuler l'ajout dans l'historique en copiant le rendez-vous
    state.pastAppointments.push({ ...newAppointment });
    renderAppointments();
    renderDashboard();
    renderHistory();
    DOM.appointmentForm.reset();
    alert("Your appointment has been successfully scheduled.");
  }
});
