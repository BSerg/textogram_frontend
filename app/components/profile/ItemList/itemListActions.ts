import {ACTIONS} from '../../../store/constants';
import {api} from '../../../api';
import axios from 'axios';

function getNewApiSettings(props: any, searchString: string) {
    let apiUrl;
    let requestParams: any = {};
    let params = props.match.params;

    if (params.subsection) {
        apiUrl = '/users/';
        let id = (props.author && props.author.id) || '';
        switch(params.subsection) {
            case('following'):
                requestParams['subscribed_by'] = id;
                break;
            case('followers'):
                requestParams['subscribed_to'] = id;
                break;
            default:
                break;
        }
        if (searchString) {
            requestParams['q'] = searchString;
        }
    }
    else if (params.slug && !params.subsection) {
        switch(params.slug) {
            case ('drafts'):
                requestParams['drafts'] = true;
                apiUrl = '/articles/';
                break;
            case ('feed'):
                requestParams['feed'] = true;
                apiUrl = '/_/articles/';
                break;
            default:
                requestParams['user'] = (props.author && props.author.id) || '';
                apiUrl = '/_/articles/';
        }
        if (searchString) {
            apiUrl = `${apiUrl}search/`;
            requestParams['q'] = searchString;
        }
    }
    else if (params.section === 'notifications') {
        apiUrl = `/notifications/`;
    }

    else if (params.section === 'statistics') {
        apiUrl = `/statistics/articles/${searchString ? 'search/' : ''}`;
        requestParams['q'] = searchString;
    }


    return {
        newUrl: apiUrl,
        newParams: requestParams,
    }
}

export function setLoading() {
    return (dispatch: any, getState: any) => {
        if(!getState().itemList.loading) {
            dispatch({type: ACTIONS.ITEM_LIST_SET_LOADING});
        }
        
    }
}

export function setApiSettings(params: any, searchString: string) {
    return (dispatch: any, getState: () => any) => {
        // if (!newUrl) {
            // return;
        // }
        let {newUrl, newParams} = getNewApiSettings(params, searchString);
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

export function getNextItems() {
    return (dispatch: (action: any) => any, getState: () => any) => {
        let {items, nextUrl, loading} = getState().itemList;
        if (!nextUrl || loading) {
            return;
        }
        dispatch(getItems(nextUrl, {}, items));
    }
}


export function getItems(apiUrl: string, requestParams: any, items: any[] = []) {
    return (dispatch: any, getState: any) => {
        let {cancelSource} = getState().itemList;
        cancelSource && cancelSource.cancel();
        let newCancelSource = axios.CancelToken.source();
        dispatch({type: ACTIONS.ITEM_LIST_SET_CANCEL_SOURCE, cancelSource: newCancelSource});
        api.get(apiUrl, { cancelToken: newCancelSource.token, params: requestParams }).then((response: any) => {
            let nextUrl = response.data.next || null;
            try {
                let results: any = (response.data.results || []).map((r: any) => {
                    let res = typeof r == 'string' ? JSON.parse(r) : r;
                    try {
                        res.isNew = true;
                        return res;
                    }
                    catch (error) {}
                });
                let filteredItems = results.filter((obj: any, index: number, arr: any[]) => {
                    return !obj.is_pinned
                });
                let pinnedItems = results.filter((obj: any, index: number, arr: any[]) => {
                    return !!obj.is_pinned
                });
                items = items.concat(filteredItems);
                dispatch({type: ACTIONS.ITEM_LIST_SET_ITEMS, items, nextUrl});
                dispatch(setAuthorPinnedItems(pinnedItems));
            }
            catch (error) {
                dispatch({type: ACTIONS.ITEM_LIST_SET_ITEMS, items});
            }
        }).catch((err) => {
            dispatch({type: ACTIONS.ITEM_LIST_SET_ITEMS, items});
        })
        
    }
}

export function setAuthorPinnedItems(pinnedItems: any[]) {
    return (dispatch: any, getState: any) => {
        let author = getState().authorData.author;
        if (!author || !pinnedItems.length || !pinnedItems[0].owner || pinnedItems[0].owner.id !== author.id ) {
            return;
        }
        dispatch({type: ACTIONS.AUTHOR_SET_PINNED_ITEMS, nickname: author.nickname, items: pinnedItems});
    }
}