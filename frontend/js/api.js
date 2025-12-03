// API Configuration
const API_BASE_URL = 'http://13.61.230.65:3000/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

function getAdminToken() {
    return localStorage.getItem('adminToken');
}

// ------------------------
// USER API REQUEST
// ------------------------
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    // FIXED BACKEND ROUTES
    const fixedEndpoints = {
        '/login': '/auth/login',
        '/register': '/auth/register',
        '/products': '/products',
        '/cart': '/cart',
        '/orders': '/orders'
    };

    const finalEndpoint = fixedEndpoints[endpoint] || endpoint;
    const url = API_BASE_URL + finalEndpoint;

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
        method: options.method || 'GET',
        headers: Object.assign(defaultHeaders, options.headers || {})
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
        throw { response, data };
    }

    return { response, data };
}



// ------------------------
// ADMIN API REQUEST
// ------------------------
async function adminApiRequest(endpoint, options = {}) {
    const token = getAdminToken();

    // FIX ADMIN ROUTES
    const fixedEndpoints = {
        '/admin/login': '/admin/login',
        '/admin/products': '/admin/products',
        '/admin/orders': '/admin/orders'
    };

    const finalEndpoint = fixedEndpoints[endpoint] || endpoint;

    const url = API_BASE_URL + finalEndpoint;

    const defaultHeaders = { 'Content-Type': 'application/json' };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
        method: options.method || 'GET',
        headers: Object.assign(defaultHeaders, options.headers || {})
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
            localStorage.removeItem('adminToken');
            localStorage.removeItem('admin');
            window.location.href = 'admin-login.html';
        }
        throw { response, data };
    }

    return { response, data };
}
