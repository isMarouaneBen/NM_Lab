try {
  const tokenTest = sessionStorage.getItem('token');

  if (tokenTest === null) {
    throw new Error("Token not found");
  }

} catch (error) {
  console.error("Erreur lors de la récupération du token :", error);
  window.location.href = "login.html";
}

const token = sessionStorage.getItem('token');
let drData = JSON.parse(sessionStorage.getItem('data')); 
let patientID = null;
let currentUserId = null;
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
          }
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
      document.addEventListener('DOMContentLoaded', function() {
      
        // Add this to restore the last active tab
        const lastActiveTab = localStorage.getItem('currentTab');
        if (lastActiveTab) {
          switchTab(lastActiveTab);
        }
      });
      // Tab switching
      DOM.tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
      });
  
      // Delegate appointment action buttons (View/Cancel)
      document.addEventListener('click', function(e) {
        // if (e.target.closest('.btn-delete')) {
        //   const id = parseInt(e.target.closest('.btn-delete').dataset.id);
        //   if (confirm("Are you sure you want to cancel this appointment? The patient will be notified.")) {
        //     cancelAppointment(id);
        //     alert("The patient has been notified about the cancellation.");
        //   }
        // }
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
      // document.addEventListener('click', function(e) {
      //   if (e.target.closest('#btn-send-message')) {
      //     sendMessage();
      //   }
      // });
      
      // Prescription form submission
      if (DOM.btnSubmitPrescription) {
        DOM.btnSubmitPrescription.addEventListener('click', function() {
          WritePrescription();
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
        sessionStorage.setItem('currentTab', tabName);

      }
      if(tabName === 'write-prescription'){
        WritePrescription();
        sessionStorage.setItem('currentTab', tabName);

      }
      if (tabName === 'profile') {
        renderProfile();
        sessionStorage.setItem('currentTab', tabName);
      }
      if(tabName === 'messages') {
        renderPatientList();
        sessionStorage.setItem('currentTab', tabName);

      }
      if(tabName === 'appointments') {
        sessionStorage.setItem('currentTab', tabName);
      }
      if(tabName === 'dashboard' ) {
        sessionStorage.setItem('currentTab', tabName);
      }
      
    }



  
    // Render all sections
    function renderAll() {
      switchTab(sessionStorage.getItem("currentTab"));
      // renderDashboard();
      renderAppointments();
      // renderMessages();
      renderPrescriptionHistory();
      renderProfile();
      renderDocName();
      ageChart();
      bloodFunction();
      rdvProgression();
      renderUpcomingRdv();
      renderAvgAge();
      renderRdvCounts();
      renderMonthlyPatient();
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
    // function renderDashboard() {
    //   if (DOM.todayAppointmentsContainer) {
    //     if (state.todaysAppointments.length > 0) {
    //       DOM.todayAppointmentsContainer.innerHTML = state.todaysAppointments.map(app => `
    //         <p><strong>${app.patientName}</strong> - ${app.specialty}</p>
    //         <p><i class="far fa-calendar-alt"></i> ${formatDate(app.date)} at ${app.time}</p>
    //         <button class="btn-delete" data-id="${app.id}">Cancel</button>
    //       `).join('');
    //     } else {
    //       DOM.todayAppointmentsContainer.innerHTML = `<p>No appointments for today.</p>`;
    //     }
    //   }
    // }
  

  
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
    // function renderMessages() {
    //   if (DOM.chatMessages) {
    //     DOM.chatMessages.innerHTML = state.messages.map(msg => `
    //       <div class="message ${msg.from === 'doctor' ? 'doctor' : 'patient'}">
    //         <p>${msg.text}</p>
    //         <span>${msg.time}</span>
    //       </div>
    //     `).join('');
    //     DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
    //   }
    // }
  

  
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


    function renderProfile() {
      if (DOM.profileDetails) {
        if (drData && drData.user) {
          console.log(drData);
          
          DOM.profileDetails.innerHTML = `
            <p><strong>Nom Complet : DR.</strong> ${drData.user.first_name} ${drData.user.last_name}</p>
            <p><strong>Spécialité : </strong> ${drData.specialite || 'Not specified'}</p>
            <p><strong>Email :</strong> ${drData.user.email}</p>
          `;
        } else {
          DOM.profileDetails.innerHTML = `
            <p>Profile non trouvable , essayer de vous reconnecter de nouveau.</p>
          `;
        }
      }
    }
    // // Appointment Modal - for viewing details
    // function viewAppointment(id) {
    //   const app = state.todaysAppointments.find(a => a.id === id);
    //   if (app) {
    //     DOM.modalTitle.textContent = "Appointment Details";
    //     DOM.modalBody.innerHTML = `
    //       <p><strong>Patient:</strong> ${app.patientName}</p>
    //       <p><strong>Specialty:</strong> ${app.specialty}</p>
    //       <p><strong>Date:</strong> ${formatDate(app.date)}</p>
    //       <p><strong>Time:</strong> ${app.time}</p>
    //       <p><strong>Reason:</strong> ${app.reason}</p>
    //     `;
    //     // Optionally, attach the appointment id for cancellation
    //     DOM.modalCancelBtn.dataset.id = app.id;
    //     DOM.appointmentModal.classList.add('active');
    //   } else {
    //     alert("Appointment not found.");
    //   }
    // }
  
    // Cancel an appointment
   async function cancelAppointment(id) {
      state.todaysAppointments = state.todaysAppointments.filter(a => a.id !== id);
      renderDashboard();
      renderAppointments();
    }
  
    function renderDocName() {
      const docSection = document.getElementById("nom-doc");
      docSection.innerHTML = `Dr. ${drData.user.first_name.toUpperCase()} ${drData.user.last_name.toUpperCase()}`;
    }

    async function ageChart() {
      const ageChart = document.getElementById("ageBarChart");
      const url = "http://127.0.0.1:8000/statistics/chart/age-partition/";
      const result = await fetch(url , {
        method: 'GET',
        headers: {
          'Authorization':`Token ${token}`,
          'Content-Type':'application/json'
        }
      })
      if(result.ok) {
        try{
        const data = await result.json();
        const counts = {
          '0-18 ans': 0,
          '18-25 ans': 0,
          '25-40 ans': 0,
          '+40 ans': 0
        };
        data.forEach(patient => {
          if (counts[patient.category_age] !== undefined) {
            counts[patient.category_age]++;
          }
        });
        const labels = Object.keys(counts);
        const values = Object.values(counts);
        const ctx = ageChart.getContext('2d');
        const ageBarChart = new Chart(ctx , {
          type : 'bar',
          data :{
            labels : labels,
            datasets: [{
              label : 'Nombre de patients',
              data : values,
              backgroundColor: 'rgba(54,162,235,0.5)',
              borderColor: 'rgba(54 , 162, 235, 1)',
              borderWidth: 3
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision : 0
                }
              }
            },
            plugins: {
              legend: {
                position: 'top'
              },
              title: {
                display: true,
                text: "La repartition d'age des patients "
              }
            }
          }
        });
      } catch(error) {
        console.log(error);
      }
    }
      else {
        console.error("error loading chart");
      }
    }

    async function bloodFunction() {
      const bloodChart = document.getElementById("bloodDonutChart");
      const url = "http://127.0.0.1:8000/statistics/chart/blood-groups/";
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          const labels = data.map(item => item.category_blood);
          const values = data.map(item => item.data_quantity);
          const ctx = bloodChart.getContext('2d');
          
          const donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [{
                label: 'Répartition Groupe Sanguin',
                data: values,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.7)',
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                  'rgba(255, 159, 64, 0.7)',
                  'rgba(201, 203, 207, 0.7)',
                  'rgba(100, 149, 237, 0.7)'
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                  'rgba(201, 203, 207, 1)',
                  'rgba(100, 149, 237, 1)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              cutout: '60%',
              plugins: {
                title: {
                  display: true,
                  text: 'Répartition des Groupes Sanguins',
                  font: {
                    size: 16,
                    weight: 'bold'
                  },
                  padding: {
                    top: 10,
                    bottom: 20
                  }
                },
                legend: {
                  position: 'right',
                  align: 'center',
                  labels: {
                    boxWidth: 8,
                    padding: 6,
                    font: {
                      size: 9
                    }
                  }
                },
                tooltip: {
                  enabled: true
                }
              }
            }
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        console.error("Error loading blood groups donut chart");
      }
  }

  async function rdvProgression(){
    const url = "http://127.0.0.1:8000/statistics/chart/rdv-progression/";
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/js'
      }
    });
    if(response.ok) {
      try {
        const data = await response.json();
        const rdvChart = document.getElementById("rdvLineChart");
        const labels = data.map(item => item.month);
        const values = data.map(item => item.count);
        const ctx = rdvChart.getContext('2d');
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Nombre de Rendez-vous',
              data: values,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4 
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0 
                }
              }
            },
            plugins: {
              legend: {
                position: 'top'
              },
              title: {
                display: true,
                text: 'Progression des Rendez-vous par Mois'
              }
            }
          }
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.error("erreur produite lors de la creation du rendezvousProgression");
    }
  }

  async function renderUpcomingRdv() {
    const listeRdv = document.querySelector(".rdv-liste");
    const url = "http://127.0.0.1:8000/docteur/upcoming-rendezvous/";
    const response = await fetch(url , {
      method: 'GET',
      headers:{
        'Authorization':`Token ${token}`,
        'Content-Type': 'applicaiton/json'
      }
    });
    if (response.ok){
      try{
        const data = await response.json();
        if(data.length > 0)
          listeRdv.innerHTML =  data.map(app => `
            <div class="appointment-item">
              <div class="appointment-info">
                <h4>${app.patient_nom} - ${app.description}</h4>
                <p><i class="far fa-calendar-alt"></i> ${isoToDateTime(app.date)}</p>
              </div>
            </div>
          `).join('');
  

      }catch(error){
        console.log(error);
      }
    }else{
      const data = await response.json();
      if(response.status == 404){
        listeRdv.innerHTML = `<p>${data.message}</p>`;
      }else{
      console.error("error lors de renderUpcomingrdv function !");
      }
    }
  }

  async function renderAvgAge() {
    const urlMoyenAge = "http://127.0.0.1:8000/statistics/moyen-age/";
    const ageMoyen = document.querySelector(".moyen-age");
    const responseAvgData = await fetch(urlMoyenAge , {
      method:'GET',
      headers:{
        'Authorization':`Token ${token}`,
        'Content-Type':'application/json'
      }
    });
    if(responseAvgData.ok) {
      const avg = await responseAvgData.json();
      ageMoyen.innerHTML = `Âge moyen : ${avg.average_age}`;
    }
    else{
      console.error("error dans la reponse");
    }
  }

  async function renderMonthlyPatient() {
    const urlMonthlyPatient = "http://127.0.0.1:8000/statistics/monthly-patients/";
    const monthPatient = document.querySelector(".title-monthly");
    const response = await fetch(urlMonthlyPatient , {
      method:'GET',
      headers:{
        'Authorization':`Token ${token}`,
        'Content-Type':'application/json'
      }
    });
    if(response.ok) {
      const data = await response.json();
      console.log(data);
      monthPatient.innerHTML = `Patients mensuels : ${data.monthly_patients}`;
    }
    else{
      console.error("error dans la reponse")
    }
  }

  async function renderRdvCounts() {
    const urlCountRdv = "http://127.0.0.1:8000/statistics/today-rendezvous-count/";
    const rdvCount = document.querySelector('.title-rdcount');
    const response = await fetch(urlCountRdv , {
      method:'GET',
      headers:{
        'Authorization':`Token ${token}`,
        'Content-Type':'application/json'
      }
    });
    if(response.ok) {
      let data = await response.json();
      rdvCount.innerHTML = `Rendez-Vous aujourdhui: ${data.today_rendezvous}`;
    }
    else{
      console.error("error dans la reponse")
    }
  }


    // Helper: format date string
    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-GB', options);
    }
  });
  



