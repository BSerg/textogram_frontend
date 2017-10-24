import {ACTIONS} from '../../../store/constants';
import {api} from '../../../api';
import axios from 'axios';

function _getNickname(slug: any, userData: any) {
    if (slug === 'feed' || slug === 'drafts') {
        if (!userData.user || !userData.user.nickname) {
            return null;
        }
        else {
            return userData.user.nickname;
        }
    }
    return slug;
} 


export function getAuthor(slug: any) {
    return (dispatch: any, getState: any) => {
        let state = {...getState()};
        let authorState = state.authorData;
        let userData = state.userData;
        let currentNickname = (authorState.author && authorState.author.nickname) || null;
        let nickname = _getNickname(slug, userData);

        // if (!nickname) {
            // dispatch({type: ACTIONS.AUTHOR_SET_NOT_FOUND});
            // return;
        // }
        if (nickname === currentNickname) {
            return;
        }
        authorState.cancelSource && authorState.cancelSource.cancel();
        let cancelSource = axios.CancelToken.source();
        dispatch({type: ACTIONS.AUTHOR_SET_LOADING, loading: true, cancelSource: cancelSource});
        // dispatch({type: ACTIONS.AUTHOR_SET_CANCEL_SOURCE, });
        api.get(`users/${nickname}`).then((response) => {
            dispatch({type: ACTIONS.AUTHOR_SET, author: response.data});
        }).catch((err) => {
            dispatch({type: ACTIONS.AUTHOR_SET_NOT_FOUND, notFound: true});
        })

    }
}

export function setAuthorNull() {
    return {type: ACTIONS.AUTHOR_SET};
}

export function changeSubscription() {
    return (dispatch: any, getState: any) => {
        console.log('eeee');
        let author = getState().authorData.author;
        let url = `/users/${author.nickname}/${author.is_subscribed ? 'un_' : ''}subscribe/`;
        api.post(url).then((response) => {
            let updatedAuthor = {...author};
            updatedAuthor.is_subscribed = !author.is_subscribed;
            updatedAuthor.subscribers += updatedAuthor.is_subscribed ? 1 : -1;
            dispatch({type: ACTIONS.AUTHOR_SET, author: updatedAuthor});
        }).catch((err) => {})
    }
}

export function subscribe() {

}

export function unSubscribe() {

}