import {ACTIONS} from '../../../store/constants';
import {api} from '../../../api';
import axios from 'axios';

export function checkNickname(n: string) {
    return (dispatch: any, getState: any) => {
        let nicknameData = getState().userData.nicknameData;
        dispatch({type: ACTIONS.USER_SET_NICKNAME_DATA, nicknameData: {...nicknameData, checking: true  }});

    }   
}

export function saveNickname(nickname: string) {
    return (dispatch: any, getState: any) => {
        let nicknameData = getState().userData.nicknameData;
        dispatch({type: ACTIONS.USER_SET_NICKNAME_DATA, nicknameData: {saving: true  }});

        let formData = new FormData();
        formData.append('nickname', nickname);

        api.patch('/users/me/', formData).then((response) =>{
            dispatch({type: ACTIONS.USER_SET, user: response.data });
            dispatch({type: ACTIONS.USER_SET_NICKNAME_DATA, nicknameData: {saving: false }});
        }).catch((err) =>{});

    }   
}

export function addUrl(url: string, social: string) {
    return (dispatch: any, getState: any) => {
        let user = {...getState().userData.user};
        if (!user.id || !user.social_links) {
            return;
        }
        dispatch({type: ACTIONS.USER_SET_SOCIAL_LOADING, social, loading: true});

        api.post('/social_links/', {social,  url}).then((response: any) => {
            user.social_links.push(response.data);
            dispatch({type: ACTIONS.USER_SET, user });
            dispatch({type: ACTIONS.USER_SET_SOCIAL_LOADING, social, loading: false});
        }).catch((error) => {
            dispatch({type: ACTIONS.USER_SET_SOCIAL_LOADING, social, loading: false});
        });


    }
}

export function deleteUrl(id: string|number, social: string) {
    return (dispatch: any, getState: any) => {
        let user = {...getState().userData.user};
        if (!user.id || !user.social_links) {
            return;
        }

        dispatch({type: ACTIONS.USER_SET_SOCIAL_LOADING, social, loading: true});
        let ind = user.social_links.findIndex((val: any) => {
            return val.id === id;
        });
        if (ind === undefined) {
            return;
        }
        api.delete(`/social_links/${id}/`).then((response: any) => {
            user.social_links.splice(ind, 1);
            dispatch({type: ACTIONS.USER_SET, user });
            dispatch({type: ACTIONS.USER_SET_SOCIAL_LOADING, social, loading: false});
        }).catch((err) => {});
        
    }
}