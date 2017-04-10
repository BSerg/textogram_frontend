import * as React from 'react';

import axios from 'axios';
import {Link} from 'react-router';
import {api} from '../../api';
import '../../styles/profile/profile_authors.scss';
import Loading from '../shared/Loading';

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
}

export default class ProfileAuthorList extends React.Component<ISubscribersProps, ISubscribersState> {

    constructor() {
        super();
        this.state = {searchString: "", nextUrl: null, cancelSource: null, items: [], isLoading: false};
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

    componentWillReceiveProps(nextProps: any) {
        this.loadItems();
    }

    componentDidMount() {
        this.loadItems();
    }

    componentWillUnmount() {
        if (this.state.cancelSource) {
            this.state.cancelSource.cancel();
        }
    }

    render() {

        console.log(this.state.items);

        return (
            <div className="profile_authors">

                { this.props.closeCallback ? (<div onClick={this.props.closeCallback} className="profile_authors_close">
                    <CloseIcon />
                </div>) : null }

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

                {
                    this.state.isLoading ? (<Loading />) : null
                }

                <input type="text" value={this.state.searchString} placeholder="search"
                       onChange={this.setSearchString.bind(this)}/>

            </div>)
    }
}
