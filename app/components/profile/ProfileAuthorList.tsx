import * as React from 'react';

import axios from 'axios';
import {Link} from 'react-router';
import {api} from '../../api';
import '../../styles/profile/profile_authors.scss';
import Loading from '../shared/Loading';

import {MenuAction, TOGGLE} from '../../actions/MenuAction';

const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');


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
        container: HTMLDivElement;
    };

    constructor() {
        super();
        this.state = {searchString: "", nextUrl: null, cancelSource: null, items: [], isLoading: false, menuOpen: MenuAction.getStore().open};
        this.setMenuOpen = this.setMenuOpen.bind(this);
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
        let rect: ClientRect = this.refs.container.getBoundingClientRect();
        if ((rect.height + this.refs.container.scrollTop) >= this.refs.container.scrollHeight && (this.state.nextUrl && !this.state.isLoading)) {
            // console.log('LooD');
            this.loadItems(true);
        }
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
    }

    componentWillUnmount() {
        MenuAction.unbind([TOGGLE], this.setMenuOpen);
        if (this.state.cancelSource) {
            this.state.cancelSource.cancel();
        }
    }

    render() {

        // console.log(this.state.items);

        return (
            <div className={"profile_additional profile_authors" + (this.state.menuOpen ? " adjusted" : "")}>

                { this.props.closeCallback ? (<div onClick={this.props.closeCallback} className="profile_additional_close">
                    <CloseIcon />
                </div>) : null }

                <div className="profile_additional_container" onScroll={this.handleScroll.bind(this)} ref="container">
                    {
                        this.state.items.map((item: any, index: number) => {
                            return (
                                <Link to={'/profile/' + item.id + '/'} key={index} className="profile_author">
                                    <div className="author_avatar"><img src={item.avatar} /></div>
                                    <div className="author_username">{ item.first_name + " " + item.last_name }</div>
                                    <div>{ item.number_of_articles }</div>
                                    <div>{ item.is_subscribed ? 'd' : 'n' }</div>

                                </Link>)
                        })
                    }
                </div>
                {
                    this.state.isLoading ? (<Loading />) : null
                }

                <div className="profile_authors_input">
                    <input type="text" value={this.state.searchString} placeholder="Быстрый поиск по имени"
                           onChange={this.setSearchString.bind(this)}/>
                </div>


            </div>)
    }
}
