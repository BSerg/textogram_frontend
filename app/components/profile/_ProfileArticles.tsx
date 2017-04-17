import * as React from 'react';
import axios from 'axios';
import {api} from '../../api';
import {NotificationAction, SHOW_NOTIFICATION} from '../../actions/shared/NotificationAction';
import {UserAction, GET_ME, LOGIN, LOGOUT} from "../../actions/user/UserAction";
import {Captions} from '../../constants';
import Loading from './../shared/Loading';
import ArticlePreview from '../shared/ArticlePreview';

import ProfileAuthors from './ProfileAuthors';

const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');


import {withRouter} from 'react-router';

interface IProfileArticlesPropsInterface {
    user: any;
    hidden: boolean;
    location?: any;
    router?: any;
}

interface IProfileArticlesStateInterface {
    articles?: any[];
    nextUrl?: string,
    selectedSection?: string;
    showSubsection?: boolean;
    isSelf?: boolean,
    isLoading?: boolean,
    cancelSource?: any,
}

class ProfileArticlesClass extends React.Component<IProfileArticlesPropsInterface, IProfileArticlesStateInterface> {

    SECTION_SUBSCRIPTIONS = 'subscriptions';
    SECTION_ARTICLES = 'articles';

    refs: {
        main: HTMLDivElement;
    };

    constructor() {
        super();
        this.state = {articles: [], selectedSection: this.SECTION_ARTICLES, showSubsection: false, nextUrl: null, isLoading: false,
            cancelSource: null};
        this.setIsSelf = this.setIsSelf.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    loadArticles(more: boolean = false) {
        let articles: any[] = more ? this.state.articles : [];

        if (this.state.cancelSource) {
            this.state.cancelSource.cancel();
        }

        let CancelToken = axios.CancelToken;
        let source: any = CancelToken.source();
        this.state.cancelSource = source;


        this.setState({articles:  articles, isLoading: true}, () => {
            let apiUrl = more ? this.state.nextUrl : '/articles/';
            let requestParams: any = {};
            if (!more) {
                if ((this.state.selectedSection == this.SECTION_ARTICLES) && !this.state.showSubsection ) {
                    requestParams.user = this.props.user.id;
                }
                else if ((this.state.selectedSection == this.SECTION_ARTICLES) && this.state.showSubsection && this.state.isSelf) {
                    requestParams.drafts = true;
                }
                else if (this.state.isSelf && (this.state.selectedSection == this.SECTION_SUBSCRIPTIONS)) {
                    requestParams.feed = true;
                }
            }

            api.get(apiUrl, {cancelToken: source.token, params: requestParams}).then((response: any) => {
                let results: any = response.data.results || [];
                results.forEach((r: any) => {
                    r.isNew = true;
                });
                articles = articles.concat(results);
                this.setState({articles: articles, nextUrl: response.data.next, isLoading: false});
            }).catch((error) => {
                if (!axios.isCancel(error)) {
                    this.setState({isLoading: false});
                }
            });
        });
    }

    deleteArticle(articleId: number|string, index?: number) {

        api.delete('/articles/editor/' + articleId + '/').then((response: any) => {
            let articles: any[] = this.state.articles;
            articles.splice(index, 1);
            this.setState({articles: articles});

            NotificationAction.do(SHOW_NOTIFICATION, {content: 'deleted'});
        }).catch((error: any) => {});
    }

    setSection(sectionName: string) {
        if (sectionName != this.SECTION_ARTICLES && sectionName != this.SECTION_SUBSCRIPTIONS) {
            return;
        }
        if ((sectionName == this.SECTION_SUBSCRIPTIONS)  && !this.state.isSelf) return;
        this.setState({selectedSection: sectionName, showSubsection: false}, () => {this.loadArticles()});
    }

    toggleSubsection() {
        let closeDrafts: boolean = this.state.selectedSection == this.SECTION_ARTICLES
            && this.state.showSubsection && this.props.location.query && this.props.location.query.show == 'drafts';
        this.setState({showSubsection: !this.state.showSubsection}, () => {
            if (closeDrafts) {
                this.props.router.push('/profile/' + this.props.user.id);
            }
            if (!(this.state.selectedSection == this.SECTION_SUBSCRIPTIONS && this.state.showSubsection)) {
                this.loadArticles();
            }
        });
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.user.id != this.props.user.id) {

            let isSelf: boolean = Boolean(UserAction.getStore().user && (UserAction.getStore().user.id == nextProps.user.id));
            this.setState({
                isSelf: isSelf,
                selectedSection: isSelf ? this.SECTION_SUBSCRIPTIONS : this.SECTION_ARTICLES, showSubsection: false}, () => {
                    this.loadArticles();
            });
        }

        if (nextProps.location.query
                && (nextProps.location.query.show != this.props.location.query.show)
                && (nextProps.location.query.show == 'drafts')) {
            this.setState({selectedSection: this.SECTION_ARTICLES, showSubsection: true}, () => { this.loadArticles() });
        }
    }

