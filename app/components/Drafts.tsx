import * as React from 'react';
import {Captions} from '../constants';
import ArticlePreview from './shared/ArticlePreview';
import Header from './shared/Header';

import {UserAction, LOGIN, GET_ME, LOGOUT, SAVE_USER} from '../actions/user/UserAction';

import {api} from '../api';

interface IDraftsStateInterface {
    user?: any;
    items?: any[];
}

export default class Drafts extends React.Component<any, IDraftsStateInterface> {

    constructor() {
        super();

        this.state = {user: null, items: []};
        this.setUser = this.setUser.bind(this);
    }

    setUser() {

    }

    render() {
        return (
            <div id="drafts">
                <Header>{Captions.management.drafts}</Header>

                <div>
                     drafts
                </div>
            </div>)
    }

}