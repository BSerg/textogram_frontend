import * as React from 'react';
import Action from './Action';
import {api} from '../api';

export const CHECK = 'check';


class NotificationActionClass extends Action {
    constructor() {
        super({ count: 0, last: null })
    }

}

export const NotificationAction = new NotificationActionClass();

NotificationAction.registerAsync(CHECK, (store, data) => {
    return new Promise((resolve, reject) => {
        api.get('/notifications/check_new/').then((response: any) => {
            if (store.count != response.data.count || store.last != response.data.last) {

                if (store.count == response.data.count && store.last && response.data.last && store.last.id == response.data.last.id)
                    return;

                store.count = response.data.count;
                store.last = response.data.last;

                console.log(store);
                resolve(response.data);
            }
        }).catch((error: any) => {});
    });

});

