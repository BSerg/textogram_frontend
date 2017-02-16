import * as React from 'react';

import {Link} from 'react-router';

import '../styles/common.scss';
import '../styles/profile.scss';

import {api} from '../api';

import Header from './shared/Header';
import ArticlePreview from './shared/ArticlePreview';
import Error from './Error';
import {UserAction, GET_ME, LOGIN, LOGOUT} from "../actions/user/UserAction";

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
    isSelf: boolean;
    hidden: boolean;
}

interface IUserArticlesStateInterface {
    articles?: any[];
    drafts?: any[];
    feed?: any[];
    selectedSection?: string;
    selectedId?: number|null;
}

class UserArticles extends React.Component<IUserArticlesPropsInterface, IUserArticlesStateInterface> {

    SECTION_SUBSCRIPTIONS = 'subscriptions';
    SECTION_ARTICLES = 'articles';
    SECTION_DRAFTS = 'drafts';


    constructor() {
        super();
        this.state = {articles: [], feed: [], drafts: [], selectedSection: this.SECTION_ARTICLES, selectedId: null};
    }

    loadArticles(userId: string|number, drafts?: boolean) {

        if (drafts) {
            api.get('/drafts/').then((response: any) => {
                this.setState({drafts: this.state.drafts.concat(response.data)});
            }).catch((error) => {})
        }
        else {
            api.get('/articles/', {params: {user: userId}}).then((response: any) => {
                if (userId == 'me') { this.setState(
                    { feed: this.state.feed.concat(response.data.results || []) }
                    );
                }
                else this.setState(
                    { articles: this.state.articles.concat(response.data.results || []) }
                )
            }).catch((error) => {});
        }
    }

    selectArticle(id: number|null) {
        console.log(id);
    }

    setSection(sectionName: string) {
        if (sectionName != this.SECTION_ARTICLES && sectionName != this.SECTION_SUBSCRIPTIONS && sectionName != this.SECTION_DRAFTS) {
            return;
        }
        if ((sectionName == this.SECTION_SUBSCRIPTIONS || sectionName == this.SECTION_DRAFTS)  && !this.props.isSelf) return;
        this.setState({selectedSection: sectionName});
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.user.id != this.props.user.id) {
            this.setState({articles: []}, () => { this.loadArticles(nextProps.user.id) });
        }
        if (nextProps.isSelf && !this.props.isSelf) {
            this.setState({feed: [], drafts: []}, () => {
                this.loadArticles('me') ;
                this.loadArticles(nextProps.user.id, true);
            });
        }
        if (!nextProps.isSelf) { this.setState({feed: [], selectedSection: this.SECTION_ARTICLES}) }
    }

    componentDidMount() {
        this.loadArticles(this.props.user.id);
        if (this.props.isSelf) {
            this.loadArticles('me');
            this.loadArticles(this.props.user.id, true);
        }
    }

    render() {
        let items: any[];
        if (this.state.selectedSection == this.SECTION_SUBSCRIPTIONS) {
            items = this.state.feed;
        }
        else if (this.state.selectedSection == this.SECTION_DRAFTS) {
            items = this.state.drafts;
        }
        else {
            items = this.state.articles;
        }

        let isFeed = this.state.selectedSection == this.SECTION_SUBSCRIPTIONS;

        return (<div className={"profile__articles" + (this.props.hidden ? " hidden" : "") }>

            {this.props.isSelf ? (
                <div className="profile__articles__menu">

                    <div onClick={this.setSection.bind(this, this.SECTION_ARTICLES)} className={(this.state.selectedSection == this.SECTION_ARTICLES) ? 'active': null}>
                        {Captions.profile.menuArticles}
                    </div>
                    <div onClick={this.setSection.bind(this, this.SECTION_DRAFTS)} className={(this.state.selectedSection == this.SECTION_DRAFTS) ? 'active': null}>
                        {Captions.profile.menuDrafts}
                    </div>
                    <div onClick={this.setSection.bind(this, this.SECTION_SUBSCRIPTIONS)}  className={(this.state.selectedSection == this.SECTION_SUBSCRIPTIONS) ? 'active': null}>
                        {Captions.profile.menuSubscriptions}
                    </div>
                </div>) : null
            }

            {
                items.map((article, index) => {
                    return (<ArticlePreview isFeed={isFeed} key={index} item={article} isOwner={this.props.isSelf} />)
                })
            }
        </div>)
    }
}

interface ISubscribersPropsInterface {
    userId: number | string;
    closeSubscribers?: () => {};
    isDesktop?: boolean;
}

interface ISubscribersStateInterface {
    items?: any[];
    itemsFiltered?: any[],
    filterString?: string;
}

class UserSubscribers extends React.Component<ISubscribersPropsInterface, ISubscribersStateInterface> {

    constructor() {
        super();
        this.state = {items: [], itemsFiltered: [], filterString: ""};
    }


