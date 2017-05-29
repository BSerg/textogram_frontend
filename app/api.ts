import axios from 'axios';

if (process.env.IS_BROWSER) {
    require('clientjs/dist/client.min.js');
}



const client = process.env.IS_BROWSER ? new ClientJS() : null;
const fingerprint = client ? client.getFingerprint() : null;



export let api = axios.create({
    baseURL: process.env.API_URL,
});

// export let api = axios.Axios.

api.interceptors.request.use(function(config: any) {
    if (process.env.IS_BROWSER) {
        let token = window.localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = 'Token ' + localStorage.getItem('authToken');
        }
        config.headers['X-Fingerprint'] = fingerprint;
    }
    return config;
});