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
    nameEdit: false,
    descriptionEdit: false,
    newName: '',
    newDescription: '',
    saveTimeout: null,
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

export const editData = (type: string, value: any) => {
    return (dispatch: any, getState: any) => {
        
    }
}


export const toggleEdit = (type: string, edit: boolean) => {
    return (dispatch: any, getState: any) => {
        let user = getState().userData.user;
        // console.log(getState);
        console.log(type);
        if (type == 'name') {
            dispatch({type: ACTIONS.USER_SET_EDIT, data: {
                newName: `${user.first_name} ${user.last_name}`,
                nameEdit: !!edit
            }});
        }
        else if (type == 'description') {
            dispatch({ type: ACTIONS.USER_SET_EDIT, data: {descriptionEdit: edit, newDescription: user.description || ''}  });
        }
    }
}


// export const patchUser


export default function userData(state: any=initialState, action: any) {
    switch(action.type) {
        case (ACTIONS.USER_LOADING):
            return {...state, loading: true, user: null};
        case (ACTIONS.USER_ERROR):
            return {...state, loading: false, user: null, error: true};
        case (ACTIONS.USER_SET):
            return {...state, loading: false, user: action.user, error: false};
        case (ACTIONS.USER_SET_EDIT):
            return {...state, ...initialEditState, ...action.data};
        default:
            return state;
    }

}