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
import "../styles/article_feed.scss";
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
    currentSideBannerIndex?: number;
    recommendations?: any[] | null;
    loadingProcess?: boolean;
    isDesktop?: boolean;
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
            currentSideBannerIndex: -1,
            recommendations: null,
            loadingProcess: false,
            isDesktop: MediaQuerySerice.getIsDesktop()
        };
        this.handleScroll = this.handleScroll.bind(this);
        this.previousArticleIndex = -1;
    }

    refs: {
        bannerSide: HTMLDivElement
    };

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

    private detectCurrentIndex(delay: number = 0) {
        return window.setTimeout(() => {
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
                this.setState({currentArticleIndex: currentArticleIndex}, () => {
                    if (this.state.currentArticleIndex != 0) {
                        this.processSideBanner();
                        // this.showSideBanner();
                    }
                    document.title = `${this.state.articles[this.state.currentArticleIndex].title} | ${process.env.SITE_NAME}`
                });
                try {
                    yaCounter.hit(`/articles/${this.state.articles[currentArticleIndex].slug}/`);
                } catch(err) {
                    console.log('Yandex hit error', err);
                }
            }
        }, delay);
    }

    handleScroll(e: Event) {
        window.clearTimeout(this.scrollProcess);

        this.scrollProcess = this.detectCurrentIndex(50);

        let trigger = document.getElementById('trigger');
        if ((window.innerHeight + 100) >= trigger.getBoundingClientRect().top) {
            if (!this.state.loadingProcess && this.state.recommendations && this.state.recommendations.length) {
                let nextSlug = this.state.recommendations.shift();
                this.loadArticle(nextSlug).then(() => {
                    // this.detectCurrentIndex()
                });
            }
        }
    }

    createBannerContent(bannerID: string, containerID: string, data: any) {
        if (!data || !(data.amp_props || data.code)) return null;
        let content = null;
        try {
            if (data.amp_props && data.amp_props.type == 'yandex') {
                let id = data.amp_props['data-block-id'];
                content = `
                    <!-- Yandex.RTB ${id} -->
                    <div id="yandex_rtb_${containerID}"></div>
                    <script type="text/javascript">
                        (function(w, d, n, s, t) {
                            w[n] = w[n] || [];
                            w[n].push(function() {
                                Ya.Context.AdvManager.render({
                                    blockId: "${id}",
                                    renderTo: "yandex_rtb_${containerID}",
                                    horizontalAlign: false,
                                    async: true,
                                    page: ${this.props.page}
                                });
                            });
                            t = d.getElementsByTagName("script")[0];
                            s = d.createElement("script");
                            s.type = "text/javascript";
                            s.src = "//an.yandex.ru/system/context.js";
                            s.async = true;
                            t.parentNode.insertBefore(s, t);
                        })(this, this.document, "yandexContextAsyncCallbacks");
                    </script>
                `
            
            } else if (data.code) {
                content = data.code;
            }

        } catch (err) {
            console.log('createBanner Error', err);
        }
        
        return content;
    }

    execBannerScript(bannerElement: any) {
        try {
            let script = bannerElement.getElementsByTagName('script')[0];
            if (script) {
                bannerElement.classList.add('active');
                window.setTimeout(() => {
                    let f = new Function(script.innerText);
                    f();
                });
            } else {
                bannerElement.classList.add('active');
            }
        } catch (err) {
            console.log(err)
        }
    }

    execBannerScripts(bannerElement: any) {
        try {
            let scripts = bannerElement.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                let script = scripts[i];
                if (script) {
                    window.setTimeout(() => {
                        let f = new Function(script.innerText);
                        f();
                    });
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    processSideBanner() {
        if (this.state && this.state.isDesktop && this.state.banners) {
            let ads = JSON.parse(JSON.stringify(this.state.banners['desktop']));
            if (ads[BannerID.BANNER_RIGHT_SIDE].length) {
                let index = this.state.currentSideBannerIndex + 1;
                
                if (index >= ads[BannerID.BANNER_RIGHT_SIDE].length) {
                    index = 0; 
                }

                if (index != this.state.currentSideBannerIndex) {
                    this.setState({currentSideBannerIndex: index}, () => {
                        let banner = ads[BannerID.BANNER_RIGHT_SIDE][index];
                        this.refs.bannerSide.innerHTML = this.createBannerContent(BannerID.BANNER_RIGHT_SIDE, BannerID.BANNER_RIGHT_SIDE, banner);
                        this.execBannerScript(this.refs.bannerSide);
                    });
                }
            }
        }
    }

    _processSideBanner() {
        if (this.state && this.state.isDesktop && this.state.banners) {
            let ads = JSON.parse(JSON.stringify(this.state.banners['desktop']));
            if (ads[BannerID.BANNER_RIGHT_SIDE].length) {
                this.refs.bannerSide.innerHTML = "";
                for (let i = 0; i < ads[BannerID.BANNER_RIGHT_SIDE].length; i++) {
                    let banner = ads[BannerID.BANNER_RIGHT_SIDE][i];
                    let bannerContainer = document.createElement("div");
                    bannerContainer.innerHTML = this.createBannerContent(BannerID.BANNER_RIGHT_SIDE, BannerID.BANNER_RIGHT_SIDE + '_' + i, banner);
                    this.refs.bannerSide.appendChild(bannerContainer);
                    this.refs.bannerSide.classList.add("active");
                    // this.execBannerScript(this.refs.bannerSide.children[i]);
                }

                this.execBannerScripts(this.refs.bannerSide);
                this.showSideBanner();
            }
        }
    }

    showSideBanner() {
        if (this.state && this.state.isDesktop && this.state.banners) {
            let ads = JSON.parse(JSON.stringify(this.state.banners['desktop']));
            let index = this.state.currentSideBannerIndex + 1;
                
            if (index >= ads[BannerID.BANNER_RIGHT_SIDE].length) {
                index = 0; 
            }

            if (index != this.state.currentSideBannerIndex) {
                this.setState({currentSideBannerIndex: index}, () => {
                    let bannerContainers = this.refs.bannerSide.children;
                    for (let i = 0; i  < bannerContainers.length; i++) {
                        if (i == index) {
                            (bannerContainers[i] as HTMLDivElement).style.display = "block";
                        } else {
                            (bannerContainers[i] as HTMLDivElement).style.display = "none";
                        }
                    }
                });
            }
        }
    }

    componentDidMount() {
        this.loadAds().then(() => {
            this.loadArticle(this.props.match.params.articleSlug).then(() => {
                this.processSideBanner();
            });
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

                <div className={"banner_side__container" + (this.state.articles.length && this.state.articles[0].content && this.state.articles[0].content.cover ? ' more_offset' : '')}>
                    <div ref="bannerSide" className={"banner " + BannerID.BANNER_RIGHT_SIDE}></div>
                </div>
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