// API Configuration
const API_BASE_URL = (function() {
    // Use same host as the page, and default to port 3000 where backend typically runs.
    const proto = window.location.protocol;
    const hostname = window.location.hostname;
    const port = 3000;
    return `${proto}//${hostname}:${port}/api`;
})();

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
    options.headers = options.headers || {};
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    const fetchOptions = Object.assign({credentials: 'include', method: 'GET'}, options);
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

// Admin-specific helper
async function adminApiRequest(endpoint, options = {}) {
    const adminToken = getAdminToken();
    const url = API_BASE_URL + '/admin' + endpoint;
    options.headers = options.headers || {};
    if (adminToken) {
        options.headers['Authorization'] = `Bearer ${adminToken}`;
    }
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    const fetchOptions = Object.assign({credentials: 'include', method: 'GET'}, options);
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
