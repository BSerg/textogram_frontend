import * as React from "react";
import {Link} from "react-router-dom";
import {IContentData} from "../actions/editor/ContentAction";
import {api} from "../api";
import Error, {Error404, Error500, Error403} from "./Error";
import { UserAction, LOGIN, LOGOUT, UPDATE_USER, SAVE_USER, USER_REJECT, GET_ME } from "../actions/user/UserAction";
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from "../actions/shared/ModalAction";
import * as moment from "moment";
import SocialIcon from "./shared/SocialIcon";
import {MediaQuerySerice} from "../services/MediaQueryService";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../actions/shared/PopupPanelAction";
import * as Swapeable from "react-swipeable";
import PopupPrompt from "./shared/PopupPrompt";
import {NotificationAction, SHOW_NOTIFICATION} from "../actions/shared/NotificationAction";
import Loading from "./shared/Loading";
import LoginBlock from "./shared/LoginBlock";
import "../styles/article.scss";
import "../styles/banners.scss";
import {BannerID, Captions, BlockContentTypes} from "../constants";
import LeftSideButton from "./shared/LeftSideButton";
import AwesomeGallery from "./shared/AwesomeGallery";
import * as marked from 'marked';
import {Helmet} from 'react-helmet';
import Article from './Article';


interface IArticleFeedState {
    currentArticleIndex?: number;
    articles?: any[];
    banners?: any;
    recommendations?: any[] | null;
    loadingProcess?: boolean;
}

export default class ArticleFeed extends React.Component<any, IArticleFeedState> {
    private previousArticleIndex: number;
    private scrollProcess: number;

    constructor(props: any) {
        super(props);
        this.state = {
            currentArticleIndex: -1,
            articles: [],
            banners: null,
            recommendations: null,
            loadingProcess: false
        };
        this.handleScroll = this.handleScroll.bind(this);
        this.previousArticleIndex = -1;
    }

    loadAds() {
        return new Promise((resolve, reject) => {
            if (this.state.banners) {
                resolve(this.state.banners);
            } else {
                api.get(`${process.env.USE_CACHE_API ? '/_' : ''}/advertisements/banners`).then((response: any) => {
                    this.setState({banners: response.data}, () => {
                        resolve(this.state.banners);
                    });
                }).catch(err => {
                    reject();
                });
            }
        });
    }

    loadArticle(slug: string) {
        return new Promise((resolve, reject) => {
            if (this.state.loadingProcess) {
                reject('Loading process is running');
            } else {
                this.setState({loadingProcess: true}, () => {
                    api.get(`${process.env.USE_CACHE_API ? '/_' : ''}/articles/${slug}/`).then((response: any) => {
                        let articles = this.state.articles.concat([response.data]);
                        this.setState({
                            articles: articles,
                            loadingProcess: false
                        }, () => {
                            resolve();
                        })
                    })
                });
            }
        });
    }

    loadArticleRecommendations(slug: string) {
        api.get(`${process.env.USE_CACHE_API ? '/_' : ''}/articles/${slug}/recommendations/`).then((response: any) => {
            this.setState({recommendations: response.data});
        });
    }

    private detectCurrentIndex() {
        let articleElements = document.getElementsByClassName('article');
        let currentArticleIndex = this.previousArticleIndex;
        let edge = window.innerHeight * 0.25;
        for (let i = 0; i < articleElements.length; i++) {
            let articleElement = articleElements[i];
            let rect = articleElement.getBoundingClientRect();
            if (rect.top < edge && rect.top + rect.height >= edge) {
                currentArticleIndex = i;
            }
        }

        if (currentArticleIndex != -1 && this.previousArticleIndex != currentArticleIndex) {
            this.previousArticleIndex = currentArticleIndex;
            window.history.replaceState(null, null, 
                `${window.location.protocol}//${window.location.host}/articles/${this.state.articles[currentArticleIndex].slug}/`);
            this.setState({currentArticleIndex: currentArticleIndex});
            try {
                yaCounter.hit(`/articles/${this.state.articles[currentArticleIndex].slug}/`);
            } catch(err) {
                console.log('Yandex hit error', err);
            }
        }
    }

