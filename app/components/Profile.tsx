import * as React from 'react';

import {Link, withRouter} from 'react-router';

import '../styles/common.scss';
import '../styles/profile.scss';

import {api} from '../api';
import axios from 'axios';

import Header from './shared/Header';
import ArticlePreview from './shared/ArticlePreview';
import Error from './Error';
import {UserAction, GET_ME, LOGIN, LOGOUT} from "../actions/user/UserAction";
import {NotificationAction, SHOW_NOTIFICATION} from '../actions/shared/NotificationAction';
import ProgressBar from './shared/ProgressBar';

import AuthorList from './shared/AuthorList';
import Loading from './shared/Loading';

import {Captions} from '../constants';
import SocialIcon from './shared/SocialIcon';

import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from '../actions/shared/ModalAction';
import {MediaQuerySerice} from '../services/MediaQueryService';

const VKIcon = require('babel!svg-react!../assets/images/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('babel!svg-react!../assets/images/profile_social_icon_fb.svg?name=FBIcon');
const ConfirmIcon = require('babel!svg-react!../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');
const SubscriptionIcon = require('babel!svg-react!../assets/images/profile_subscription_icon.svg?name=SubscriptionIcon');
const EditIcon = require('babel!svg-react!../assets/images/edit.svg?name=EditIcon');
const CloseIcon = require('babel!svg-react!../assets/images/close.svg?name=CloseIcon');


interface IUserArticlesPropsInterface {
    user: any;
    hidden: boolean;
    location?: any;
    router?: any;
}

interface IUserArticlesStateInterface {
    articles?: any[];
    nextUrl?: string,
    selectedSection?: string;
    showSubsection?: boolean;
    isSelf?: boolean,
    isLoading?: boolean,
    cancelSource?: any,
}

class UserArticlesClass extends React.Component<IUserArticlesPropsInterface, IUserArticlesStateInterface> {

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
        let isSelf: boolean = Boolean(UserAction.getStore().user && (UserAction.getStore().user.id = this.props.user.id));
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
                    <UserAuthors userId={this.props.user.id} subscribedBy={true} />) : null
            }
        </div>)
    }
}


let UserArticles = withRouter(UserArticlesClass);


interface IAuthorsPropsInterface {
    userId: number | string;
    closeSubscribers?: () => {};
    isDesktop?: boolean;
    subscribedBy?: boolean;
}

interface IAuthorsStateInterface {
    items?: any[];
    itemsFiltered?: any[],
    filterString?: string;
}

class UserAuthors extends React.Component<IAuthorsPropsInterface, IAuthorsStateInterface> {

    constructor() {
        super();
        this.state = {items: [], itemsFiltered: [], filterString: ""};
    }


    load() {
        let params: any = this.props.subscribedBy ? {subscribed_by: this.props.userId} : {subscribed_to: this.props.userId};

        api.get('/users/', {params: params}).then((response: any) => {
            let items = this.updateItems(response.data);
            let objectsFiltered = this.updateItems(response.data);
            this.setState({items: items, itemsFiltered: objectsFiltered});
        }).catch((error: any) => { });
    }

    updateItems(items: any[]): any[] {

        return items.map((item: any) => {
            item.userName = (item.first_name + ' ' + item.last_name).toLowerCase();
            return item;
        });
    }

    filterItems(e: any) {
        let filterString = e.target.value.toLowerCase();
        if (filterString == "") {
            this.setState({itemsFiltered: this.updateItems(this.state.items)});
        }
        else {
            let objectsFiltered: any[] = [];

            this.state.items.forEach((item: any, index) => {
                if (item.userName.indexOf(filterString) != -1) objectsFiltered.push(item);
            });

            this.setState({itemsFiltered: objectsFiltered, filterString: filterString});
        }
    }

    close() {
        if (this.props.closeSubscribers) this.props.closeSubscribers();
        ModalAction.do(CLOSE_MODAL, null);
    }

    componentDidMount() {
        this.load();

        MediaQuerySerice.listen((isDesktop: boolean) => {
            if (isDesktop) {
                ModalAction.do(CLOSE_MODAL, null);
            }
        });
    }

    render() {
        return (
            <div className="profile__subscribers">
                {
                    this.props.closeSubscribers ? (<div onClick={this.close.bind(this)} className="close"><CloseIcon /></div>) : null
                }

                <div className="filter_input">
                    <input onChange={this.filterItems.bind(this)} type="text" placeholder={Captions.management.fastSearch} />
                </div>

                <AuthorList items={this.state.itemsFiltered} showInfo={true} />


            </div>)
    }
}

interface IProfileState {
    user?: any;
    error?: any;
    isSelf?: boolean;
    isDesktop?: boolean;
    showSubscribers?: boolean;
}

export default class Profile extends React.Component<any, IProfileState> {


    constructor(props: any) {
        super(props);
        this.state = {user: null, error: null, isSelf: false, showSubscribers: true, isDesktop: MediaQuerySerice.getIsDesktop()};
        this.checkIsSelf = this.checkIsSelf.bind(this);
        this.checkDesktop = this.checkDesktop.bind(this);
    }

    checkIsSelf() {
        let isSelf: boolean =  Boolean(this.state.user && UserAction.getStore().user && UserAction.getStore().user.id == this.state.user.id);
        if (isSelf != this.state.isSelf) {
            this.setState({ isSelf: isSelf });
        }
    }

