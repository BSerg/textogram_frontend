import * as React from 'react';

import axios from 'axios';
import {Link} from 'react-router';
import {api} from '../../api';
import '../../styles/profile/profile_authors.scss';
import Loading from '../shared/Loading';

import {MenuAction, TOGGLE} from '../../actions/MenuAction';

const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');
const ConfirmIcon = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');


interface ISubscribersProps {
    userId: number | string;
    subscribedTo: boolean;
    isDesktop: boolean;
    closeCallback?: () => void;
}

interface ISubscribersState {

    items?: any[];
    searchString?: string;
    nextUrl?: string;
    cancelSource?: any;
    isLoading?: boolean;
    menuOpen?: boolean;
}

export default class ProfileAuthorList extends React.Component<ISubscribersProps, ISubscribersState> {

    refs: {
        main: HTMLDivElement;
        input: HTMLDivElement;
    };

    constructor() {
        super();
        this.state = {searchString: "", nextUrl: null, cancelSource: null, items: [], isLoading: false, menuOpen: MenuAction.getStore().open};
        this.setMenuOpen = this.setMenuOpen.bind(this);
        this.setInputPosition = this.setInputPosition.bind(this);
    }

    loadItems(more: boolean = false) {
        let items: any[] = more ? this.state.items : [];

        if (this.state.cancelSource) {
            this.state.cancelSource.cancel();
        }

        let CancelToken = axios.CancelToken;
        this.state.cancelSource = CancelToken.source();

        this.setState({items: items, isLoading: true}, () => {
            let requestParams: any = {};

            let apiUrl: string = more ? this.state.nextUrl : '/users/';
            if (!more) {
                requestParams = this.props.subscribedTo ? {subscribed_to: this.props.userId} : {subscribed_by: this.props.userId};
                requestParams.search_string = this.state.searchString;
            }

            api.get(apiUrl, {cancelToken: this.state.cancelSource.token, params: requestParams}).then((response: any) => {
                let results = response.data.results || [];
                results.forEach((r: any) => {
                        r.isNew = true;
                    });
                    items = items.concat(results);
                    this.setState({items: items, nextUrl: response.data.next, isLoading: false});
            }).catch((error) => {
                if (!axios.isCancel(error)) {
                    this.setState({isLoading: false});
                }
            });
        });
    }

    setSearchString(e: any) {
        this.setState({ searchString: e.target.value }, () => {
            this.loadItems();
        })
    }

    handleScroll(e: any) {
        let rect: ClientRect = this.refs.main.getBoundingClientRect();
        if ((rect.bottom <= window.innerHeight) && !this.state.isLoading && this.state.nextUrl) {
            this.loadItems(true);
        }
    }

    setInputPosition() {
        let rect: ClientRect = this.refs.main.getBoundingClientRect();
        this.refs.input.style.left = rect.left + 'px';
        this.refs.input.style.width = rect.width + 'px';
    }

    setMenuOpen() {
        this.setState({menuOpen: MenuAction.getStore().open});
    }

    componentWillReceiveProps(nextProps: any) {
        this.loadItems();
    }

    componentDidMount() {
        MenuAction.onChange([TOGGLE], this.setMenuOpen);
        this.loadItems();
        this.setInputPosition();
        window.addEventListener('resize', this.setInputPosition);
    }

    componentWillUnmount() {
        MenuAction.unbind([TOGGLE], this.setMenuOpen);
        if (this.state.cancelSource) {
            this.state.cancelSource.cancel();
        }
        window.removeEventListener('resize', this.setInputPosition);
    }

    render() {

        return (
            <div className={"profile_additional profile_authors" + (this.state.menuOpen ? " adjusted" : "")} ref="main">

                {
                    this.state.items.map((item: any, index: number) => {
                        return (
                            <Link to={'/' + item.nickname } key={index} className="profile_author">
                                <div className="author_avatar"><img src={item.avatar} /></div>
                                <div className="author_username">{ item.first_name + " " + item.last_name }</div>
                                <div>{"Читатют " + item.subscribers }</div>
                                <div>{"Текстов " + item.number_of_articles }</div>
                                <div className="info">{ item.is_subscribed ? <ConfirmIcon /> : null }</div>
                            </Link>)
                    })
                }

                {
                    this.state.isLoading ? (<Loading />) : null
                }

                <div className="profile_authors_input" ref="input">
                    <input type="text" value={this.state.searchString} placeholder="Быстрый поиск по имени"
                           onChange={this.setSearchString.bind(this)}/>
                </div>


            </div>)
    }
}
