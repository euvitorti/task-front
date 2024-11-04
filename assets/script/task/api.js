// api.js
const API_URL = 'http://localhost:8080/task';
const token = localStorage.getItem('Bearer Token');

const fetchWithAuth = async (url, options = {}) => {
    options.headers = {
        'Content-Type': 'application/json',
        'Authorization': token,
        ...options.headers,
    };
    const response = await fetch(url, options);

    if (!response.ok && response.status !== 204) {
        throw new Error(`Error: ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
};

export { API_URL, fetchWithAuth };