import * as React from 'react';

import {Link} from 'react-router';

import '../styles/common.scss';
import '../styles/profile.scss';

import {api} from '../api';

import Header from './shared/Header';
import ArticlePreview from './shared/ArticlePreview';
import Error from './Error';
import {UserAction, GET_ME, LOGIN, LOGOUT} from "../actions/user/UserAction";

const VKIcon = require('babel!svg-react!../assets/images/profile_social_icon_vk.svg?name=VKIcon');
const FBIcon = require('babel!svg-react!../assets/images/profile_social_icon_fb.svg?name=FBIcon');

import SocialIcon from './shared/SocialIcon';

import {Captions} from '../constants';
const ConfirmIcon = require('babel!svg-react!../assets/images/redactor_icon_confirm.svg?name=ConfirmIcon');
const SubscriptionIcon = require('babel!svg-react!../assets/images/profile_subscription_icon.svg?name=SubscriptionIcon');


interface IUserArticlesPropsInterface {
    user: any;
    isSelf: boolean;
}

interface IUserArticlesStateInterface {
    articles?: any[];
    feed?: any[];
    selectedSection?: string;
}

class UserArticles extends React.Component<IUserArticlesPropsInterface, IUserArticlesStateInterface> {

    SECTION_SUBSCRIPTIONS = 'subscriptions';
    SECTION_ARTICLES = 'articles';


    constructor() {
        super();
        this.state = {articles: [], feed: [], selectedSection: this.SECTION_ARTICLES};
    }

    loadArticles(userId: string|number) {

        api.get('/articles/', {params: {user: userId}}).then((response: any) => {
            if (userId=='me') this.setState(
                { feed: this.state.feed.concat(response.data.results || []) }
            );
            else this.setState(
                { articles: this.state.articles.concat(response.data.results || []) }
            )
        }).catch((error) => {});
    }

    setSection(sectionName: string) {
        if (sectionName != this.SECTION_ARTICLES && sectionName != this.SECTION_SUBSCRIPTIONS) return;
        if (sectionName == this.SECTION_SUBSCRIPTIONS && !this.props.isSelf) return;
        this.setState({selectedSection: sectionName});
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.user.id != this.props.user.id) {
            this.setState({articles: []}, () => { this.loadArticles(nextProps.user.id) });
        }
        if (nextProps.isSelf && !this.props.isSelf) {
            this.setState({feed: [], selectedSection: this.SECTION_SUBSCRIPTIONS}, () => { this.loadArticles('me') });
        }
        if (!nextProps.isSelf) { this.setState({feed: [], selectedSection: this.SECTION_ARTICLES}) }
    }

    componentDidMount() {
        this.loadArticles(this.props.user.id);

        if (this.props.isSelf) this.setState(
            {selectedSection: this.SECTION_SUBSCRIPTIONS}, () => {this.loadArticles('me');});
    }

    render() {

        let items: any[] = (this.state.selectedSection == this.SECTION_ARTICLES) ? this.state.articles : this.state.feed;
        let isFeed = this.state.selectedSection == this.SECTION_SUBSCRIPTIONS;

        return (<div className="profile__articles">

            {this.props.isSelf ? (
                <div className="profile__articles__menu">
                    <div onClick={this.setSection.bind(this, this.SECTION_SUBSCRIPTIONS)}  className={(this.state.selectedSection == this.SECTION_SUBSCRIPTIONS) ? 'active': null}>
                        {Captions.profile.menuSubscriptions}
                    </div>
                    <div onClick={this.setSection.bind(this, this.SECTION_ARTICLES)} className={(this.state.selectedSection == this.SECTION_ARTICLES) ? 'active': null}>
                        {Captions.profile.menuArticles}
                    </div>
                </div>) : null}

            {
                items.map((article, index) => {
                    return (<ArticlePreview isFeed={isFeed} key={index} item={article} />)
                })
            }
        </div>)
    }
}

interface IProfileState {
    user?: any;
    error?: any;
    isSelf?: boolean;
}

export default class Profile extends React.Component<any, IProfileState> {


    constructor(props: any) {
        super(props);
        this.state = {user: null, error: null, isSelf: false};
        this.checkIsSelf = this.checkIsSelf.bind(this);
    }

    checkIsSelf() {
        let isSelf: boolean =  Boolean(this.state.user && UserAction.getStore().user && UserAction.getStore().user.id == this.state.user.id);
        this.setState({ isSelf: isSelf });
    }

    getUserData(userId: string) {
        this.setState({error: null}, () => {
            api.get('/users/' + userId + '/').then((response: any) => {
                this.setState({user: response.data}, () => {
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
        return (

            <div className="profile">

                 <div id="profile_content">
                    {
                        this.state && this.state.user ? [
                            <Header key="header"/>,
                            <div className="profile__avatar" key="avatar">
                                <img src={this.state.user.avatar}/>
                            </div>,

                            <div key="username" className="profile__username">
                                    <span>{this.state.user.first_name}</span> <span> {this.state.user.last_name}</span>
                            </div>,

                            <div key="subscription" className="profile__subscription">
                                <div className="profile__subscription_info">
                                    <SubscriptionIcon />
                                    <span>{ this.state.user.subscribers }</span>
                                </div>

                                {
                                    (!this.state.isSelf && UserAction.getStore().user) ?
                                        <div>
                                            { this.state.user.is_subscribed ?
                                                <div className="profile__subscription_unsubscribe" onClick={this.unSubscribe.bind(this)}>
                                                    <ConfirmIcon />
                                                    <span>{Captions.profile.subscribed}</span>
                                                </div> :
                                                <div className="profile__subscription_subscribe" onClick={this.subscribe.bind(this)}>
                                                    <span>{Captions.profile.subscribe}</span>
                                                </div> }
                                        </div> : null
                                }
                            </div>,

                            <div className="profile__social_links" key="social_links">
                                { this.state.user.social_links.map((social_link: any, index: number) => {
                                    return (
                                        <div className="profile__social_icon" key={index}>
                                            <Link to={social_link.url} target="_blank" >
                                                <SocialIcon social={social_link.social} />
                                            </Link>
                                        </div>)
                                }) }
                            </div>,
                            <UserArticles user={this.state.user} isSelf={this.state.isSelf} key="articles" />


                        ] : null
                    }
                </div>
            </div>
        )
    }
}