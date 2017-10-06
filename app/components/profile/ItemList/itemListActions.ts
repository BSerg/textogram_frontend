import {ACTIONS} from '../../../store/constants';
import {api} from '../../../api';
import axios from 'axios';

export function setLoading() {
    return (dispatch: any, getState: any) => {
        if(!getState().itemList.loading) {
            dispatch({type: ACTIONS.ITEM_LIST_SET_LOADING});
        }
        
    }
}

export function setApiSettings(newUrl: string, newParams: any) {
    return (dispatch: any, getState: () => any) => {
        if (!newUrl) {
            return;
        }
        let {apiUrl, requestParams, cancelSource} = getState().itemList;
        if (apiUrl === newUrl && requestParams === newParams) {
            return;
        }


        dispatch({type: ACTIONS.ITEM_LIST_SET_API_SETTINGS, apiUrl: newUrl, requestParams: newParams});
        dispatch(getItems(newUrl, newParams));

    }
}




export function getItems(apiUrl: string, requestParams: any, items: any[] = []) {
    return (dispatch: any, getState: any) => {
        let {cancelSource} = getState().itemList;
        cancelSource && cancelSource.cancel();

        let newCancelSource = axios.CancelToken.source();
        dispatch({type: ACTIONS.ITEM_LIST_SET_CANCEL_SOURCE, cancelSource: newCancelSource});

        api.get(apiUrl, { cancelToken: newCancelSource.token, params: requestParams }).then((response: any) => {
            try {
                let results: any = (response.data.results || []).map((r: any) => {
                    let res = typeof r == 'string' ? JSON.parse(r) : r;
                    try {
                        res.isNew = true;
                        return res;
                    }
                    catch (error) {}
                });
                items = items.concat(results);
                dispatch({type: ACTIONS.ITEM_LIST_SET_ITEMS, items});
            }
            catch (error) {
                dispatch({type: ACTIONS.ITEM_LIST_SET_ITEMS, items});
            }
        }).catch((err) => {
            dispatch({type: ACTIONS.ITEM_LIST_SET_ITEMS, items});
        })
        
    }
}