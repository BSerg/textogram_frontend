import {api} from '../../api';
import {ACTIONS} from '../constants';

const initialState: any = {
    loading: false,
    error: false,
    user: null
}

export const getUser = () => {
    return (dispatch: (f: any) => any) => {
        dispatch({type: ACTIONS.USER_LOADING});
        api.get(`/users/me/`).then((response: any) => {
            dispatch({type: ACTIONS.USER_SET, user: response.data});
        }).catch((err) => { dispatch({type: ACTIONS.USER_ERROR}); });
    }
}

export default function userData(state: any=initialState, action: any) {
    switch(action.type) {
        case (ACTIONS.USER_LOADING):
            return {...state, loading: true, user: null};
        case (ACTIONS.USER_ERROR):
            return {...state, loading: false, user: null, error: true};
        case (ACTIONS.USER_SET):
            return {...state, loading: false, user: action.user, error: false};
        default:
            return state;
    }
    // return state;
}