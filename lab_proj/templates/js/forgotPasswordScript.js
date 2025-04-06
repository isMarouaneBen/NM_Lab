const email = document.getElementById('email');
const errorAlert = document.getElementById('errorAlert');
const submitText = document.getElementById('submitText');
const spinner = document.getElementById('spinner');
const resetForm = document.getElementById('resetForm');
resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    submitText.classList.add('d-none');
    spinner.classList.remove('d-none');
    errorAlert.classList.add('d-none');
            
    url = "http://127.0.0.1:8000/users/password/reset/";
    data = {
        email : email
    };
    try {
        const response = await fetch(url, {
            method : 'POST',
            headers : {
                'Content-Type': 'application/json'
            },
            body : JSON.stringify(data) 
        });
            console.log("status :" , response.status);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail ||  `HTTP error! status: ${response.status}`);
            }

            const result  = await response.json();
            console.log("reponse API : ", result);
            window.location.href = 'email-sent.html';
        } catch (error) {
                console.error("Login error:", error);
                if (error.message.includes('405')) {
                    showError("Erreur de configuration serveur (Méthode non autorisée)");
                } else {
                    showError(error.message || "Une erreur est survenue lors de la connexion");
                }
        }finally {
            submitText.classList.remove('d-none');
            spinner.classList.add('d-none');
        }
        function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        window.scrollTo(0, 0);
    }
})