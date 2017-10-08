import {api} from '../../api';
import {ACTIONS} from '../constants';
import * as cookie from 'js-cookie';

const initialUserState: any = {
    loading: false,
    error: false,
    user: null,
};

const initialEditState: any = {
    avatarUploading: false,
    avatarUrl: null,
    nicknameData: {
        saving: false,
    }
};

const initialState: any = { ...initialUserState, ...initialEditState};

export const getUser = () => {
    return (dispatch: (f: any) => any) => {
        let jwt = cookie.get('jwt');
        if (jwt) {
            dispatch({type: ACTIONS.USER_LOADING});
            api.get(`/users/me/`).then((response: any) => {
                dispatch({type: ACTIONS.USER_SET, user: response.data});
            }).catch((err) => { dispatch({type: ACTIONS.USER_ERROR}); });
        }
        else {
            dispatch({type: ACTIONS.USER_ERROR});
        }
        
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
        case (ACTIONS.USER_SET_AVATAR):
            let user = {...state.user, avatar: action.avatar};
            return {...state, user, avatarUploading: false};
        case (ACTIONS.USER_SET_AVATAR_LOADING):
            return {...state, avatarUploading: true};
        case (ACTIONS.USER_SET_NICKNAME_DATA):
            return {...state, nicknameData: {...action.nicknameData}}
        case (ACTIONS.USER_SET_AVATAR_URL):
            
            return {...state, avatarUrl: action.avatarUrl};
        default:
            return state;
    }

}