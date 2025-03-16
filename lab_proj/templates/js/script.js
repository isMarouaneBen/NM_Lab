    // Diagramme pour l'âge des patients
    const ageChart = new Chart(document.getElementById('ageChart'), {
        type: 'pie',
        data: {
          labels: ['0-18 ans', '18-30 ans', '30-50 ans', '50+ ans'],
          datasets: [{
            label: 'Âge des Patients',
            data: [20, 30, 40, 10],
            backgroundColor: ['#1976D2', '#D32F2F', '#388E3C', '#FFA000'],
          }]
        },
      });
  
      // Diagramme pour l'emploi du temps
      const scheduleChart = new Chart(document.getElementById('scheduleChart'), {
        type: 'bar',
        data: {
          labels: ['10:00', '11:00', '12:00'],
          datasets: [{
            label: 'Emploi du Temps',
            data: [1, 1, 1],
            backgroundColor: ['#1976D2', '#D32F2F', '#388E3C'],
          }]
        },
      });


      const salaryChart = new Chart(document.getElementById('salaryChart'), {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Salaire',
            data: [2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100],
            borderColor: '#1976D2',
            fill: false,
          }]
        },
      });
  
      // Diagramme pour les heures de travail
      const dutyHourChart = new Chart(document.getElementById('dutyHourChart'), {
        type: 'bar',
        data: {
          labels: ['Sam', 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
          datasets: [{
            label: 'Heures de Travail',
            data: [9, 7, 4, 8, 5, 9, 7],
            backgroundColor: '#D32F2F',
          }]
        },
      });
  
      // Diagramme pour le genre des patients
      const genderChart = new Chart(document.getElementById('genderChart'), {
        type: 'pie',
        data: {
          labels: ['Hommes', 'Femmes'],
          datasets: [{
            label: 'Genre des Patients',
            data: [4000, 1000],
            backgroundColor: ['#1976D2', '#D32F2F'],
          }]
        },
      });