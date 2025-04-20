const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', function() {
  const logoutbutton = document.querySelector(".btn-logout")
  
  // Add the event listener with debug logging
  logoutbutton.addEventListener('click', function() {
    console.log("Logout button clicked");
    
    // Check if token exists
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
  });    const state = {
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
    const drData = JSON.parse(localStorage.getItem('data')); // Convert back from string to object

  
    // Render all sections
    function renderAll() {
      renderDashboard();
      renderAppointments();
      renderMessages();
      renderPrescriptionHistory();
      renderProfile();
      WritePrescription();
    }
    function isoToDateTime(isoString) {
      const date = new Date(isoString);
    
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
    
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
    
      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
async function renderAppointments() {
      
      if (DOM.appointmentListContainer) {
        const url = "http://127.0.0.1:8000/docteur/today-rendezvous/";
        try {
          const response = await fetch(url , {
            method:'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            DOM.appointmentListContainer.innerHTML = data.map(app => `
              <div class="appointment-item">
                <div class="appointment-info">
                  <h4>${app.patient_nom} - ${app.description}</h4>
                  <p><i class="far fa-calendar-alt"></i> ${isoToDateTime(app.date)}</p>
                </div>
              <div class="appointment-actions">
                <button class="btn-delete" data-id="${app.id}">Cancel</button>
              </div>
              </div>
            `).join('');
            const cancelButtons = document.querySelectorAll('.btn-delete');
            cancelButtons.forEach(button => {
              button.addEventListener('click', async () => {
                const appointmentId = button.getAttribute('data-id');
                
                // Create confirmation dialog
                const confirmCancel = confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous?");
                
                if (confirmCancel) {
                  const cancelUrl = `http://127.0.0.1:8000/docteur/cancel-rendezvous/${appointmentId}/`;
                  
                  try {
                    const cancelResponse = await fetch(cancelUrl, {
                      method: 'POST', // Or whichever method your API requires
                      headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    if (cancelResponse.ok) {
                      // Show success message with refresh button
                      const successDiv = document.createElement('div');
                      successDiv.className = 'success-message';
                      successDiv.innerHTML = `
                        <div class="success-popup">
                          <p>Le rendez-vous a été annulé avec succès!</p>
                          <button id="refresh-btn">Rafraîchir</button>
                        </div>
                      `;
                      document.body.appendChild(successDiv);
                      
                      // Add style to make it appear as a modal
                      successDiv.style.position = 'fixed';
                      successDiv.style.top = '0';
                      successDiv.style.left = '0';
                      successDiv.style.width = '100%';
                      successDiv.style.height = '100%';
                      successDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
                      successDiv.style.display = 'flex';
                      successDiv.style.justifyContent = 'center';
                      successDiv.style.alignItems = 'center';
                      
                      const popup = successDiv.querySelector('.success-popup');
                      popup.style.backgroundColor = 'white';
                      popup.style.padding = '20px';
                      popup.style.borderRadius = '5px';
                      popup.style.textAlign = 'center';
                      
                      // Add refresh functionality
                      document.getElementById('refresh-btn').addEventListener('click', () => {
                        location.reload();
                      });
                    } else {
                      alert("Erreur lors de l'annulation du rendez-vous. Veuillez réessayer.");
                    }
                  } catch (error) {
                    console.error("Error cancelling appointment:", error);
                    alert("Une erreur s'est produite. Veuillez réessayer plus tard.");
                  }
                }
              });
            });
          }else {
            DOM.appointmentListContainer.innerHTML = `<p><b> sans rendez vous aujourd'hui !</p>`;
          }

          } catch (error) {
            console.log(error);
          }

      }
    }

    function toIsoFormat(datetimelocal) {
      return datetimelocal+":00Z";
    }
    function clearFields() {
      cin.value = '';
      daterdv.value = '';
      diagnostique.value = '';
      traitment.value = '';
      notes.value = '';
    }

    async function WritePrescription() {
      const url = "http://127.0.0.1:8000/docteur/write-prescription/";
      const submitBtn = document.getElementById("btn-submit-prescription");
      const cin = document.getElementById("cin");
      const daterdv = document.getElementById("daterdv");
      const diagnostique = document.getElementById("diagnostique");
      const traitment = document.getElementById("traitment");
      const notes = document.getElementById("notes");
      submitBtn.addEventListener('click' , async () => {

        try {
            const result = await fetch(url , {
              method:'POST',
              headers: {
                "Authorization":`Token ${token}`,
                "Content-Type":"application/json"
              },
              body:JSON.stringify({
                  'patient_cin': cin.value,
                  'date_rendezvous': toIsoFormat(daterdv.value),
                  'diagnostique': diagnostique.value,
                  'traitment': traitment.value,
                  'notes': notes.value
              })
            });
            if (result.ok) {
              const sucessMessage = document.querySelector(".sucess-message");
              sucessMessage.innerHTML = `<p>La prescription est ajouté avec succes <\p>`;
              clearFields();
            }
            else {
              const errorMessage = document.querySelector(".error-message");
              errorMessage.innerHTML = `<p>Erreur lors de l'ajout de la prescription<\p>`;
              clearFields();
            }
          } catch(error){
            console.error(error);
          }
          });
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
      const researchBtn = document.getElementById('search-history-btn');
      const cinValue = document.getElementById('patient-cin');
      
      researchBtn.addEventListener('click', async () => {
        const urlprescription = `http://127.0.0.1:8000/docteur/historic-prescriptions/${cinValue.value}/`;
        try {
          const response = await fetch(urlprescription, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();

          if (response.ok && data.prescriptions.length > 0) {
            if(data.prescriptions.length() > 0){}
            DOM.prescriptionHistoryList.innerHTML = `
              <div class="prescription-title">
                <h3>Prescriptions pour ${data.nom_patient}</h3>
              </div>
              ${data.prescriptions.map(prescription => `
                <div class="prescription-item">
                  <h4>${prescription.diagnostique} : ${prescription.traitment}</h4>
                  <p>${prescription.notes}</p>
                  <p><small>${isoToDateTime(prescription.date)}</small></p>
                </div>
              `).join('')}
            `;
          } else {
            DOM.prescriptionHistoryList.innerHTML = `<p>Pas de prescriptions au moment pour cet patient ou une erreur dans serveur est survenue</p>`;
          }
        } catch (error) {
          console.log(error);
        }
      });
    }


    // Render Profile
    function renderProfile() {

      if (DOM.profileDetails) {
        console.log(drData); 
        
        DOM.profileDetails.innerHTML = `
          <p><strong>Name:</strong> ${drData.user.first_name} ${drData.user.last_name} </p>
          <p><strong>Specialty:</strong> ${drData.specialite}</p>
          <p><strong>Email:</strong> ${drData.user.email}</p>
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
   async function cancelAppointment(id) {
      state.todaysAppointments = state.todaysAppointments.filter(a => a.id !== id);
      renderDashboard();
      renderAppointments();
    }
  
    
  
    // Helper: format date string
    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-GB', options);
    }
  });
  

  