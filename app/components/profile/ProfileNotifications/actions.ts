import {api} from '../../../api';
import {ACTIONS} from '../../../store/constants';

export function readNotification(id: any)    {
    return (dispatch: any, getState: any) => {
        let notificationState = {...getState().userNotifications};
        api.patch('/notifications/' + id + '/', {is_read: true}).then((response) => {
            if (notificationState.count > 0) {
                notificationState.count--;
                dispatch({type: ACTIONS.USER_NOTIFICATIONS_SET, data: notificationState});
            }
        }).catch((err) => {})
    }
}