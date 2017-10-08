import {api} from '../../../api';
import {ACTIONS} from '../../../store/constants';

export function saveUserData(formData: FormData) {
    return (dispatch: any) => {
        api.patch('/users/me/', formData).then((response) =>{
            dispatch({type: ACTIONS.USER_SET, user: response.data });
        }).catch((err) =>{});
    }
}