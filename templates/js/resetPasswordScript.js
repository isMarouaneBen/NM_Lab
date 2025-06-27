const form = document.getElementById('resetForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('submitText').classList.add('d-none');
    document.getElementById('spinner').classList.remove('d-none');
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const resetId = new URLSearchParams(window.location.search).get('reset_id');
    
    if (password !== confirmPassword) {
        showMessage("Les mots de passe ne correspondent pas", 'danger');
        return;
    }
    
    try {
        const response = await fetch(`/users/password/reset/${resetId}/confirm/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: password,
                confirm_password: confirmPassword
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.erreur || "Erreur lors de la réinitialisation");
        }
        
        showMessage("Mot de passe réinitialisé avec succès! Redirection...", 'success');
        setTimeout(() => window.location.href = "login.html", 2000);
        
    } catch (error) {
        showMessage(error.message, 'danger');
    } finally {
        document.getElementById('submitText').classList.remove('d-none');
        document.getElementById('spinner').classList.add('d-none');
    }
});

function showMessage(text, type) {
    message.textContent = text;
    message.classList.remove('d-none', 'alert-success', 'alert-danger');
    message.classList.add(`alert-${type}`);
}