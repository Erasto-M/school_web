document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('itRequestForm');
    const confirmationMessage = document.getElementById('confirmationMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const reporter_name = document.getElementById('reporter_name').value.trim();
        const email = document.getElementById('email').value.trim();
        const location = document.getElementById('location').value.trim();
        const issue_description = document.getElementById('issue_description').value.trim();

        // Validate form inputs
        if (!validateInputs(reporter_name, email, location, issue_description)) {
            confirmationMessage.innerText = 'Please fill in all fields correctly.';
            confirmationMessage.style.color = 'red';
            confirmationMessage.style.display = 'block';
            return;
        }

        // Reset the confirmation message before submitting
        confirmationMessage.style.display = 'none';

        try {
            const response = await fetch('https://school-web-backend.onrender.com/submit-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reporter_name, email, location, issue_description }),
            });

            if (response.ok) {
                const data = await response.json();
                confirmationMessage.innerText = `✅ ${data.message}`;
                confirmationMessage.style.color = 'green';
                confirmationMessage.style.display = 'block';
                form.reset(); // Clear form fields
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Submission failed');
            }
        } catch (error) {
            confirmationMessage.innerText = 'Error: ' + error.message;
            confirmationMessage.style.color = 'red';
            confirmationMessage.style.display = 'block';
        }
    });

    // Function to validate form inputs
    function validateInputs(name, email, location, description) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
        return name !== '' && 
               emailPattern.test(email) && 
               location !== '' && 
               description !== '';
    }
});
