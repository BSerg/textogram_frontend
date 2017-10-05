import {ACTIONS} from './constants';

const initialState: any = {
    loading: false,
    author: null,
    cancelSource: null,
    notFound: false,
};

export default function authorData(state=initialState, action: any) {
    switch(action.type) {
        case (ACTIONS.AUTHOR_SET):
            return {...state, author: action.author, notFound: false};
        case (ACTIONS.AUTHOR_SET_CANCEL_SOURCE):
            return {...state, cancelSource: action.cancelSource};
        case (ACTIONS.AUTHOR_SET_LOADING):
            return {...state, loading: action.loading, notFound: false};
        case (ACTIONS.AUTHOR_SET_NOT_FOUND):
            return {...state, notFound: action.notFound, author: null};
    }
    return state;
}