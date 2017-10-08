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