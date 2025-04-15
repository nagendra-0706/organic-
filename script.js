// Security utilities
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character');

    return errors;
};

const hashPassword = async (password) => {
    // Using a simpler SHA-256 implementation that matches the server
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

};

// Rate limiting implementation
const rateLimiter = {
    attempts: {},
    maxAttempts: 5,
    timeWindow: 15 * 60 * 1000, // 15 minutes

    async checkLimit(email) {
        const now = Date.now();
        if (!this.attempts[email]) {
            this.attempts[email] = { count: 0, timestamp: now };
            return true;
        }

        const attempt = this.attempts[email];
        if (now - attempt.timestamp > this.timeWindow) {
            attempt.count = 0;
            attempt.timestamp = now;
            return true;
        }

        if (attempt.count >= this.maxAttempts) {
            const remainingTime = Math.ceil((attempt.timestamp + this.timeWindow - now) / 1000 / 60);
            throw new Error(`Too many login attempts. Please try again in ${remainingTime} minutes.`);
        }

        attempt.count++;
        return true;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // Form switching functionality
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
    });

    // Login form validation and submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!loginForm.checkValidity()) {
            e.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing in...';

            // Rate limiting check
            await rateLimiter.checkLimit(email);

            // Hash password before sending
            const hashedPassword = await hashPassword(password);

            // Send login request to server
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // Properly handle response parsing
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                // Handle JSON parsing errors
                if (parseError.message.includes('Unexpected token')) {
                    throw new Error('Server error: Unable to process login. Please try again later.');
                }
                throw parseError;
            }
            
            if (response.ok) {
                // Store auth data in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                // Redirect to home page
                window.location.href = 'home.html';
            } else {
                throw new Error(data.error || 'Invalid email or password');
            }

        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.textContent = error.message;
            loginForm.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In';
        }
    });

    // Registration form validation and submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!registerForm.checkValidity()) {
            e.stopPropagation();
            registerForm.classList.add('was-validated');
            return;
        }

        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('regName').value;
        const submitButton = registerForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';

            // Validate password strength
            const passwordErrors = validatePassword(password);
            if (passwordErrors.length > 0) {
                throw new Error(passwordErrors.join('\n'));
            }

            // Check if passwords match
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Send registration request to server
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password: hashedPassword,
                    fullName
                })
            });

            // Properly handle response parsing
            try {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Registration failed');
                }
            } catch (parseError) {
                // Handle JSON parsing errors
                if (parseError.message.includes('Unexpected token')) {
                    throw new Error('Server error: Unable to process registration. Please try again later.');
                }
                throw parseError;
            }

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'alert alert-success mt-3';
            successDiv.textContent = 'Registration successful! Please sign in.';
            registerForm.appendChild(successDiv);

            // Clear form
            registerForm.reset();

            // Switch to login form after 2 seconds
            setTimeout(() => {
                successDiv.remove();
                registerForm.classList.add('d-none');
                loginForm.classList.remove('d-none');
                // Pre-fill email in login form
                document.getElementById('email').value = email;
            }, 2000);

        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.textContent = error.message;
            registerForm.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        }
    });

    // Password validation
    document.getElementById('regPassword').addEventListener('input', function(e) {
        if (e.target.value.length < 8) {
            e.target.setCustomValidity('Password must be at least 8 characters long');
        } else {
            e.target.setCustomValidity('');
        }
    });

    // Confirm password validation
    document.getElementById('confirmPassword').addEventListener('input', function(e) {
        const password = document.getElementById('regPassword').value;
        if (e.target.value !== password) {
            e.target.setCustomValidity('Passwords do not match');
        } else {
            e.target.setCustomValidity('');
        }
    });
});
