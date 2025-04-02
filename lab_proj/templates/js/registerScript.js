document.addEventListener('DOMContentLoaded', function() {
    const patientBtn = document.getElementById('patientBtn');
    const doctorBtn = document.getElementById('doctorBtn');
    const additionalFields = document.getElementById('additionalFields');
    const registrationForm = document.getElementById('registrationForm');
    const errorAlert = document.getElementById('errorAlert');
    const submitText = document.getElementById('submitText');
    const spinner = document.getElementById('spinner');
    let currentRole = 'patient'; // Default role

    patientBtn.classList.add('active');

    function clearAdditionalFields() {
        additionalFields.innerHTML = '';
    }

    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        window.scrollTo(0, 0);
    }

    function toggleActiveButton(activeBtn, inactiveBtn) {
        activeBtn.classList.add('active');
        inactiveBtn.classList.remove('active');
    }

    patientBtn.addEventListener('click', function() {
        currentRole = 'patient';
        toggleActiveButton(patientBtn, doctorBtn);
        
        clearAdditionalFields();
        additionalFields.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Date de Naissance</label>
                <input type="date" class="form-control" id="date_naissance" name="date_naissance">
            </div>
            <div class="mb-3">
                <label class="form-label">Numéro d'identité (CIN)</label>
                <input type="text" class="form-control" id="cin" name="cin" placeholder="CIN">
            </div>
            <div class="mb-3">
                <label class="form-label">Allergies</label>
                <select class="form-control" id="allergies" name="allergies">
                    <option value="Aucun">Aucun</option>
                    <option value="Médicamenteuses">Médicamenteuses</option>
                    <option value="Alimentaires">Alimentaires</option>
                    <option value="Insecteuses">Insecteuses</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Groupe Sanguin</label>
                <input type="text" class="form-control" id="groupe_sanguin" name="groupe_sanguin" placeholder="A+, A-, O+, O-...">
            </div>
            <div class="mb-3">
                <label class="form-label">Sexe</label>
                <select class="form-control" id="sexe" name="sexe">
                    <option value="M">M</option>
                    <option value="F">F</option>
                </select>
            </div>
        `;
    });

    doctorBtn.addEventListener('click', function() {
        currentRole = 'docteur';
        toggleActiveButton(doctorBtn, patientBtn);
        
        clearAdditionalFields();
        additionalFields.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Spécialité Médicale</label>
                <input type="text" class="form-control" id="specialite" name="specialite" placeholder="Spécialité">
            </div>
        `;
    });

    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        errorAlert.classList.add('d-none');
        submitText.classList.add('d-none');
        spinner.classList.remove('d-none');

        const url = currentRole === 'docteur' 
            ? 'http://127.0.0.1:8000/users/register/docteur/' 
            : 'http://127.0.0.1:8000/users/register/patient/';

        const userData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            first_name: document.getElementById('prenom').value,
            last_name: document.getElementById('nom').value,
            role: currentRole
        };

        let requestData = {};
        
        try {
            if (currentRole === 'patient') {
                requestData = {
                    user: userData,
                    date_naissance: document.getElementById('date_naissance').value,
                    cin: document.getElementById('cin').value,
                    groupe_sanguin: document.getElementById('groupe_sanguin').value,
                    sexe: document.getElementById('sexe').value,
                    allergies: document.getElementById('allergies').value
                };
            } else {
                requestData = {
                    user: userData,
                    specialite: document.getElementById('specialite').value
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("API Response:", result);

            window.location.href = 'login.html';
        } catch (error) {
            console.error("Registration error:", error);
            showError(error.message || "Une erreur est survenue lors de l'inscription");
        } finally {
            submitText.classList.remove('d-none');
            spinner.classList.add('d-none');
        }
    });
});