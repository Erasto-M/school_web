document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const form = document.querySelector('form');
  
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
  
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.textContent = ''; // Clear previous error message
        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value.trim(); // Direct reference to password input
  
        // Validation
        if (username === '' || password === '') {
            errorMessage.textContent = "Please fill out both username and password fields.";
            return;
        }
    
        if (!/^[a-zA-Z0-9]{5,}$/.test(username)) {
            errorMessage.textContent = "Username should be at least 5 characters long and contain only letters and numbers.";
            return;
        }
  
        // Attempt to submit form data via fetch
        try {
            const response = await fetch('https://school-web-backend.onrender.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
  
            if (response.ok) {
                const redirectUrl = await response.text();
                window.location.href = redirectUrl;
                errorMessage.textContent = response.text();
            } else {
                const errorMsg = await response.text();
                errorMessage.textContent = errorMsg;
            }
        } catch (error) {
            console.error('Error during login:', error);
            errorMessage.textContent = 'An error occurred while logging in. Please try again later.';
        }
    });
});
