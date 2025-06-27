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