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
        config.headers['Access-Control-Allow-Origin'] = '*';
        config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS, PATCH, DELETE';
        config.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token';
    }
    console.log(config);

    return config;
});