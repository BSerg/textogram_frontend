import axios from 'axios';
import * as cookie from 'js-cookie';
import 'clientjs/dist/client.min.js';

if (process.env.IS_BROWSER) {
    require('clientjs/dist/client.min.js');
}



const client = process.env.IS_BROWSER ? new ClientJS() : null;
const fingerprint = client ? client.getFingerprint() : null;



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

// let cacheBaseUrl: string = process.env.API_URL.toString() || '';


export let cacheApi = axios.create({
    baseURL: process.env.CACHE_API_URL,
});