async function renderPatientList() {
  const patientList = document.querySelector(".patients-list");
  const sendBtn = document.getElementById("btn-send-message");
  
  // Check if element exists first
  if (!patientList) {
    console.error("Patient list container not found");
    return;
  }

  const url = "http://127.0.0.1:8000/docteur/contacts-patients/";
  
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
          <div class="patient-card active" id="${contact.id}">
            <h2>${contact.nom_patient}</h2>
            <p>${contact.email_patient}</p>
          </div>
        `).join('');

        sendBtn.addEventListener('click', (event)=>{
          event.preventDefault();
          sendMessage(patientID);
          getConversations(card.id);
        })
        document.querySelectorAll('.patient-card').forEach(card => {

          card.addEventListener('click', () => {
            patientID = card.id;
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
            <p>Aucun patient disponible</p>
          </div>`;
      }
    } else if (response.status === 404) {
      patientList.innerHTML = `
        <div class="no-doctors">
          <i class="fas fa-user-md"></i>
          <p>Aucun patient trouvé</p>
        </div>`;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error in renderPatientList:", error);
    patientList.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erreur lors du chargement des patients</p>
      </div>`;
  }
  }

async function getConversations(idContact) {
    const chat = document.getElementById("chat-messages");
    const url = `http://127.0.0.1:8000/docteur/see-messages/${idContact}/`;
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
        const userResponse = await fetch(`http://127.0.0.1:8000/docteur/users/${drData.id}/`, {
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

async function sendMessage(patientID) {
  event.preventDefault();
  const url = "http://127.0.0.1:8000/docteur/write-message/";
  const messageInput = document.getElementById("message-text");
  
  // Check if message is empty
  if (!messageInput.value.trim()) {
    return; 
  }


  
  let messageData = {
    'objet': 'message',
    'envoie': currentUserId,
    'reception': patientID,
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
      
      chat.scrollTop = chat.scrollHeight;
      
      messageInput.value = '';
      
      
      getConversations(patientID);

      
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