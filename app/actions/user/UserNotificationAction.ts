import * as React from 'react';
import Action from '../Action';
import {api} from '../../api';
import {UserAction} from "./UserAction";

export const CHECK_NOTIFICATIONS = 'check';
export const DECREASE_NOTIFICATIONS_NUMBER = 'decrease';


class UserNotificationActionClass extends Action {
    constructor() {
        super({ count: 0, last: null })
    }

}

export const UserNotificationAction = new UserNotificationActionClass();

UserNotificationAction.register(DECREASE_NOTIFICATIONS_NUMBER, (store, data: any) => {
    if (store.count) {
        store.count--;
        store.count = store.count < 0 ? 0 : store.count;
    }
});


UserNotificationAction.registerAsync(CHECK_NOTIFICATIONS, (store, data) => {
    return new Promise((resolve, reject) => {
        if (UserAction.getStore().user) {
            api.get('/notifications/check_new/').then((response: any) => {
                if (store.count != response.data.count || store.last != response.data.last) {

                    if (store.count == response.data.count && store.last && response.data.last && store.last.id == response.data.last.id)
                        return;

                    store.count = response.data.count;
                    store.last = response.data.last;
                    resolve(response.data);
                }
            }).catch((error: any) => {});
        }
        else {
            resolve({});
        }
    });

});

