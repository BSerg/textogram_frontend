import axios from 'axios';
import * as cookie from 'js-cookie';
import 'clientjs/dist/client.min.js';

const client = new ClientJS();
const fingerprint = client.getFingerprint();



export let api = axios.create({
    baseURL: process.env.API_URL,
});

api.interceptors.request.use(function(config: any) {
    let jwt = cookie.get('jwt');
    if (jwt) {
        config.headers['Authorization'] = 'Bearer ' + jwt;
    } else {
        let token = cookie.get('jwt') || window.localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = 'Token ' + localStorage.getItem('authToken');
        }
    }
    config.headers['X-Fingerprint'] = fingerprint;
    return config;
});