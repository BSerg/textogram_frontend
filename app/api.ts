import axios from 'axios';
import 'clientjs/dist/client.min.js';

const client = new ClientJS();
const fingerprint = client.getFingerprint();



export let api = axios.create({
    baseURL: process.env.API_URL,
});

// export let api = axios.Axios.

api.interceptors.request.use(function(config: any) {
    let token = window.localStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = 'Token ' + localStorage.getItem('authToken');
    }
    config.headers['X-Fingerprint'] = fingerprint;
    return config;
});