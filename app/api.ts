import * as axios from 'axios';

export let api = axios.create({
    baseURL: process.env.API_URL,
    timeout: 1000,
});

api.interceptors.request.use(function(config) {
    let token = window.localStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = 'Token ' + localStorage.getItem('authToken')
    }
    return config;
});
