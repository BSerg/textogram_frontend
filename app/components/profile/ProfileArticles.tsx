import * as React from 'react';

import axios from 'axios';
import {api} from '../../api';
import ArticlePreview from '../shared/ArticlePreview';
import Loading from '../shared/Loading';

interface IArticlesProps {
    userId?: number;
    section: string;
    isSelf?: boolean;
}

interface IArticlesState {
    userId?: number;
    section?: string;
    isSelf?: boolean;
    items?: any[];
    nextUrl?: string;
    isLoading?: boolean;
    cancelSource?: any;
    searchString?: string;
    searchTimeout?: number;
}

export default class ProfileArticles extends React.Component<IArticlesProps, IArticlesState> {

    SECTION_FEED: string = 'feed';
    SECTION_ARTICLES: string = 'articles';
    SECTION_DRAFTS = 'drafts';

    refs: {
        main: HTMLDivElement;
        search: HTMLInputElement;
    };

    constructor() {
        super();
        this.state = { items: [], nextUrl: null,  isLoading: false, cancelSource: null, searchString: ''};

        this.handleScroll = this.handleScroll.bind(this);
    }

    loadArticles(more: boolean = false) {

        let items: any[] = more ? this.state.items : [];

        this.state.cancelSource && this.state.cancelSource.cancel();
        let CancelToken = axios.CancelToken;
        this.state.cancelSource = CancelToken.source();

        this.setState({items: items, isLoading: true}, () => {

            let apiUrl = more ? this.state.nextUrl : '/articles/';
            let requestParams: any = {};
            if (!more) {
                if (this.state.section == this.SECTION_ARTICLES) {
                    requestParams.user = this.state.userId;
                }
                else if (this.state.section == this.SECTION_DRAFTS) {
                    requestParams.drafts = true;
                }
                else if (this.state.section == this.SECTION_FEED) {
                    requestParams.feed = true;
                }

                requestParams.search = this.state.searchString;
            }

            api.get(apiUrl, {cancelToken: this.state.cancelSource.token, params: requestParams}).then((response: any) => {
                let results: any = response.data.results || [];
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

    searchInput(e: any) {
        this.state.searchTimeout && window.clearTimeout(this.state.searchTimeout);
        this.state.cancelSource && this.state.cancelSource.cancel();
        this.setState({searchString: e.target.value, items: [], isLoading: true}, () => {
            this.state.searchTimeout = window.setTimeout(this.loadArticles.bind(this), 500);

        })
    }

    handleScroll() {
        let rect: ClientRect = this.refs.main.getBoundingClientRect();
        if ((rect.bottom <= window.innerHeight) && !this.state.isLoading && this.state.nextUrl) {
            this.loadArticles(true);
        }
    }

    componentWillReceiveProps(nextProps: IArticlesProps) {

        if (nextProps.userId != this.state.userId || nextProps.section != this.state.section || nextProps.isSelf != this.state.isSelf) {

            this.state.searchTimeout && window.clearTimeout(this.state.searchTimeout);
            this.state.cancelSource && this.state.cancelSource.cancel();

            this.setState({ userId: nextProps.userId, searchString: '', section: nextProps.section, isSelf: nextProps.isSelf }, () => {
                this.refs.search.focus();
                this.loadArticles();
            });
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        this.refs.search.focus();
        this.setState({ userId: this.props.userId, section: this.props.section, isSelf: this.props.isSelf }, () => { this.loadArticles(); });
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        this.state.cancelSource && this.state.cancelSource.cancel();
        this.state.searchTimeout && window.clearTimeout(this.state.searchTimeout);
    }

    render() {

        let isFeed = this.state.section == this.SECTION_FEED;
        let isOwner = this.state.section == this.SECTION_DRAFTS || (this.state.isSelf && (this.state.section == this.SECTION_ARTICLES));
        return (
            <div className={"profile__articles" + (this.props.section == this.SECTION_DRAFTS ? ' drafts' : '') }
                 ref="main">

                <div className="profile__articles__search" >
                    <input ref="search" value={this.state.searchString} placeholder="Поиск" onChange={this.searchInput.bind(this)}  />
                </div>

                { this.state.items.map((item: any, index: number) => {
                    return (<ArticlePreview isFeed={isFeed} key={index} item={item} isOwner={isOwner}
                                                index={index} />)

                }) }
                {
                    this.state.isLoading ? (<Loading />) : null
                }
            </div>);
    }
}