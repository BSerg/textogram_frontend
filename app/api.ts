import * as axios from 'axios';

export let api = axios.create({
    baseURL: process.env.API_URL,
});

api.interceptors.request.use(function(config) {
    let token = window.localStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = 'Token ' + localStorage.getItem('authToken')
    }
    return config;
});
