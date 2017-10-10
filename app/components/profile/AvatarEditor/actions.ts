import {ACTIONS} from '../../../store/constants';
import {api} from '../../../api';


export function setAvatarUrl(url: string) {
    return { type: ACTIONS.USER_SET_AVATAR_URL, avatarUrl: url }
}

export function uploadAvatar(formData: FormData) {
    return (dispatch: any) => {
        dispatch({type: ACTIONS.USER_SET_AVATAR_LOADING});
        api.patch('/users/me/', formData).then((response) => {
            dispatch({type: ACTIONS.USER_SET_AVATAR, avatar: response.data.avatar});
        }).catch(() => {});
    }
}