    setIsSelf() {
        let isSelf: boolean = Boolean(UserAction.getStore().user && (UserAction.getStore().user.id == this.props.user.id));
        if (isSelf != this.state.isSelf) {
            this.setState({isSelf: isSelf, selectedSection: isSelf ? this.SECTION_SUBSCRIPTIONS : this.SECTION_ARTICLES}, () => {
                this.loadArticles();
            });
        }
    }

    handleScroll() {
        let rect: ClientRect = this.refs.main.getBoundingClientRect();
        if ((rect.bottom <= window.innerHeight) && !this.state.isLoading && this.state.nextUrl) {
            this.loadArticles(true);
        }

    }

    componentDidMount() {

        window.addEventListener('scroll', this.handleScroll);

        UserAction.onChange([GET_ME, LOGIN, LOGOUT], this.setIsSelf);

        let stateData: any = {};
        if (UserAction.getStore().user && (UserAction.getStore().user.id == this.props.user.id)) {
            stateData.selectedSection = this.SECTION_SUBSCRIPTIONS;
            stateData.isSelf = true;
        }
        else {
            stateData.isSelf = false;
        }
        if (this.props.location.query.show == 'drafts') {
            stateData.selectedSection = this.SECTION_ARTICLES;
            stateData.showSubsection = true;
        }
        this.setState(stateData, () => { this.loadArticles() });
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        UserAction.unbind([GET_ME, LOGIN, LOGOUT], this.setIsSelf);
        if (this.state.cancelSource) {
            this.state.cancelSource.cancel();
        }
    }

    render() {
        let items: any[] = this.state.articles;

        let switchCaption = "";
        if (this.state.selectedSection == this.SECTION_ARTICLES) {
            switchCaption = this.state.showSubsection ? Captions.profile.switchButtonCloseDrafts : Captions.profile.switchButtonDrafts;
        }
        else if (this.state.selectedSection == this.SECTION_SUBSCRIPTIONS) {
            switchCaption = this.state.showSubsection ? Captions.profile.switchButtonCloseAuthors : Captions.profile.switchButtonAuthors;
        }


        let isFeed = this.state.selectedSection == this.SECTION_SUBSCRIPTIONS;
        let isOwner = this.state.isSelf && (this.state.selectedSection == this.SECTION_ARTICLES);

        return (<div className={"profile__articles" + (this.props.hidden ? " hidden" : "") } ref="main">

            {this.state.isSelf ? (
                <div className="profile__articles__menu">

                    <div onClick={this.setSection.bind(this, this.SECTION_SUBSCRIPTIONS)}  className={(this.state.selectedSection == this.SECTION_SUBSCRIPTIONS && !this.state.showSubsection) ? 'active': null}>
                        {Captions.profile.menuSubscriptions}
                    </div>
                    <div onClick={this.setSection.bind(this, this.SECTION_ARTICLES)} className={(this.state.selectedSection == this.SECTION_ARTICLES && !this.state.showSubsection) ? 'active': null}>
                        {Captions.profile.menuArticles}
                    </div>
                    <div className="profile__articles__menu_switch_button" onClick={this.toggleSubsection.bind(this)}>
                        <span>{ switchCaption }</span>
                        {
                            this.state.showSubsection ? <CloseIcon /> : null
                        }
                    </div>
                </div>) : null
            }

            {
                ((this.state.selectedSection == this.SECTION_ARTICLES) || (this.state.selectedSection == this.SECTION_SUBSCRIPTIONS && !this.state.showSubsection)) ?

                    items.map((article, index) => {
                        return (<ArticlePreview isFeed={isFeed} key={index} item={article} isOwner={isOwner}
                                                onClickDelete={this.deleteArticle.bind(this)} index={index} />)
                    }) : null
            }
            {
                this.state.isLoading ? (<Loading />) : null
            }

            {
                (this.state.selectedSection == this.SECTION_SUBSCRIPTIONS && this.state.showSubsection) ? (
                    <ProfileAuthors userId={this.props.user.id} subscribedBy={true} />) : null
            }
        </div>)
    }
}


let ProfileArticles = withRouter(ProfileArticlesClass);

export default ProfileArticles;