    load() {
        api.get('/users/', {params: {subscribed_to: this.props.userId}}).then((response: any) => {
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
                <div onClick={this.close.bind(this)} className="close"><CloseIcon /></div>
                {this.state.itemsFiltered.map((item: any, index) => {
                    return (
                        <div className="profile__subscriber" key={index}>
                            <div className="avatar" onClick={this.close.bind(this)}><Link to={"/profile/" + item.id}><img src={item.avatar} /></Link></div>

                            <div className="name" onClick={this.close.bind(this)}>
                                <Link to={"/profile/" + item.id}>
                                    <span>{item.first_name} </span> <span>{item.last_name}</span>
                                </Link>
                            </div>

                            {
                                item.is_subscribed && !this.props.isDesktop ? (<div className="confirm_icon" ><ConfirmIcon /></div>) : null
                            }

                            {
                                this.props.isDesktop ? (<div className="subscription_info">
                                    {item.is_subscribed ? (<span>{Captions.profile.subscribersYouAreSubscribed}</span>)
                                        : (<span>{Captions.profile.subscribersNumber} {item.subscribers}</span>)}
                                </div>) : null
                            }

                        </div>)
                })}

                <div className="filter_input">
                    <input onChange={this.filterItems.bind(this)} type="text" placeholder={Captions.management.fastSearch} />
                </div>

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
        this.state = {user: null, error: null, isSelf: false, showSubscribers: false, isDesktop: MediaQuerySerice.getIsDesktop()};
        this.checkIsSelf = this.checkIsSelf.bind(this);
    }

    checkIsSelf() {
        let isSelf: boolean =  Boolean(this.state.user && UserAction.getStore().user && UserAction.getStore().user.id == this.state.user.id);
        this.setState({ isSelf: isSelf });
    }

    getUserData(userId: string) {
        this.setState({error: null}, () => {
            api.get('/users/' + userId + '/').then((response: any) => {
                this.setState({user: response.data, showSubscribers: false}, () => {
                    this.checkIsSelf();

                });
            }).catch((error) => {
                this.setState({error: <Error code={404} msg="page not found" /> });
            });
        });
    }

    subscribe() {
        api.post('/users/' + this.state.user.id + '/subscribe/').then((response) => {
            this.setIsSubscribed(true);
        }).catch((error) => {});
    }

    unSubscribe() {
        api.post('/users/' + this.state.user.id + '/un_subscribe/').then((response) => {
            this.setIsSubscribed(false);
        }).catch((error) => {})
    }

    closeSubscribers() {
        this.setState({showSubscribers: false});
    }

    showSubscribers() {
        if (this.state.isDesktop) {
            this.setState({showSubscribers: true});
        }
        else {
            ModalAction.do(OPEN_MODAL, {content: <UserSubscribers userId={this.state.user.id} />});
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

    componentDidMount() {
        MediaQuerySerice.listen((isDesktop: boolean) => {
            if (isDesktop != this.state.isDesktop) {
                this.setState({isDesktop: isDesktop, showSubscribers: false});
            }
        });

        this.getUserData(this.props.params.userId);
        UserAction.onChange(GET_ME, this.checkIsSelf);
        UserAction.onChange(LOGIN, this.checkIsSelf);
        UserAction.onChange(LOGOUT, this.checkIsSelf);
    }

    componentWillUnmount() {
        UserAction.unbind(GET_ME, this.checkIsSelf);
        UserAction.unbind(LOGIN, this.checkIsSelf);
        UserAction.unbind(LOGOUT, this.checkIsSelf);
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

                         <div className="profile__social_links" key="social_links">
                             { this.state.user.social_links.map((social_link: any, index: number) => {
                                 return (
                                     <div className="profile__social_icon" key={index}>
                                         <Link to={social_link.url} target="_blank" >
                                             <SocialIcon social={social_link.social} />
                                         </Link>
                                    </div>)
                             }) }
                         </div>

                         <div key="subscription" className="profile__subscription">
                             <div className="profile__subscription_info" onClick={this.showSubscribers.bind(this)}>
                                 <SubscriptionIcon />
                                 <span>{ this.state.isSelf ? Captions.profile.subscribersOwnProfile : Captions.profile.subscribers }</span>
                                 <span>{ this.state.user.subscribers }</span>
                             </div>

                             {
                                 (!this.state.isSelf && UserAction.getStore().user) ?
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
                             this.state.isSelf ? (<div className="profile__subscription">
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
                             <UserSubscribers isDesktop={this.state.isDesktop} userId={this.state.user.id} closeSubscribers={this.closeSubscribers.bind(this)} />
                         ) : null
                     }

                     <UserArticles hidden={this.state.isDesktop && this.state.showSubscribers} user={this.state.user} isSelf={this.state.isSelf} key="articles" />
                 </div>
             </div>
        )
    }
}