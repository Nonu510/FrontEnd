// Configuration de l'API
const API_URL = 'http://localhost:5678/api/users/login'; // Remplacez par l'URL de votre API

// Fonction pour afficher les messages d'erreur
function showError(message) {
    // Supprimer l'ancien message s'il existe
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Retirer le style d'erreur des champs
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
    inputs.forEach(input => input.classList.remove('form-error'));
    
    // Créer et afficher le nouveau message d'erreur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Ajouter le style d'erreur aux champs vides
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('form-error');
        }
    });
}

// Fonction pour afficher un message de succès
function showSuccess(message) {
    // Supprimer l'ancien message s'il existe
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Créer et afficher le message de succès
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.insertBefore(successDiv, form.firstChild);
}

// Fonction pour stocker le token d'authentification
function storeAuthToken(token, userId) {
    // Stocker le token dans localStorage pour persistance
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginTime', new Date().toISOString());
}

// Fonction pour effectuer la requête de connexion à l'API
async function authenticateUser(email, password) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // Vérifier si la réponse est OK
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Erreur dans l\'identifiant ou le mot de passe');
            } else if (response.status === 404) {
                throw new Error('Utilisateur non trouvé');
            } else {
                throw new Error('Erreur de connexion au serveur');
            }
        }

        // Parser la réponse JSON
        const data = await response.json();
        
        // Vérifier que nous avons bien reçu un token
        if (!data.token) {
            throw new Error('Token d\'authentification manquant');
        }

        return {
            success: true,
            token: data.token,
            userId: data.userId || null
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Fonction pour gérer la connexion réussie
function handleSuccessfulLogin(token, userId) {
    // Stocker le token d'authentification
    storeAuthToken(token, userId);
    
    // Afficher un message de succès
    showSuccess('Connexion réussie ! Redirection en cours...');
    
    // Rediriger vers la page principale après un court délai
    setTimeout(() => {
        window.location.href = 'index.html'; // Changez selon votre page principale
    }, 1000);
}

// Fonction pour désactiver/activer le bouton de soumission
function toggleSubmitButton(disabled) {
    const submitBtn = document.querySelector('input[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = disabled;
        submitBtn.value = disabled ? 'Connexion...' : 'Se connecter';
        submitBtn.style.opacity = disabled ? '0.6' : '1';
        submitBtn.style.cursor = disabled ? 'not-allowed' : 'pointer';
    }
}

// Fonction principale de gestion du formulaire
async function handleLogin(event) {
    event.preventDefault(); // Empêcher la soumission normale du formulaire
    
    // Récupérer les valeurs des champs
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Vérifier que les champs ne sont pas vides
    if (!email || !password) {
        showError('Veuillez remplir tous les champs');
        return;
    }
    
    // Vérifier que l'email a un format valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Veuillez entrer une adresse email valide');
        return;
    }
    
    // Désactiver le bouton pendant la requête
    toggleSubmitButton(true);
    
    try {
        // Effectuer la requête d'authentification
        const result = await authenticateUser(email, password);
        
        if (result.success) {
            // Connexion réussie
            handleSuccessfulLogin(result.token, result.userId);
        } else {
            // Erreur de connexion
            showError(result.error);
        }
    } catch (error) {
        // Erreur inattendue
        showError('Une erreur inattendue s\'est produite. Veuillez réessayer.');
        console.error('Erreur de connexion:', error);
    } finally {
        // Réactiver le bouton
        toggleSubmitButton(false);
    }
}

// Fonction pour vérifier si l'utilisateur est déjà connecté
function checkExistingAuth() {
    const token = localStorage.getItem('authToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (token && isLoggedIn === 'true') {
        // Vérifier si le token n'est pas expiré (optionnel)
        const loginTime = localStorage.getItem('loginTime');
        if (loginTime) {
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            // Si connecté depuis moins de 24h, rediriger
            if (hoursDiff < 24) {
                window.location.href = 'index.html';
                return;
            } else {
                // Token expiré, nettoyer le localStorage
                clearAuthData();
            }
        }
    }
}

// Fonction pour nettoyer les données d'authentification
function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
}

// Fonction utilitaire pour récupérer le token (à utiliser dans d'autres pages)
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Fonction utilitaire pour vérifier si l'utilisateur est connecté
function isUserLoggedIn() {
    const token = localStorage.getItem('authToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    return token && isLoggedIn === 'true';
}

// Initialisation quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    checkExistingAuth();
    
    // Attacher l'événement au formulaire
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
    
    // Nettoyer les messages d'erreur quand l'utilisateur tape
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const errorMessage = document.querySelector('.error-message');
            if (errorMessage) {
                this.classList.remove('form-error');
            }
        });
    });
});

// Exporter les fonctions utilitaires (si nécessaire pour d'autres scripts)
window.authUtils = {
    getAuthToken,
    isUserLoggedIn,
    clearAuthData
};