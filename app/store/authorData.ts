import {ACTIONS} from './constants';

const initialState: any = {
    loading: false,
    author: null,
    pinnedItems: {},
    cancelSource: null,
    notFound: false,
};

export default function authorData(state=initialState, action: any) {
    switch(action.type) {
        case (ACTIONS.AUTHOR_SET):
            return {...state, author: action.author || null, notFound: false};
        case (ACTIONS.AUTHOR_SET_CANCEL_SOURCE):
            return {...state, cancelSource: action.cancelSource};
        case (ACTIONS.AUTHOR_SET_LOADING):
            return {...state, loading: !!action.loading, cancelSource: action.cancelSource || null, 
                    notFound: false, pinnedItems: []};
        case (ACTIONS.AUTHOR_SET_NOT_FOUND):
            return {...state, notFound: action.notFound, author: null};
        case (ACTIONS.AUTHOR_SET_PINNED_ITEMS):
            let pinnedItems = {...state.pinnedItems};
            pinnedItems[action.nickname] = action.items;
            return {...state, pinnedItems};
    }
    return state;
}