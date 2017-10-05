import {ACTIONS} from './constants';

const initialState: any = {
    loading: false,
    items: [],
    section: '',
    cancelSource: null,
    searchString: '',
    nextUrl: '',
};

export default function articleList(state=initialState, action: any) {

    switch(action.type) {
        case (ACTIONS.ITEM_LIST_SET_ITEMS):
            return {...state, items: [...action.items], loading: false};
        case (ACTIONS.ITEM_LIST_SET_LOADING):
            return {...state, items: [], loading: true};
        case (ACTIONS.ITEM_LIST_SET_SEARCH_STRING):
            return {...state, items: [], searchString: action.searchString, loading: true};
        case (ACTIONS.ITEM_LIST_SET_CANCEL_SOURCE):
            return {...state, cancelSource: action.cancelSource};
        case (ACTIONS.ITEM_LIST_SET_SECTION):
            console.log(action.section);
            return {...state, section: action.section};
    }

    return state;
}