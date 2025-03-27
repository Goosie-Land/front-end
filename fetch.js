const api = false ? 'localhost' : '10.111.9.27';

// Récupère un utilisateur par ID
export const fetchUser = async (userId) => {
    return fetch(`http://${api}:3000/api/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .catch(error => { throw error });
}

// Récupère l'utilisateur connecté à partir du token
export const getMe = async (token) => {
    return fetch(`http://${api}:3000/api/auth/me`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
    })
        .then(response => response.json())
        .catch(error => { throw error });
}

// Connexion
export const loginUser = async (user) => {
    return fetch(`http://${api}:3000/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .catch(error => { throw error });
}

// Inscription
export const registerUser = async (user) => {
    return fetch(`http://${api}:3000/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .catch(error => { throw error });
}

// Rafraîchissement du token
export const refreshUserToken = async (refresh) => {
    return fetch(`http://${api}:3000/api/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(refresh)
    })
        .then(response => response.json())
        .catch(error => { throw error });
}

// Mise à jour de l'utilisateur
export const updateUser = async (user, userId, token) => {
    return fetch(`http://${api}:3000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .catch(error => { throw error });
}

// Mise à jour des paramètres utilisateur
export const updateUserSettings = async (settings, userId, token) => {
    return fetch(`http://${api}:3000/api/user-settings/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings)
    })
        .then(response => response.json())
        .catch(error => { throw error });
}

// Liste des utilisateurs triés par score
export const usersByScore = async () => {
    return fetch(`http://${api}:3000/api/users/byScore`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .catch(error => { throw error });
}

export const addUserSettings = async (settings, userId, token) => {
    return fetch(`http://${api}:3000/api/user-settings/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings)
    })
        .then(response => response.json())
        .catch(error => { throw error });
}
