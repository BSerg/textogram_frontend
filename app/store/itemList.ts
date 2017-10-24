import {ACTIONS} from './constants';

const initialState: any = {
    loading: false,
    items: [],
    apiUrl: '',
    requestParams: {},
    cancelSource: null,
    searchString: '',
    nextUrl: '',
};

export default function articleList(state=initialState, action: any) {
    switch(action.type) {
        case (ACTIONS.ITEM_LIST_SET_ITEMS):
            return {...state, items: [...action.items], loading: false, nextUrl: action.nextUrl || ''};
        case (ACTIONS.ITEM_LIST_SET_LOADING):
            return {...state, items: [], loading: true};
        case (ACTIONS.ITEM_LIST_SET_SEARCH_STRING):
            return {...state, items: [], searchString: action.searchString, loading: true};
        case (ACTIONS.ITEM_LIST_SET_CANCEL_SOURCE):
            return {...state, cancelSource: action.cancelSource, loading: true};
        case (ACTIONS.ITEM_LIST_SET_API_SETTINGS):
            return {...state, apiUrl: action.apiUrl, requestParams: action.requestParams, 
                    items: []};
    }


    return state;
}