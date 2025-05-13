//Author : Marouane Ben Haddou
try {
    const tokenTest = sessionStorage.getItem('token');
  if (tokenTest === null) {
    throw new Error("Token not found");
  }


} catch (error) {
    window.location.href = "login.html";
}
const tab = sessionStorage.getItem('currentTab');
if(tab === null || tab === undefined) {
  sessionStorage.setItem('currentTab', 'dashboard');
}
const token = sessionStorage.getItem('token');
let drData = JSON.parse(sessionStorage.getItem('data'));
let patientID = null;
let currentUserId = null;
let selectedContact = null;
document.addEventListener('DOMContentLoaded', function() {
  const logoutbutton = document.querySelector(".btn-logout")
  
  logoutbutton.addEventListener('click', function() {
    console.log("Logout button clicked");
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
        
        if (response.ok) {
          console.log("Logout successful, clearing token and redirecting...");
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('data');
          sessionStorage.removeItem('currentTab');
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
});

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
      closeModalBtns: document.querySelectorAll('.close-modal, .btn-close-modal')
    };
  
    initEventListeners();
    renderAll();
  
    function initEventListeners() {
      document.addEventListener('DOMContentLoaded', function() {
      
        const lastActiveTab = localStorage.getItem('currentTab');
        if (lastActiveTab) {
          switchTab(lastActiveTab);
        }
      });
      DOM.tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
      });  
      document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-view')) {
          const id = parseInt(e.target.closest('.btn-view').dataset.id);
          viewAppointment(id);
        }
      });
      DOM.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => DOM.appointmentModal.classList.remove('active'));
      });
  
      // if (DOM.modalCancelBtn) {
      //   DOM.modalCancelBtn.addEventListener('click', function() {
      //     const id = parseInt(this.dataset.id);
      //     cancelAppointment(id);
      //     DOM.appointmentModal.classList.remove('active');
      //     alert("The patient has been notified about the cancellation.");
      //   });
      // }
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
        if(selectedContact !== null) {
          getConversations(selectedContact);
        }
        sessionStorage.setItem('currentTab', tabName);

      }
      if(tabName === 'appointments') {
        sessionStorage.setItem('currentTab', tabName);
      }
      if(tabName === 'dashboard'|| tabName === undefined ) {
        sessionStorage.setItem('currentTab', 'dashboard');
        ageChart();
        bloodFunction();
        rdvProgression();
        renderUpcomingRdv();
        renderAvgAge();
        renderRdvCounts();
        renderMonthlyPatient();
      }

      
    }



  
    function renderAll() {
      
      switchTab(sessionStorage.getItem("currentTab"));
      renderAppointments();
      renderPrescriptionHistory();
      renderProfile();
      renderDocName();
    }
    function isoToDateTime(isoString) {
      const date = new Date(isoString);
    
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); 
      const day = String(date.getDate()).padStart(2, '0');
    
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
    
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

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
                <button class="btn-delete" data-id="${app.id}">Annuler</button>
              </div>
              </div>
            `).join('');
            const cancelButtons = document.querySelectorAll('.btn-delete');
            cancelButtons.forEach(button => {
              button.addEventListener('click', async () => {
                const appointmentId = button.getAttribute('data-id');
                
                const confirmCancel = confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous?");
                
                if (confirmCancel) {
                  const cancelUrl = `http://127.0.0.1:8000/docteur/cancel-rendezvous/${appointmentId}/`;
                  
                  try {
                    const cancelResponse = await fetch(cancelUrl, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    if (cancelResponse.ok) {
                      const successDiv = document.createElement('div');
                      successDiv.className = 'success-message';
                      successDiv.innerHTML = `
                        <div class="success-popup">
                          <p>Le rendez-vous a été annulé avec succès!</p>
                          <button id="refresh-btn">Rafraîchir</button>
                        </div>
                      `;
                      document.body.appendChild(successDiv);
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


    function datetimeLocalToISO(datetimeLocalStr) {
      const date = new Date(datetimeLocalStr);
      return date.toISOString();
    }
        
    async function WritePrescription() {
      const url = "http://127.0.0.1:8000/docteur/write-prescription/";
      const submitBtn = document.getElementById("btn-submit-prescription");
      
      function clearFields() {
        document.getElementById("cin").value = "";
        document.getElementById("daterdv").value = "";
        document.getElementById("diagnostique").value = "";
        document.getElementById("traitement").value = "";
        document.getElementById("notes").value = "";
      }
      
      submitBtn.addEventListener('click', async () => {
        const cin = document.getElementById("cin").value;
        const daterdv = document.getElementById("daterdv").value;
        const diagnostique = document.getElementById("diagnostique").value;
        const traitement = document.getElementById("traitement").value;
        const notes = document.getElementById("notes").value;

    
        try {
          const result = await fetch(url, {
            method: 'POST',
            headers: {
              "Authorization": `Token ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              'patient_cin': cin,
              'date_rendezvous': datetimeLocalToISO(daterdv),
              'diagnostique': diagnostique,
              'traitment': traitement,
              'notes': notes
            })
          });
          
          if (result.ok) {
            const successMessage = document.querySelector(".sucess-message");
            successMessage.innerHTML = "<p>La prescription est ajoutée avec succès</p>";
            clearFields();
          } else {
            const errorMessage = document.querySelector(".error-message");
            errorMessage.innerHTML = "<p>Erreur lors de l'ajout de la prescription</p>";
          }
        } catch(error) {
          console.error("API Error:", error);
          const errorMessage = document.querySelector(".error-message");
          errorMessage.innerHTML = "<p>Une erreur est survenue lors de la communication avec le serveur</p>";
        }
      });
    }
  
 
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

          if (response.ok) {
            if(data.prescriptions.length > 0){
            const title = document.querySelector('.prescription-historical-title');
            title.innerHTML = `<p>Prescriptions pour ${data.nom_patient}</p>`;
            DOM.prescriptionHistoryList.innerHTML = `
              ${data.prescriptions.map(prescription => `
                <div class="prescription-item">
                  <h4>${prescription.diagnostique} : ${prescription.traitment}</h4>
                  <p>${prescription.notes}</p>
                </div>
              `).join('')}
            `;
          } else {
            DOM.prescriptionHistoryList.innerHTML = `<p>Pas de prescriptions au moment pour cet patient ou une erreur dans serveur est survenue</p>`;
          }

        } }catch (error) {
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

  //  async function cancelAppointment(id) {
  //     state.todaysAppointments = state.todaysAppointments.filter(a => a.id !== id);
  //     renderDashboard();
  //     renderAppointments();
  //   }
  
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
                  'rgba(153, 0, 0, 0.7)', 
                  'rgba(204, 0, 0, 0.7)',  
                  'rgba(255, 51, 51, 0.7)', 
                  'rgba(204, 51, 0, 0.7)', 
                  'rgba(255, 102, 102, 0.7)',
                  'rgba(153, 51, 51, 0.7)',
                  'rgba(102, 0, 0, 0.7)',
                  'rgba(204, 102, 102, 0.7)'
                ],
                borderColor: [
                  'rgba(153, 0, 0, 1)',
                  'rgba(204, 0, 0, 1)',
                  'rgba(255, 51, 51, 1)',
                  'rgba(204, 51, 0, 1)',
                  'rgba(255, 102, 102, 1)',
                  'rgba(153, 51, 51, 1)',
                  'rgba(102, 0, 0, 1)',
                  'rgba(204, 102, 102, 1)'
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


    function toIsoFormat(dateString) {
      const date = new Date(dateString);
      return date.toISOString();
    }
  



async function renderPatientList() {
  const patientList = document.querySelector(".patients-list");
  const sendBtn = document.getElementById("btn-send-message");
  
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
          // getConversations(card.id);
        })
        document.querySelectorAll('.patient-card').forEach(card => {

          card.addEventListener('click', () => {
            patientID = card.id;
            sessionStorage.setItem('selectedContact', patientID);
            selectedContact = sessionStorage.getItem('selectedContact');
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
          chat.innerHTML = `
            <div class="empty-chat">
              <i class="fas fa-comment-dots"></i>
              <p>Envoyez votre premier message</p>
            </div>`;
        }
        
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

async function sendMessage(patientID) {
  event.preventDefault();
  const url = "http://127.0.0.1:8000/docteur/write-message/";
  const messageInput = document.getElementById("message-text");
  
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