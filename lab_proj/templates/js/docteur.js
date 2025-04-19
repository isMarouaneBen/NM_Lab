document.addEventListener('DOMContentLoaded', function() {
  const logoutbutton = document.querySelector(".btn-logout");
  if (!logoutbutton) {
    console.error("Logout button not found in the DOM");
    return;
  }
  
  console.log("Logout button found:", logoutbutton);
  
  // Add the event listener with debug logging
  logoutbutton.addEventListener('click', function() {
    console.log("Logout button clicked");
    
    // Check if token exists
    const token = localStorage.getItem('token');
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
  // Global state for the doctor dashboard
  const state = {
    // Today's appointments for the doctor
    todaysAppointments: [
      {
        id: 1,
        patientName: 'Imane Bouzid',
        specialty: 'Cardiology',
        date: '2023-06-15',
        time: '09:30',
        reason: 'Routine check-up'
      },
      {
        id: 2,
        patientName: 'Leila Bensalem',
        specialty: 'Cardiology',
        date: '2023-06-15',
        time: '10:15',
        reason: 'Follow-up consultation'
      }
    ],
    prescriptions: [
      {
        patientName: 'Jane Doe',
        medication: 'Atorvastatin',
        dosage: '20mg',
        instructions: 'Take one tablet daily after dinner',
        date: '2023-06-10'
      }
    ],
    messages: [],
    profile: {
      name: 'Dr. Nassima Maarouf',
      specialty: 'Cardiology',
      email: 'dr.NassimaMaa@gmail.com',
      phone: '0687654321',
      office: 'Room 101, NMLab'
    }
  };

  // DOM Elements
  const DOM = {
    tabs: document.querySelectorAll('.sidebar nav ul li'),
    contents: document.querySelectorAll('.content'),
    pageTitle: document.getElementById('page-title'),
    // Dashboard
    todayAppointmentsContainer: document.querySelector('.today-appointments'),
    // Appointments
    appointmentListContainer: document.querySelector('.appointment-list'),
    // Messaging
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-text'),
    // Prescription form
    btnSubmitPrescription: document.getElementById('btn-submit-prescription'),
    // Prescription History
    prescriptionHistoryList: document.querySelector('.prescription-history-list'),
    // Profile details
    profileDetails: document.querySelector('.profile-details'),
    // Modal
    appointmentModal: document.getElementById('appointment-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    closeModalBtns: document.querySelectorAll('.close-modal, .btn-close-modal')
  };

  // Initialization
  initEventListeners();
  renderAll();

  function initEventListeners() {
    // Tab switching
    DOM.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Delegate appointment action buttons (View/Cancel)
    document.addEventListener('click', function(e) {
      if (e.target.closest('.btn-delete')) {
        const id = parseInt(e.target.closest('.btn-delete').dataset.id);
        if (confirm("Are you sure you want to cancel this appointment? The patient will be notified.")) {
          cancelAppointment(id);
          alert("The patient has been notified about the cancellation.");
        }
      }
      if (e.target.closest('.btn-view')) {
        const id = parseInt(e.target.closest('.btn-view').dataset.id);
        viewAppointment(id);
      }
    });

    // Modal close buttons
    DOM.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => DOM.appointmentModal.classList.remove('active'));
    });

    // Modal cancel appointment button
    if (DOM.modalCancelBtn) {
      DOM.modalCancelBtn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        cancelAppointment(id);
        DOM.appointmentModal.classList.remove('active');
        alert("The patient has been notified about the cancellation.");
      });
    }

    // Messaging: send message (simulate response)
    document.addEventListener('click', function(e) {
      if (e.target.closest('#btn-send-message')) {
        sendMessage();
      }
    });
    
    // Prescription form submission
    if (DOM.btnSubmitPrescription) {
      DOM.btnSubmitPrescription.addEventListener('click', function() {
        addPrescription();
      });
    }
  }

  // Tab switching
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
    if (tabName === 'prescription-history') {
      renderPrescriptionHistory();
    }
    if (tabName === 'profile') {
      renderProfile();
    }
  }

  // Render all sections
  function renderAll() {
    renderDashboard();
    renderAppointments();
    renderMessages();
    renderPrescriptionHistory();
    renderProfile();
  }

  // Render Dashboard (today's appointments summary)
  function renderDashboard() {
    if (DOM.todayAppointmentsContainer) {
      if (state.todaysAppointments.length > 0) {
        DOM.todayAppointmentsContainer.innerHTML = state.todaysAppointments.map(app => `
          <p><strong>${app.patientName}</strong> - ${app.specialty}</p>
          <p><i class="far fa-calendar-alt"></i> ${formatDate(app.date)} at ${app.time}</p>
          <button class="btn-delete" data-id="${app.id}">Cancel</button>
        `).join('');
      } else {
        DOM.todayAppointmentsContainer.innerHTML = `<p>No appointments for today.</p>`;
      }
    }
  }

  // Render Appointments List
  function renderAppointments() {
    if (DOM.appointmentListContainer) {
      if (state.todaysAppointments.length > 0) {
        DOM.appointmentListContainer.innerHTML = state.todaysAppointments.map(app => `
          <div class="appointment-item">
            <div class="appointment-info">
              <h4>${app.patientName} - ${app.specialty}</h4>
              <p><i class="far fa-calendar-alt"></i> ${formatDate(app.date)} at ${app.time}</p>
              <p><i class="far fa-comment"></i> ${app.reason}</p>
            </div>
            <div class="appointment-actions">
              <button class="btn-view" data-id="${app.id}">View</button>
              <button class="btn-delete" data-id="${app.id}">Cancel</button>
            </div>
          </div>
        `).join('');
      } else {
        DOM.appointmentListContainer.innerHTML = `<p>No appointments scheduled for today.</p>`;
      }
    }
  }

  // Render Messages (simple simulation)
  function renderMessages() {
    if (DOM.chatMessages) {
      DOM.chatMessages.innerHTML = state.messages.map(msg => `
        <div class="message ${msg.from === 'doctor' ? 'doctor' : 'patient'}">
          <p>${msg.text}</p>
          <span>${msg.time}</span>
        </div>
      `).join('');
      DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
    }
  }

  // Send a message (simulate response)
  function sendMessage() {
    const text = DOM.messageInput.value.trim();
    if (!text) {
      alert("Please type a message.");
      return;
    }
    const message = {
      text: text.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      from: 'doctor',
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
    state.messages.push(message);
    DOM.messageInput.value = '';
    renderMessages();
    // Simulate a patient reply after 1.5 seconds
    setTimeout(() => {
      state.messages.push({
        text: 'Patient: Thank you, doctor!',
        from: 'patient',
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      });
      renderMessages();
    }, 1500);
  }

  // Render Prescription History
  function renderPrescriptionHistory() {
    if (DOM.prescriptionHistoryList) {
      if (state.prescriptions.length > 0) {
        DOM.prescriptionHistoryList.innerHTML = state.prescriptions.map(pres => `
          <div class="prescription-item">
            <h4>${pres.patientName} - ${pres.medication} (${pres.dosage})</h4>
            <p>${pres.instructions}</p>
            <p><small>${formatDate(pres.date)}</small></p>
          </div>
        `).join('');
      } else {
        DOM.prescriptionHistoryList.innerHTML = `<p>No prescriptions have been issued yet.</p>`;
      }
    }
  }

  // Render Profile
  function renderProfile() {
    if (DOM.profileDetails) {
      const prof = state.profile;
      DOM.profileDetails.innerHTML = `
        <p><strong>Name:</strong> ${prof.name}</p>
        <p><strong>Specialty:</strong> ${prof.specialty}</p>
        <p><strong>Email:</strong> ${prof.email}</p>
        <p><strong>Phone:</strong> ${prof.phone}</p>
        <p><strong>Office:</strong> ${prof.office}</p>
      `;
    }
  }

  // Appointment Modal - for viewing details
  function viewAppointment(id) {
    const app = state.todaysAppointments.find(a => a.id === id);
    if (app) {
      DOM.modalTitle.textContent = "Appointment Details";
      DOM.modalBody.innerHTML = `
        <p><strong>Patient:</strong> ${app.patientName}</p>
        <p><strong>Specialty:</strong> ${app.specialty}</p>
        <p><strong>Date:</strong> ${formatDate(app.date)}</p>
        <p><strong>Time:</strong> ${app.time}</p>
        <p><strong>Reason:</strong> ${app.reason}</p>
      `;
      // Optionally, attach the appointment id for cancellation
      DOM.modalCancelBtn.dataset.id = app.id;
      DOM.appointmentModal.classList.add('active');
    } else {
      alert("Appointment not found.");
    }
  }

  // Cancel an appointment
  function cancelAppointment(id) {
    state.todaysAppointments = state.todaysAppointments.filter(a => a.id !== id);
    renderDashboard();
    renderAppointments();
  }

  // Add a Prescription
  function addPrescription() {
    const patientName = document.getElementById('patient-name').value.trim();
    const medication = document.getElementById('medication').value.trim();
    const dosage = document.getElementById('dosage').value.trim();
    const instructions = document.getElementById('instructions').value.trim();
    if (!patientName || !medication || !dosage || !instructions) {
      alert("Please fill in all the fields.");
      return;
    }
    const newPrescription = {
      patientName,
      medication,
      dosage,
      instructions,
      date: new Date().toISOString()
    };
    state.prescriptions.push(newPrescription);
    alert("Prescription submitted successfully.");
    // Clear the form fields
    document.getElementById('patient-name').value = "";
    document.getElementById('medication').value = "";
    document.getElementById('dosage').value = "";
    document.getElementById('instructions').value = "";
    renderPrescriptionHistory();
  }

  // Helper: format date string
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  }
});
