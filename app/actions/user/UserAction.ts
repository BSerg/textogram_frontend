import * as React from 'react';
import Action from '../Action';
import {api} from '../../api';

export const GET_ME = 'get_me';
export const LOGIN = 'login';
export const LOGOUT = 'logout';
export const UPDATE_USER = 'update';
export const SAVE_USER = 'save';
export const USER_REJECT = 'reject';
export const UPDATE_USER_DRAFTS = 'update_drafts';


class UserActionClass extends Action {
    constructor() {
        super({user: null, getPromise: null});
    }
}

export const UserAction = new UserActionClass();

UserAction.register(SAVE_USER, (store, data: any) => {
    store.user = data;
    localStorage.setItem('authToken', data.token);
});

UserAction.register(USER_REJECT, (store, data: any) => {});

UserAction.register(UPDATE_USER_DRAFTS, (store, addAmount: number = 1) => {
    if (!store.user) {
        return;
    }
    let drafts: number = (store.user.drafts || 0) + addAmount;
    if (drafts < 0) {
        drafts = 0;
    }
    store.user.drafts = drafts;
});

UserAction.registerAsync(GET_ME, (store, data: any) => {

    if (!store.getPromise) {
        store.getPromise = new Promise((resolve, reject) => {
            api.get('/users/me/').then((response: any) => {
                store.user = response.data;
                localStorage.setItem('authToken', response.data.token);
                resolve(response.data);
            }).catch((error) => {
                localStorage.removeItem('authToken');
                UserAction.do(USER_REJECT, null);
                reject(error);
            });
        });
    }
    return store.getPromise;


});

UserAction.registerAsync(LOGIN, (store, data: any) => {

    return new Promise((resolve, reject) => {
        api.post('/login/', data).then((response: any) => {
            store.user = response.data;
            localStorage.setItem('authToken', response.data.token);
            document.cookie = 'authToken=' + response.data.token;
            resolve(response.data);
        }).catch((error) => {
            reject(error);
        })
    });
});

UserAction.registerAsync(LOGOUT, (store, data: any) => {

    if (store.user) {
        if (store.user.social == 'vk') {
            VK.Auth.logout((response) => {});
        }
        else if (store.user.social == 'fb') {
            FB.logout(() => {});
        }
    }
    store.user = null;
    localStorage.removeItem('authToken');
    document.cookie = 'authToken=;expires=-1';


    return new Promise((resolve, reject) => {
        api.post('/logout/').then((response: any) => {
            resolve(response.data);
        }).catch((error) => {
            resolve(error);
        })
    });
});

UserAction.registerAsync(UPDATE_USER, (store, data: any) => {
    return new Promise((resolve, reject) => {
        api.patch('/users/me/', data).then((response: any) => {
            store.user = response.data;
            resolve(response.data);
        }).catch((error) => {
            reject(error);
        })
    })
});
