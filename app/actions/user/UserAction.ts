import * as React from 'react';
import Action from '../Action';
import {api} from '../../api';

export const GET_ME = 'get_me';
export const LOGIN = 'login';
export const LOGOUT = 'logout';
export const UPDATE = 'update';
export const SAVE_USER = 'save';

class UserActionClass extends Action {
    constructor() {
        super({user: null});
    }
}

export const UserAction = new UserActionClass();

UserAction.register(SAVE_USER, (store, data: any) => {
    store.user = data;
    localStorage.setItem('authToken', data.token);
});

UserAction.registerAsync(GET_ME, (store, data: any) => {

    return new Promise((resolve, reject) => {
        api.get('/users/me/').then((response: any) => {
            store.user = response.data;
            localStorage.setItem('authToken', response.data.token);
            resolve(response.data);
        }).catch((error) => {
            localStorage.removeItem('authToken');
            // reject(error);
        });
    });
});

UserAction.registerAsync(LOGIN, (store, data: any) => {
    return new Promise((resolve, reject) => {
        api.post('/login/', data).then((response: any) => {
            store.user = response.data;
            localStorage.setItem('authToken', response.data.token);
            resolve(response.data);
        }).catch((error) => {
            reject(error);
        })
    });
});

UserAction.registerAsync(LOGOUT, (store, data: any) => {
    return new Promise((resolve, reject) => {
        api.post('/logout/').then((response: any) => {
            store.user = null;
            localStorage.removeItem('authToken');
            resolve(response.data)
        }).catch((error) => {})
    });
});

UserAction.registerAsync(UPDATE, (store, data: any) => {
    return new Promise((resolve, reject) => {
        api.patch('/users/me/', data).then((response: any) => {
            store.user = response.data;
            resolve(response.data);
        }).catch((error) => {})
    })
});
