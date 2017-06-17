import * as React from 'react';

import axios from 'axios';
import {api} from '../../api';
import ArticlePreview from '../shared/ArticlePreview';
import ArticlePreviewStatistics from '../shared/ArticlePreviewStatistics';
import Loading from '../shared/Loading';

interface IArticlesProps {
    userId?: number;
    section: string;
    isSelf?: boolean;
    dataCallback?: (data: any) => any;
}

interface IArticlesState {
    userId?: number;
    section?: string;
    isSelf?: boolean;
    items?: any[];
    nextUrl?: string;
    isLoading?: boolean;
    // cancelSource?: any;
    searchString?: string;
    // searchTimeout?: number;
}

export default class ProfileArticles extends React.Component<IArticlesProps, IArticlesState> {

    SECTION_FEED: string = 'feed';
    SECTION_ARTICLES: string = 'articles';
    SECTION_DRAFTS = 'drafts';
    SECTION_STATISTICS = 'statistics';
    SECTION_PAYWALL = 'paywall';

    cancelSource: any;
    searchTimeout: number;

    refs: {
        main: HTMLDivElement;
        search: HTMLInputElement;
    };

    constructor() {
        super();
        this.state = { items: [], nextUrl: null,  isLoading: false, searchString: ''};

        this.handleScroll = this.handleScroll.bind(this);
    }

    getApiUrl(searchString: string = ''): string {
        let url: string;

        if (searchString) {
            switch (this.props.section) {
                case (this.SECTION_STATISTICS):
                    url = '/statistics/articles/search/';
                    break;
                default:
                    url = '/articles/search/';
            }
        }
        else {
            switch (this.props.section) {
                case (this.SECTION_STATISTICS):
                    url = '/statistics/articles';
                    break;
                default:
                    url = '/articles/';
            }
        }
        return url;
    }

    loadArticles(more: boolean = false) {
        if (process.env.USE_CACHE_API && this.props.section == this.SECTION_ARTICLES) {
            return this._loadArticlesCache(more);
        }
        return this._loadArticles(more);
        // return this._loadArticles;
    }

    _loadArticles(more: boolean = false) {

        let items: any[] = more ? this.state.items : [];

        this.cancelSource && this.cancelSource.cancel();
        let CancelToken = axios.CancelToken;
        this.cancelSource = CancelToken.source();

        this.setState({items: items, isLoading: true}, () => {

            let apiUrl = more ? this.state.nextUrl : this.getApiUrl(this.state.searchString);
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
                if (this.state.searchString) {
                    requestParams.q = this.state.searchString;
                }


            }

            api.get(apiUrl, {cancelToken: this.cancelSource.token, params: requestParams}).then((response: any) => {
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

    _loadArticlesCache(more: boolean = false) {
        this.setState({items: [], isLoading: false});
    }

    searchInput(e: any) {
        this.searchTimeout && window.clearTimeout(this.searchTimeout);
        this.cancelSource && this.cancelSource.cancel();
        this.setState({searchString: e.target.value, items: [], isLoading: true}, () => {
            this.searchTimeout = window.setTimeout(this.loadArticles.bind(this), 500);

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

            this.searchTimeout && window.clearTimeout(this.searchTimeout);
            this.cancelSource && this.cancelSource.cancel();

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
        this.cancelSource && this.cancelSource.cancel();
        this.searchTimeout && window.clearTimeout(this.searchTimeout);
    }

    render() {
        let isFeed = this.state.section == this.SECTION_FEED;
        let isOwner = this.state.section == this.SECTION_DRAFTS || (this.state.isSelf && (this.state.section == this.SECTION_ARTICLES));
        return (
            <div className={"profile__articles" + (this.props.section == this.SECTION_DRAFTS ? ' drafts' : '') }
                 ref="main">

                <div className="profile__search" >
                    <input ref="search" value={this.state.searchString} placeholder="Поиск" onChange={this.searchInput.bind(this)}  />
                </div>

                { this.state.items.map((item: any, index: number) => {
                    return this.props.section == this.SECTION_STATISTICS ?
                        <ArticlePreviewStatistics item={item} key={index}/> :
                        <ArticlePreview isFeed={isFeed} key={index} item={item} isOwner={isOwner} index={index} />

                }) }
                {
                    this.state.isLoading ? (<Loading />) : null
                }
            </div>);
    }
}