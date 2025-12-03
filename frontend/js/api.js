// API Configuration
const API_BASE_URL = 'http://13.61.230.65:3000/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

function getAdminToken() {
    return localStorage.getItem('adminToken');
}

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const url = API_BASE_URL + endpoint;

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
        method: options.method || 'GET',
        headers: Object.assign(defaultHeaders, options.headers || {}),
    };

    if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }

    if (!response.ok) {
        if (response.status === 401) {
            // unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
        // throw to let caller handle
        throw { response, data };
    }

    return { response, data };
}

async function adminApiRequest(endpoint, options = {}) {
    const token = getAdminToken();
    const url = API_BASE_URL + endpoint;

    const defaultHeaders = { 'Content-Type': 'application/json' };
    if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;

    const fetchOptions = {
        method: options.method || 'GET',
        headers: Object.assign(defaultHeaders, options.headers || {}),
    };

    if (options.body) fetchOptions.body = JSON.stringify(options.body);

    const response = await fetch(url, fetchOptions);
    let data = null;
    try { data = await response.json(); } catch (e) { data = null; }

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('admin');
            window.location.href = 'admin-login.html';
        }
        throw { response, data };
    }
    return { response, data };
}