    getUserData(userId: string) {
        this.setState({error: null}, () => {
            api.get('/users/' + userId + '/').then((response: any) => {
                this.setState({
                    user: response.data,
                    showSubscribers: false,
                    isSelf: Boolean(response.data && UserAction.getStore().user && UserAction.getStore().user.id == response.data.id)

                }, () => {
                    // this.checkIsSelf();

                });
            }).catch((error) => {
                this.setState({error: <Error code={404} msg="page not found" /> });
            });
        });
    }

    subscribe() {

        api.post('/users/' + this.state.user.id + '/subscribe/').then((response) => {
            this.setIsSubscribed(true);
        }).catch((error: any) => {});
    }

    unSubscribe() {
        api.post('/users/' + this.state.user.id + '/un_subscribe/').then((response) => {
            this.setIsSubscribed(false);
        }).catch((error: any) => {})
    }

    closeSubscribers() {
        this.setState({showSubscribers: false});
    }

    showSubscribers() {
        if (this.state.isDesktop) {
            this.setState({showSubscribers: true});
        }
        else {
            ModalAction.do(OPEN_MODAL, {content: <UserAuthors userId={this.state.user.id} closeSubscribers={this.closeSubscribers.bind(this)} />});
        }
    }

    createArticle() {
        api.post('/articles/editor/').then((response: any) => {
            this.props.router.push('/articles/' + response.data.id + '/edit/');
        }).catch((error) => {});
    }

    setIsSubscribed(is_subscribed: boolean) {
        let user = this.state.user;
        user.is_subscribed = is_subscribed;
        user.subscribers += is_subscribed ? 1: -1;
        if (user.subscribers < 0) user.subscribers = 0;
        this.setState({user: user});
    }

    componentWillReceiveProps(nextProps: any) {
        this.getUserData(nextProps.params.userId);
    }

    checkDesktop(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop, showSubscribers: false});
        }
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.checkDesktop);

        this.getUserData(this.props.params.userId);
        UserAction.onChange(GET_ME, this.checkIsSelf);
        UserAction.onChange(LOGIN, this.checkIsSelf);
        UserAction.onChange(LOGOUT, this.checkIsSelf);
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.checkIsSelf);
        UserAction.unbind(LOGIN, this.checkIsSelf);
        UserAction.unbind(LOGOUT, this.checkIsSelf);

        MediaQuerySerice.unbind(this.checkDesktop);
    }

    render() {
        if (this.state && this.state.error) {
            return (this.state.error);
        }
        if (!this.state.user) return null;
        return (

            <div className="profile">

                 <div id="profile_content">
                     <div className="profile_content_main">
                         <div className="profile__avatar" key="avatar">
                             { this.state.user.avatar ? (<img src={this.state.user.avatar}/>) : (
                                 <div className="profile__avatar_dummy"></div>) }

                         </div>

                         <div key="username" className="profile__username">
                                <span>{this.state.user.first_name}</span> <span> {this.state.user.last_name}</span>
                         </div>

                         {
                             this.state.user.social_links.length ? (
                                 <div className="profile__social_links">

                                     <div className="profile__social_links_list">
                                         { this.state.user.social_links.map((social_link: any, index: number) => {
                                             return (
                                                 <div className="profile__social_icon" key={index}>
                                                     <Link to={social_link.url} target="_blank" >
                                                         <SocialIcon social={social_link.social} />
                                                     </Link>
                                                </div>)
                                         }) }
                                     </div>

                                 </div>
                             ) : null
                         }

                         <div key="subscription" className="profile__subscription">
                             <div className="profile__subscription_info sub_icon" onClick={this.showSubscribers.bind(this)}>
                                 <SubscriptionIcon />
                                 <span>{ this.state.isSelf ? Captions.profile.subscribersOwnProfile : Captions.profile.subscribers }</span>
                                 <span>{ this.state.user.subscribers }</span>
                             </div>

                             {
                                 (!this.state.isSelf && this.state.user) ?
                                     <div>
                                         { this.state.user.is_subscribed ?
                                             <div className="profile__subscription_info profile__subscription_unsubscribe" onClick={this.unSubscribe.bind(this)}>
                                                 <ConfirmIcon />
                                                 <span>{Captions.profile.subscribed}</span>
                                             </div> :
                                             <div className="profile__subscription_info profile__subscription_subscribe" onClick={this.subscribe.bind(this)}>
                                                 <span>{Captions.profile.subscribe}</span>
                                             </div> }
                                     </div> : null
                             }
                         </div>

                         {
                             this.state.isSelf && this.state.isDesktop ? (<div className="profile__subscription">
                                 <Link to="/articles/new">
                                     <div className="profile__subscription_info">
                                         <EditIcon />
                                         <span>{ Captions.profile.newArticle }</span>
                                     </div>
                                 </Link>
                             </div>) : null
                         }
                     </div>
                     <div className="profile_content_filler"></div>

                     {
                         (this.state.isDesktop && this.state.showSubscribers) ? (
                             <div className="profile__articles">
                             <UserAuthors isDesktop={this.state.isDesktop} userId={this.state.user.id} closeSubscribers={this.closeSubscribers.bind(this)} /></div>
                         ) : null
                     }

                     <UserArticles hidden={this.state.isDesktop && this.state.showSubscribers} user={this.state.user}  key="articles" />


                 </div>
             </div>
        )
    }
}