    handleScroll(e: Event) {
        window.clearTimeout(this.scrollProcess);
        this.scrollProcess = window.setTimeout(() => {
            this.detectCurrentIndex();
        }, 150);

        let trigger = document.getElementById('trigger');
        if ((window.innerHeight + 100) >= trigger.getBoundingClientRect().top) {
            if (!this.state.loadingProcess && this.state.recommendations && this.state.recommendations.length) {
                let nextSlug = this.state.recommendations.shift();
                this.loadArticle(nextSlug).then(() => {
                    this.detectCurrentIndex()
                });
            }
        }
        this.detectCurrentIndex();
    }

    componentDidMount() {
        this.loadAds().then(() => {
            this.loadArticle(this.props.match.params.articleSlug);
        }).catch(err => {
            this.loadArticle(this.props.match.params.articleSlug);
        });
        this.loadArticleRecommendations(this.props.match.params.articleSlug);
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    render() {
        let currentArticle = this.state.articles[this.state.currentArticleIndex];
        return (
            <div className="article_feed">
                {this.state.articles.map((article: any, index: number) => {
                    return (
                        <Article {...this.props}
                            key={'article' + article.id}  
                            renderedArticle={article} 
                            preventFetching={true} 
                            page={index} 
                            isCurrentInFeed={index == this.state.currentArticleIndex} 
                            banners={this.state.banners}/>
                    )
                })}
                <div id="trigger" className="article_feed__trigger">
                    {this.state.articles.length && this.state.loadingProcess ? 
                        <Loading/> : null
                    }
                </div>
                <div className="banner_side__container"></div>
            </div>
        )
    }
}

class ShareLinkButton extends React.Component<{shortUrl: string, className?: string}|any, {process?: boolean, copied?: boolean}|any> {
    refs: {
        element: HTMLDivElement
    };

    constructor(props: any) {
        super(props);
        this.state = {
            process: false,
            copied: false
        };
    }

    process() {
        this.setState({process: true}, () => {
            if (this.copyToClipboard()) {
                window.setTimeout(() => {
                    this.setState({process: false});
                }, 1000);
            }

        });

    }

    copyToClipboard(e?: Event) {
        let copied = false, input = this.refs.element.getElementsByTagName('input')[0];
        input.focus();
        document.execCommand("selectall",null,false);
        try {
            copied = document.execCommand('copy');
            if (copied) {
                // NotificationAction.do(SHOW_NOTIFICATION, {content: 'Ссылка скопирована в буфер обмена'});
                this.setState({copied: true});
            }
        }
        catch (error) {
            // NotificationAction.do(SHOW_NOTIFICATION, {content: 'Невозможно скопировать ссылку в буфер обмена'});
        }

        return copied;
    };

    handleBlur() {
        this.setState({process: false});
    }

    render() {
        let className = this.props.className;
        if (this.state.process) className += ' process';
        return (
            <div className={className} onClick={this.process.bind(this)}>
                <SocialIcon social="link"/>
                {this.state.process ?
                    <div ref="element" className="__popup_link">
                        <input type="text"
                               value={this.props.shortUrl}
                               readOnly={true}
                               onBlur={this.handleBlur.bind(this)}/>
                        {this.state.copied ?
                            <div className="__popup_link__copy">{Captions.shared.linkCopied}</div> : null
                        }
                    </div> : null
                }
            </div>
        )
    }
}

class ShareFloatingPanel extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            scrollDelta: 0,
            articleUrl: this.props.articleUrl
        };
        this.handleScroll = this.handleScroll.bind(this);
    }

    refs: {
        el: HTMLDivElement
    };

    handleScroll() {
        let visible = window.pageYOffset >= 100;
        visible ? this.refs.el.classList.add('visible') : this.refs.el.classList.remove('visible');
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillReceiveProps(nextProps: any) {
        this.setState({articleUrl: nextProps.articleUrl});
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    render() {
        let className = 'share_panel';
        return (
            <div ref="el" className={className}>
                <a href={"http://vk.com/share.php?url=" + this.props.articleUrl}
                   className="share_panel__share_btn"><SocialIcon social="vk"/></a>
                <a href={"https://www.facebook.com/sharer/sharer.php?u=" + this.props.articleUrl}
                   className="share_panel__share_btn"><SocialIcon social="facebook"/></a>
                <a href={"https://twitter.com/home?status=" + this.props.articleUrl}
                   className="share_panel__share_btn"><SocialIcon social="twitter"/></a>
                <ShareLinkButton className="share_link_button share_panel__share_btn"
                                 shortUrl={this.props.articleUrl}/>
            </div>
        )
    }
}