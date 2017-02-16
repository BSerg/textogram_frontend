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
            this.setState({items: response.data}, () => {
                this.forceUpdate();
            });
        }).catch((error) => {})
    }

    setUser() {
        let user = UserAction.getStore().user;
        if (user) {
            if (!this.state.user || (this.state.user && (this.state.user.id != user.id))) {
                this.setState({user: user}, () => {this.loadDrafts()});
            }
        }
        else {
            this.setState({user: null, items: []});
        }
    }

    deleteArticle(id: number) {
        if (!confirm('delete')) return;
        api.post('/drafts/' + id + '/delete/').then((response: any) => {
            let indexToRemove;
            this.state.items.forEach((item, index) => {
                if (item.id == id) indexToRemove = index;
            });
            if (indexToRemove != undefined) {
                let items = this.state.items;
                items.splice(indexToRemove, 1);
                this.setState({items: items});
            }
        }).catch((error) => {})
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
                    { this.state.items.map((article, i) => {
                        return <ArticlePreview key={article.id} isFeed={false} item={article} isOwner={true} />
                    }) }
                </div>
            </div>)
    }

}