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

    loadDrafts() {
        api.get('/drafts/').then((response: any) => {
            console.log(response.data);
        }).catch((error) => {})
    }

    setUser() {
        let user = UserAction.getStore().user;
        console.log(user);
        if (user) {
            if (!this.state.user || (this.state.user && (this.state.user.id != user.id))) {
                console.log('set state');
                this.setState({user: user}, () => {this.loadDrafts()});
            }
        }
        else {
            this.setState({user: null, items: []});
        }
    }

    componentDidMount() {
        this.setUser();
        UserAction.onChange(GET_ME, this.setUser);
        UserAction.onChange(LOGIN, this.setUser);
        UserAction.onChange(LOGOUT, this.setUser);
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.setUser);
        UserAction.unbind(LOGIN, this.setUser);
        UserAction.unbind(LOGOUT, this.setUser);
    }

    render() {
        return (
            <div id="drafts">
                <Header>{Captions.management.drafts}</Header>

                <div className="drafts__content">
                    {
                        this.state.items.map((item, index) => {
                            return (<ArticlePreview item={item} key={index} />);
                        })
                    }
                </div>
            </div>)
    }

}