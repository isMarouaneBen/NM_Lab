document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorAlert = document.getElementById('errorAlert');
    const submitText = document.getElementById('submitText');
    const spinner = document.getElementById('spinner');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        submitText.classList.add('d-none');
        spinner.classList.remove('d-none');
        errorAlert.classList.add('d-none');
        
        const url = "http://127.0.0.1:8000/users/login/";
        const requestData = {
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("API Response:", result);

            if (result.data?.user?.role) {
                
                const role = result.data.user.role.toLowerCase();
                if (role === 'patient') {
                    sessionStorage.setItem('patientoken', result.token);
                    sessionStorage.setItem('patientData', JSON.stringify(result.data));
                    window.location.href = 'patient.html';
                } else if (role === 'docteur') {
                    sessionStorage.setItem('data', JSON.stringify(result.data));
                    sessionStorage.setItem('token', result.token);
                    window.location.href = 'docteur.html';
                } else {
                    window.location.href = 'register.html';
                }
            } else {
                showError("Réponse du serveur invalide - rôle utilisateur manquant");
            }
        } catch (error) {
            console.error("Login error:", error);
            if (error.message.includes('405')) {
                showError("Erreur de configuration serveur (Méthode non autorisée)");
            } else {
                showError(error.message || "Une erreur est survenue lors de la connexion");
            }
        } finally {
            submitText.classList.remove('d-none');
            spinner.classList.add('d-none');
        }
    });

    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        window.scrollTo(0, 0);
    }
});
