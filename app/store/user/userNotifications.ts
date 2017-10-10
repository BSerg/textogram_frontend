import {api} from '../../api';
import {ACTIONS} from '../constants';

const initialState: any = { count: 0 };


export const getNotifications = () => {

    return (dispatch: (f: any) => any) => {
        api.get('/notifications/check_new/').then((response: any) => {
            let data = {...response.data};
            dispatch({type: ACTIONS.USER_NOTIFICATIONS_SET, data});
        }).catch((err) =>{});
    }
}

export default function userNotifications(state=initialState, action: any) {
    switch(action.type) {
        case (ACTIONS.USER_NOTIFICATIONS_SET):
            return {...action.data};
        default:
            return state;
    }
}