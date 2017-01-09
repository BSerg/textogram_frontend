import * as React from 'react';
import Action from '../Action';
import {api} from '../../api';

export const GET_ME = 'get_me';
export const LOGIN = 'login';
export const LOGOUT = 'logout';

class UserActionClass extends Action {
    constructor() {
        super({user: null});
    }
}

export const UserAction = new UserActionClass();


UserAction.registerAsync(GET_ME, (store, data: any) => {

    return new Promise((resolve, reject) => {
        api.get('/users/me/').then((response: any) => {
            store.user = response.data;
            localStorage.setItem('authToken', response.data.token);
            resolve(response.data);
        }).catch((error) => {
            reject(error);
        });
    });
});
