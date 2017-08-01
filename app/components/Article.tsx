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

marked.setOptions({
    sanitize: true,
});

const EditButton = require('-!babel-loader!svg-react-loader!../assets/images/edit.svg?name=EditButton');
const DeleteButton = require('-!babel-loader!svg-react-loader!../assets/images/redactor_icon_delete.svg?name=DeleteButton');
const BackButton = require('-!babel-loader!svg-react-loader!../assets/images/back.svg?name=BackButton');
const ViewIcon = require('-!babel-loader!svg-react-loader!../assets/images/views_white.svg?name=ViewIcon');
const CloseIcon = require('-!babel-loader!svg-react-loader!../assets/images/close_white.svg?name=CloseIcon');
const ArrowButton = require('-!babel-loader!svg-react-loader!../assets/images/arrow.svg?name=ArrowButton');
const ShareButton = require('-!babel-loader!svg-react-loader!../assets/images/share.svg?name=ShareButton');
const EditBlackButton = require('-!babel-loader!svg-react-loader!../assets/images/edit-small.svg?name=EditBlackButton');
const PublishButton = require('-!babel-loader!svg-react-loader!../assets/images/publish.svg?name=PublishButton');
const ConfirmButton = require('-!babel-loader!svg-react-loader!../assets/images/editor_confirm.svg?name=ConfirmButton');
const LockButton = require('-!babel-loader!svg-react-loader!../assets/images/lock.svg?name=LockButton');


interface IPhoto {id: number, image: string, preview?: string, caption?: string}


interface IArticle {
    id: number
    slug: string
    title: string
    cover: string | null
    blocks: IContentData[]
    html: string
    published_at: string
    date?: string
    views: number
    owner: {
        id: number,
        nickname: string,
        first_name: string,
        last_name: string,
        avatar: string
    },
    images: IPhoto[];
    imageMap?: any;
    url: string;
    short_url?: string;
    ads_enabled?: boolean,
    paywall_enabled?: boolean,
    paywall_price?: number,
    paywall_currency?: string,
    advertisement?: any,
    inverted_theme?: boolean
}

interface IArticleProps {
    isPreview?: boolean;
    params?: any;
    router?: any;
    renderedArticle?: any;
    preventFetching: boolean;
    page?: number;
    isCurrentInFeed?: boolean;
    banners?: any;
}

interface IArticleState {
    article?: IArticle | null;
    error?: any;
    user?: any;
    isDesktop?: boolean;
}

export default class Article extends React.Component<IArticleProps|any, IArticleState|any> {
    private loadingImages: HTMLImageElement[];
    private adsProcessed: boolean;

    constructor(props: any) {
        super(props);
        this.loadingImages = [];
        this.adsProcessed = false;
        this.state = {
            article: this.processArticle(props.renderedArticle) || null,
            user: UserAction.getStore().user,
            isDesktop: MediaQuerySerice.getIsDesktop(),
        };
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
        this.handleUser = this.handleUser.bind(this);
    }

    refs: {
        shortUrlInput: HTMLInputElement,
        article: HTMLDivElement,
    };

    static defaultProps:any = {
        isPreview: false,
        preventFetching: false,
        page: 0,
        isCurrentInFeed: true
    };

    handleUser() {
        this.setState({user: UserAction.getStore().user});
    }

    editArticle() {
        this.state.article && this.props.history.push(`/articles/${this.state.article.id}/edit`);
    }

    processArticle(article: IArticle) {
        if (!article) return;
        let calendarParams = {
            sameDay: 'Сегодня, LT',
            lastDay: 'Вчера, LT',
            sameElse: 'DD MMMM YYYY, LT',
            lastWeek: 'DD MMMM YYYY, LT'
        };
        if (this.props.isPreview && !article.published_at) {
            article.date = moment().locale('ru').calendar(null, calendarParams);
        } else if (article.published_at){
            article.date = moment(article.published_at).locale('ru').calendar(null, calendarParams);
        }

        if (typeof article.paywall_price != 'undefined') {
            article.paywall_price = article.paywall_price == Math.floor(article.paywall_price) ? Math.floor(article.paywall_price) : article.paywall_price;
        }

        if (article.images) {
            article.imageMap = article.imageMap || {};
            article.images.forEach((image: IPhoto) => {
                article.imageMap[image.id] = image;
            });
        }
        
        return article;
    }

    checkArticleLength(title: string) {
        if (title.length <= 15) {
            return 'short';
        } else if (title.length <= 60) {
            return 'regular';
        } else {
            return 'long';
        }
    }

    processQuote(el: HTMLElement) {
        if (!process.env.IS_BROWSER) return;
        
        if (!el) return;
        if (el.innerText && el.innerText.length > 500) {
            el.classList.add('long');
        }
    }

    processPhrase(el: HTMLElement) {
        if (!process.env.IS_BROWSER) return;
        
        if (!el) return;
        if (el && el.innerText) {
            if (el.innerText.length <= 70) {
                el.classList.add('short');
            } else if (el.innerText.length > 200) {
                el.classList.add('long');
            }
        }
    }

    processColumn() {
        if (!process.env.IS_BROWSER) return;
        
        let columns = this.refs.article.getElementsByClassName('column');
        for (let i in columns) {
            let column = columns[i] as HTMLElement;
            if (column && column.innerText) {
                if (column.innerText.length > 500) {
                    column.classList.add('long');
                }
            }
        }
    }

    processEmbed(embedData: any, el: HTMLElement) {
        if (!process.env.IS_BROWSER) return;
        
        if (embedData.type == BlockContentTypes.VIDEO) {
            try {
                el.style.height = el.offsetWidth * 450 / 800 + 'px';
                let iframe = el.getElementsByTagName('iframe')[0];
                if (iframe) {
                    iframe.addEventListener('load', () => {
                        iframe.style.height = iframe.offsetWidth * 450 / 800 + 'px';
                        el.style.visibility = "visible";
                    });
                }
            } catch (err) {

            }
        } else {
            switch (embedData.__meta.type) {
                case 'twitter':
                    try {
                        twttr.widgets && twttr.widgets.load(el);
                    } catch (err) {}
                    break;
                case 'instagram':
                    try {
                        instgrm.Embeds.process();
                    } catch (err) {}
                    break;
                case 'facebook':
                    try {
                        FB.XFBML.parse(el);
                    } catch(err) {}
                    break;
                default:
                    try {
                        let script = el.getElementsByTagName('script')[0];
                        if (script) {
                            let f = new Function(script.innerText);
                            f();
                        }
                    } catch (err) {}
            }
        }
    }

    createBanner(width: number, height: number, bannerID: string, data: any, isActive: boolean = false) {
        if (!data || !(data.amp_props || data.code)) return null;
        let banner = document.createElement('div');
        banner.className = 'banner ' + bannerID;
        banner.id = bannerID + '__' + Math.random().toString().substr(2, 7);
        if (isActive) {
            banner.classList.add('active');
        }
        banner.style.display = 'block';
        banner.style.width = width + 'px';
        banner.style.height = height + 'px';
        try {
            if (data.amp_props && data.amp_props.type == 'yandex') {
                let id = data.amp_props['data-block-id'];
                let content = `
                    <!-- Yandex.RTB ${id} -->
                    <div id="yandex_rtb_${banner.id}"></div>
                    <script type="text/javascript">
                        (function(w, d, n, s, t) {
                            w[n] = w[n] || [];
                            w[n].push(function() {
                                Ya.Context.AdvManager.render({
                                    blockId: "${id}",
                                    renderTo: "yandex_rtb_${banner.id}",
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
                banner.innerHTML = content;
            } else if (data.code) {
                banner.innerHTML = data.code;
            }
        } catch (err) {
            console.log('createBanner Error', err);
        }
        
        return banner;
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

    private clearBanners() {
        let banners = this.refs.article.getElementsByClassName('banner');
        while (banners.length > 0) {
            banners[0].parentNode.removeChild(banners[0]);
        }
    }
    
    shuffle(a: any[]) {
        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }
    }

    processAds() {
        if (this.state.article && this.state.article.ads_enabled && this.props.banners) {
            this.clearBanners();
            this.adsProcessed = true;
            let ads = JSON.parse(JSON.stringify(this.props.banners[this.state.isDesktop ? 'desktop' : 'mobile']));

            // Banner containers placement
            const bannerDens = process.env.BANNER_DENSITY || 0.5;
            const bannerDensMob = process.env.BANNER_DENSITY_MOBILE || 0.2;
            const bannerOffs = process.env.BANNER_OFFSET || 0.5;

            let screenHeight = MediaQuerySerice.getScreenHeight();
            let bannerInterval = screenHeight / (this.state.isDesktop ? bannerDens : bannerDensMob);
            let bannerOffset = bannerOffs * screenHeight; 
            let content = this.refs.article.getElementsByClassName('article__content')[0];
            let contentHeight = content.getBoundingClientRect().height;
            let rootElements = this.refs.article.querySelectorAll('.article__content > p, .article__content > div, .article__content > blockquote');
            let heightAccumTemp = 0;
            let heightAccum = 0;
            let bannerCount = 0;

            for (let i = 0; i < rootElements.length; i++) {
                let element = rootElements[i];
                let rect = element.getBoundingClientRect();
                heightAccumTemp += rect.height;
                heightAccum += rect.height;

                if (this.state.isDesktop) {
                    if (
                        (heightAccumTemp >= bannerOffset && bannerCount == 0 || heightAccumTemp >= bannerInterval) && 
                        (contentHeight - heightAccum >= bannerInterval ) &&
                        (!element.classList.contains('photos') && !(element.nextSibling && (element.nextSibling as Element).classList.contains('photos')))
                    ) {
                        heightAccumTemp = 0;
                        bannerCount++;
                        let banner = null;

                        if (element.tagName == 'P' && element.nextSibling && element.nextSibling.nodeName == 'P') {
                            let inlineBanners = ads[BannerID.BANNER_CONTENT_INLINE];
                            if (inlineBanners && inlineBanners.length) {
                                this.shuffle(inlineBanners);
                                let inlineBannerData = inlineBanners.shift();
                                if (inlineBannerData) banner = this.createBanner(inlineBannerData.width, inlineBannerData.height, BannerID.BANNER_CONTENT_INLINE, inlineBannerData, true);
                            }
                        } else {
                            let contentBanners = ads[BannerID.BANNER_CONTENT];
                            if (contentBanners && contentBanners.length) {
                                this.shuffle(contentBanners);
                                let bannerData = contentBanners.shift();
                                if (bannerData) banner = this.createBanner(bannerData.width, bannerData.height, BannerID.BANNER_CONTENT, bannerData, true);
                            } 
                        }

                        if (banner) {
                            element.parentNode.insertBefore(banner, element.nextSibling);
                            this.execBannerScript(banner);
                        }
                    }
                } else {
                    if (
                        (heightAccumTemp >= bannerOffset && bannerCount == 0 || heightAccumTemp >= bannerInterval) &&
                        (contentHeight - heightAccum >= bannerOffset) &&
                        (!element.classList.contains('photos') && !(element.nextSibling && (element.nextSibling as Element).classList.contains('photos')))
                    ) {
                        heightAccumTemp = 0;
                        bannerCount++;
                        let banner = null;

                        let contentBanners = ads[BannerID.BANNER_CONTENT];
                        console.log(contentBanners)
                        if (contentBanners && contentBanners.length) {
                            this.shuffle(contentBanners);
                            let bannerData = contentBanners.shift();
                            if (bannerData) banner = this.createBanner(bannerData.width, bannerData.height, BannerID.BANNER_CONTENT, bannerData, true);
                        }

                        if (banner) {
                            element.parentNode.insertBefore(banner, element.nextSibling);
                            this.execBannerScript(banner);
                        }
                    }
                }
            }

            // Bottom banner placement
            if (ads[BannerID.BANNER_BOTTOM] && ads[BannerID.BANNER_BOTTOM].length) {
                if (this.state.isDesktop || bannerCount == 0) {
                    let bottomBanners = ads[BannerID.BANNER_BOTTOM];
                    this.shuffle(bottomBanners);
                    let bottomBannerData = bottomBanners.shift();
                    let bottomBannerContainer = this.refs.article.querySelector('#' + BannerID.BANNER_BOTTOM);
                    let bottomBanner = this.createBanner(bottomBannerData.width, bottomBannerData.height, BannerID.BANNER_BOTTOM, bottomBannerData, true);
                    if (bottomBanner) {
                        bottomBannerContainer.appendChild(bottomBanner);
                        this.execBannerScript(bottomBanner);
                    }
                }
            }

            // Side banner placement
            if (ads[BannerID.BANNER_RIGHT_SIDE] && ads[BannerID.BANNER_RIGHT_SIDE].length) {
                let sideBanners = ads[BannerID.BANNER_RIGHT_SIDE];
                this.shuffle(sideBanners);
                let sideBannerData = sideBanners.shift();
                let sideBanner = this.createBanner(sideBannerData.width, sideBannerData.height, BannerID.BANNER_RIGHT_SIDE, sideBannerData, true);
                if (sideBanner) {
                    let container = this.refs.article.getElementsByClassName('banner_container_side__sticky')[0];
                    container.appendChild(sideBanner);
                    this.execBannerScript(sideBanner);
                }
            }
        }
    }

    processPhoto(
        photo: {id: string, preview: string, image: string, caption: string, isAnimated: boolean}, 
        onClick: () => any, 
        el: HTMLElement
    ) {
        if (!process.env.IS_BROWSER) return;
        window.setTimeout(() => {
            if (!el) return;
            let img = document.createElement('img');
            img.onload = function() {
                let parent = el.parentNode;
                if (parent) {
                    parent.replaceChild(img, el);
                }
            };
            img.className = el.getAttribute('class');
            img.alt = photo.caption;
            if (photo.isAnimated) {
                img.src = photo.image;
            } else {
                img.src = photo.preview;
                img.addEventListener('click', onClick);
            }
        })
    }

    getBanner(id: string) {
        try {
            return this.state.article.advertisement[this.state.isDesktop ? 'desktop' : 'mobile'][id];
        } catch (err) {
            return null;
        }
    }

    getRightBanner() {
        return this.getBanner(BannerID.BANNER_RIGHT_SIDE);
    }

    openGalleryModal(currentPhotoIndex: number, photos: any[], galleryId: string = null) {
        if (galleryId && !this.props.isPreview) {
            window.history.pushState(null, null, `${window.location.protocol}//${window.location.host}/articles/${this.state.article.slug}/gallery/${galleryId}`)
        }
        let oldGallery = <GalleryModal isPreview={this.props.isPreview}
                                    currentPhotoIndex={currentPhotoIndex}
                                    photos={photos}
                                    router={this.props.router}
                                    article={this.state.article}/>;
        let onClose = () => {
            ModalAction.do(CLOSE_MODAL, null);
            if (!this.props.isPreview) {
                window.history.pushState(null, null, 
                    `${window.location.protocol}//${window.location.host}/articles/${this.state.article.slug}`)
            }
        };
        let newGallery = <AwesomeGallery photos={photos} currentPhotoIndex={currentPhotoIndex} onClose={onClose}/>;
        ModalAction.do(OPEN_MODAL, {content: newGallery});

    }

    closeSharePopup() {
        PopupPanelAction.do(CLOSE_POPUP, null);
    }

    openSharePopup() {
        let content = (
            <div className="share_popup">
                <div className="share_popup__row">
                    <a href={"http://vk.com/share.php?url=" + this.state.article.url}
                       className="share_popup__item share_popup__vk"><SocialIcon social="vk"/></a>
                    <a href={"https://www.facebook.com/sharer/sharer.php?u=" + this.state.article.url}
                       className="share_popup__item share_popup__fb"><SocialIcon social="facebook"/></a>
                    <a href={"https://twitter.com/home?status=" + this.state.article.url}
                       className="share_popup__item share_popup__twitter"><SocialIcon social="twitter"/></a>
                </div>
                <div className="share_popup__row">
                    <a href={"https://telegram.me/share/url?url=" + this.state.article.url}
                       className="share_popup__item share_popup__telegram"><SocialIcon social="telegram"/></a>
                    <a href={"whatsapp://send?text=" + this.state.article.url}
                       data-action="share/whatsapp/share"
                       className="share_popup__item share_popup__whatsapp"><SocialIcon social="whatsapp"/></a>
                    <a href={"viber://forward?text=" + this.state.article.url}
                       className="share_popup__item share_popup__viber"><SocialIcon social="viber"/></a>
                </div>
                <div className="share_popup__close" onClick={this.closeSharePopup.bind(this)}><CloseIcon/></div>
            </div>
        );
        PopupPanelAction.do(OPEN_POPUP, {content: content});
    }

    handleMediaQuery(isDesktop: boolean) {
        if (this.state.isDesktop != isDesktop) {
            this.setState({isDesktop: isDesktop}, () => {
                this.adsProcessed = false;
                this.processAds();
            });
        }
    }

    coverLazyLoad(el: HTMLElement) {
        if (el && this.state.article && this.state.article.cover) {
            let img = new Image();
            img.onload = () => {
                el.style.background = `url('${this.state.article.cover}') no-repeat center center`;
                if (this.loadingImages.indexOf(img) != -1) {
                    this.loadingImages.splice(this.loadingImages.indexOf(img), 1);
                }
            };
            img.src = this.state.article.cover;
            this.loadingImages.push(img);
        }
    }

    _publish() {
        api.post(`/articles/editor/${this.props.match.params.articleId}/publish/`).then((response: any) => {
            NotificationAction.do(SHOW_NOTIFICATION, {content: 'Поздравляем, ваш материал опубликован.'});
            this.props.history.push(`/articles/${this.state.article.slug}/`);
        });
    }

    publishArticle() {
        if (this.state.isDesktop) {
            if (confirm('Опубликовать материал?')) {
                this._publish();
            }
        } else {
            let content = <PopupPrompt confirmLabel="Опубликовать" onConfirm={this._publish.bind(this)}/>;
            PopupPanelAction.do(OPEN_POPUP, {content: content});
        }
    }

    retrieveArticle() {
        api.get(`${process.env.USE_CACHE_API ? '/_' : ''}/articles/${this.props.match.params.articleSlug}/`).then((response: any) => {
            this.setState({article: this.processArticle(response.data)});
        }).catch((err: any) => {
            console.log(err);
            if (err.response) {
                switch (err.response.status) {
                    case 403:
                        this.setState({error: <Error403/>});
                        break;
                    case 404:
                        this.setState({error: <Error404/>});
                        break;
                    default:
                        this.setState({error: <Error500/>});
                }
            }
        });
    }

    retrieveArticlePreview() {
        api.get(`/articles/${this.props.match.params.articleId}/preview/`).then((response: any) => {
            this.setState({article: this.processArticle(response.data)}, () => {
                this.processAds();
            });
        }).catch((err: any) => {
            console.log(err);
            if (err.response) {
                switch (err.response.status) {
                    case 404:
                        this.setState({error: <Error404/>});
                        break;
                    case 401:
                        this.setState({error: <Error403/>});
                        break;
                    default:
                        this.setState({error: <Error500/>})
                }
            }
        });
    }

    loadPaymentForm(el: HTMLFormElement) {
        if (!el) return;
        api.post('payments/form/', {
            article_id: this.state.article.id,
            success_url: window.location.href,
            fail_url: window.location.href
        }).then((response: any) => {
            el.setAttribute('action', response.data.action);
            let inputs = el.getElementsByTagName('input');
            for (let i = 0; i < inputs.length; i++) {
                el.removeChild(inputs[i]);
            }
            Object.keys(response.data.form).forEach(field => {
                let input = document.createElement('input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', field);
                input.setAttribute('value', response.data.form[field]);
                el.appendChild(input);
            });

        }).catch(err => {
            console.log(err);
        });
    }

    submitPaymentForm() {
        let form = this.refs.article.querySelector('#payment_form');
        (form as HTMLFormElement).submit();
    }

    route(url: string) {
        this.props.history.push(url);
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.handleMediaQuery);
        UserAction.onChange([LOGIN, LOGOUT, GET_ME, UPDATE_USER, SAVE_USER, USER_REJECT], this.handleUser);
        if (this.props.isPreview) {
            this.retrieveArticlePreview();
        } else {
            if (!this.props.preventFetching) {
                this.retrieveArticle();
            }
        }
        if (this.props.page === 0 && !this.adsProcessed) {
            this.processAds();
        }
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.isPreview) {
            if (nextProps.match.params.articleId != this.props.match.params.articleId) {
                this.retrieveArticlePreview();
            }
        } else {
            if (!nextProps.match.params.galleryBlockId) {
                ModalAction.do(CLOSE_MODAL, null);
            } 
            // if (nextProps.match.params.articleSlug != this.props.match.params.articleSlug) {
            //     this.retrieveArticle();
            // }
        }
        if (nextProps.isCurrentInFeed != this.props.isCurrentInFeed && nextProps.isCurrentInFeed) {
            this.adsProcessed = false;
            this.processAds();
        }
    }

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.handleMediaQuery);
        UserAction.unbind([LOGIN, LOGOUT, GET_ME, UPDATE_USER, SAVE_USER, USER_REJECT], this.handleUser);

        this.loadingImages.forEach((img) => {
            img.onload = () => {};
        });
        this.loadingImages = [];
    }

    // shouldComponentUpdate(nextProps: any, nextState: any) {

    //     return false;
    // }

    render() {
        let coverStyle = {};
        let titleClassName = "article__title", authorLink = '/';

        if (this.state.article) {
            let titleLengthState = this.checkArticleLength(this.state.article.title);
            if (titleLengthState != 'regular') titleClassName += ' ' + this.checkArticleLength(this.state.article.title);
            if (this.state.article.cover) titleClassName += ' covered';
            if (this.state.article.cover || this.state.article.inverted_theme) titleClassName += ' inverted';
            authorLink = process.env.IS_LENTACH ? '/' : `/${this.state.article.owner.nickname}`;
        }

        let currencyIcon;
        if (this.state.article) {
            switch (this.state.article.paywall_currency) {
                case 'EUR':
                    currencyIcon = '€';
                    break;
                case 'USD':
                    currencyIcon = '$';
                    break;
                default:
                    currencyIcon = '₽';
            }
        }
        let lead: string;

        try {
            lead = this.state.article.content.blocks[0].type == BlockContentTypes.LEAD ? 
               marked(this.state.article.content.blocks[0].value) : null;
            lead = lead.replace(/(<[^>]*>)/ig, '');
        }
        catch (err) {
            lead = null;
        }
        return (
            !this.state.error ?
                this.state.article ?
                    <div ref="article" id={"article" + this.state.article.id} className="article">
                        <Helmet>
                            <title>{`${this.state.article.title} | ${process.env.SITE_NAME}`}</title>
                            <link rel="amphtml" href={`${process.env.SITE_URL}/articles/${this.state.article.slug}/amp`} />
                            <meta property="title" content={`${this.state.article.title} | ${process.env.SITE_NAME}`} />
                            { lead ? <meta name="description" content={lead} /> : null}
                            <meta name="twitter:card" content="summary_large_image" />
                            <meta name="twitter:title" content={this.state.article.title} />
                            { lead ? <meta name="twitter:description" content={lead} /> : null}
                            {
                                this.state.article.cover ? 
                                    <meta name="twitter:image" content={this.state.article.cover}/> : null
                            }
                            <meta property="og:type" content="article" />
                            <meta property="og:title" content={this.state.article.title} />
                            {
                                this.state.article.cover ? 
                                    <meta name="twitter:image" content={this.state.article.cover}/> : null
                            }
                            <meta property="og:url" content={`${process.env.SITE_URL || ''}/articles/${this.state.article.slug}`} />
                            {
                                this.state.article.cover ? 
                                    [<meta key="ogImage" property="og:image" content={this.state.article.cover} />, <meta key="ogImageUrl" property="og:image:url" content={this.state.article.cover} /> ] : null
                            }
                            { lead ? <meta name="og:description" content={lead} /> : null }
                        </Helmet>

                        {/* TITLE BLOCK */}
                        <div ref={this.coverLazyLoad.bind(this)} className={titleClassName}>
                            <div className="article__title_container">
                                <h1>{this.state.article.title}</h1>
                                <div className="article__stats">
                                    <div className="article__author1">
                                        <Link to={authorLink}>
                                            {this.state.article.owner.first_name} {this.state.article.owner.last_name}
                                        </Link>
                                    </div>
                                    <div className="article__date">{this.state.article.date}</div>
                                    <div className="article__views">
                                        <ViewIcon/> {this.state.article.views}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="article__content_wrapper">
                            {this.state.article.paywall_enabled && !this.state.article.content ?
                                <div className="article__content article__restricted_access">
                                    <div className="restricted_access__header">
                                        <LockButton/> Доступ к статье ограничен автором
                                    </div>
                                    <div className="restricted_access__content">
                                        <div className="restricted_access__price_text">Стоимость доступа:</div>
                                        <div className="restricted_access__price">
                                            <div className="restricted_access__value">{this.state.article.paywall_price}</div>
                                            <div className="restricted_access__currency">{currencyIcon}</div>
                                        </div>
                                        {!this.state.user ? 
                                            <div className="restricted_access__auth">
                                                <div>Для оплаты вам необходимо авторизоваться:</div>
                                                <LoginBlock/>
                                            </div> : 
                                            <div className="restricted_access__form">
                                                <form 
                                                    id="payment_form" 
                                                    method="post" 
                                                    ref={this.loadPaymentForm.bind(this)} 
                                                    target="_self">
                                                </form>
                                                <div 
                                                    onClick={this.submitPaymentForm.bind(this)} 
                                                    className="restricted_access__submit">
                                                    Купить
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div> :
                                <div className="article__content">
                                    
                                    {this.state.article.content.blocks.map((block: any, i: number) => {
                                        if (block.value) {
                                            block.value = block.value.replace(/<[^>]*>/g, '');
                                        } 
                                        switch (block.type) {
                                            case BlockContentTypes.TEXT:
                                                let regx = /<p>(.+)<\/p>/g;
                                                let t: any[] = [];
                                                let match;
                                                let count = 0;
                                                while (true) {
                                                    match = regx.exec(marked(block.value))
                                                    if (match == null) break;
                                                    t.push(<p key={'paragraph_' + count++} dangerouslySetInnerHTML={{__html: match[1]}}/>);
                                                }
                                                return t;
                                            case BlockContentTypes.HEADER:
                                                return <h2 key={"block" + block.id}>{block.value}</h2>;
                                            case BlockContentTypes.LEAD:
                                                return <div key={"block" + block.id} className='lead' 
                                                            dangerouslySetInnerHTML={{__html: marked(block.value)}}/>;
                                            case BlockContentTypes.PHRASE:
                                                return <div ref={this.processPhrase.bind(this)} 
                                                            key={"block" + block.id} className='phrase' 
                                                            dangerouslySetInnerHTML={{__html: marked(block.value)}}/>;
                                            case BlockContentTypes.PHOTO:
                                                let photos = block.photos.map((photo: any, index: number) => {
                                                    let photoData = this.state.article.imageMap[photo.id];
                                                    if (photoData) {
                                                        return {
                                                            id: photo.id,
                                                            preview: index <= 2 ? photoData.medium : photoData.small,
                                                            image: photo.is_animated && block.photos.length == 1 ? photoData.original : photoData.regular,
                                                            caption: photo.caption || '',
                                                            isAnimated: photo.is_animated
                                                        }
                                                    } else {
                                                        return null;
                                                    }
                                                    
                                                });
                                                if (this.props.match.params.galleryBlockId && this.props.match.params.galleryBlockId == block.id) {
                                                    this.openGalleryModal(0, photos);
                                                }
                                                return (
                                                    <div
                                                        key={"block" + block.id} id={block.id} 
                                                        className={"photos photos_" + block.photos.length}>
                                                        {photos.map((photo: any, index: number) => {
                                                            if (!photo) return null;
                                                            if (process.env.IS_BROWSER) {
                                                                let className = 'photo photo_' + index;
                                                                if (photo.isAnimated) className += ' photo_animated';
                                                                return (
                                                                    <div 
                                                                        ref={this.processPhoto.bind(this, photo, this.openGalleryModal.bind(this, index, photos, block.id))}
                                                                        key={"photo" + index}
                                                                        className={"photo photo_" + index + (photo.is_animated ? ' photo_animated' : '')}></div>
                                                                );
                                                            } else {
                                                                if (photo.is_animated) className += ' photo_animated';
                                                                return (
                                                                    <img 
                                                                        key={"photo" + index}  
                                                                        className={"photo photo_" + index + (photo.is_animated ? ' photo_animated' : '')}
                                                                        alt={photo.caption || ''}
                                                                        src={photo.preview}/>
                                                                );
                                                            }
                                                            
                                                        })}
                                                        <div key={"clear" + i} style={{clear: 'both'}}/>
                                                        {block.photos.length == 1 && block.photos[0].caption ? 
                                                            <div 
                                                                key={"caption" + block.id} 
                                                                className="caption">{block.photos[0].caption}</div> : null
                                                        }
                                                        {block.photos.length > 6 ? 
                                                            <div 
                                                                key={"caption" + block.id} 
                                                                className="caption">Галерея из {block.photos.length} фото</div> : null
                                                        }
                                                    </div>
                                                );
                                            case BlockContentTypes.LIST:
                                                return <div key={"block" + block.id} dangerouslySetInnerHTML={{__html: marked(block.value)}}/>;
                                            case BlockContentTypes.QUOTE:
                                                let className = block.image && block.image.image ? 'personal': ''
                                                return (
                                                    <blockquote 
                                                        ref={this.processQuote.bind(this)} 
                                                        key={"block" + block.id} className={className}>
                                                        {block.image && block.image.image ? 
                                                            <img src={block.image.image}/> : null
                                                        }
                                                        <div dangerouslySetInnerHTML={{__html: marked(block.value)}}/>
                                                    </blockquote>
                                                );
                                            case BlockContentTypes.COLUMNS:
                                                return (
                                                    <div key={"block" + block.id} className="columns">
                                                        <div className="column">
                                                            {block.image ? 
                                                                <img src={block.image.image}/> : 
                                                                <div className="column__empty_image">
                                                                    {block.value.match(/\w/) ? block.value.match(/\w/)[0] : ''}
                                                                </div>
                                                            }
                                                        </div>
                                                        <div className="column" 
                                                             dangerouslySetInnerHTML={{__html: marked(block.value)}}/>
                                                    </div>
                                                );
                                            case BlockContentTypes.VIDEO:
                                                return (
                                                    block.__meta && block.__meta.embed ?
                                                        <div 
                                                            ref={this.processEmbed.bind(this, block)} 
                                                            key={"block" + block.id} 
                                                            className="embed video" 
                                                            dangerouslySetInnerHTML={{__html: block.__meta.embed}}/> : null
                                                );
                                            
                                            case BlockContentTypes.AUDIO:
                                                return (
                                                    block.__meta && block.__meta.embed ?
                                                        <div 
                                                            ref={this.processEmbed.bind(this, block)} 
                                                            key={"block" + block.id} 
                                                            className="embed audio" 
                                                            dangerouslySetInnerHTML={{__html: block.__meta.embed}}/> : null
                                                );
                                            
                                            case BlockContentTypes.POST:
                                                return (
                                                    block.__meta && block.__meta.embed ?
                                                        <div 
                                                            ref={this.processEmbed.bind(this, block)} 
                                                            key={"block" + block.id}
                                                            className="embed post"
                                                            dangerouslySetInnerHTML={{__html: block.__meta.embed}}/> : null
                                                );
                                            case BlockContentTypes.DIALOG:
                                                let participants: any = {};
                                                block.participants.forEach((participant: any) => {
                                                    participants[participant.id] = participant;
                                                });
                                                return (
                                                    <div key={"block" + block.id} className="dialogue">
                                                        {block.remarks.map((remark: any, index: number): any => {
                                                            if (!remark.value.length) return null;
                                                            let participant = participants[remark.participant_id];
                                                            if (!participant) return null;

                                                            let className = 'remark';
                                                            if (participant.is_interviewer) className += ' question';
                                                            return (
                                                                <div key={"remark" + index} className={className}>
                                                                    {participant.avatar && participant.avatar.image ?
                                                                        <img src={participant.avatar.image}/> : 
                                                                        <span data-name={participant.name[0]}></span>
                                                                    }   
                                                                    {remark.value}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )
                                        }
                                    })}
                                    
                                    {/* FOOTER */}
                                    <div id="article__footer" className="article__footer">
                                        <div className="article__footer_content">
                                            <Link to={authorLink} className="article__author">
                                                {this.state.article.owner.avatar ?
                                                    <img className="article__avatar" src={this.state.article.owner.avatar}/> : null
                                                }
                                                {this.state.article.owner.first_name}&nbsp;{this.state.article.owner.last_name}
                                            </Link>
                                        </div>
                                    </div>


                                </div>
                            }
                             <div className="banner_container_side">
                                <div className="banner_container_side__sticky"></div>
                            </div> 

                            {this.state.isDesktop && !this.props.isPreview ?
                                <div className="share_container">
                                    <ShareFloatingPanel
                                        key={"share" + this.state.article.id} 
                                        articleElementId={"article" + this.state.article.id}
                                        articleUrl={this.state.article.short_url}/>
                                </div> : null
                            }
                        </div>

                         {/* FOOTER 
                        <div id="article__footer" className="article__footer">
                            <div className="article__footer_content">
                                <Link to={authorLink} className="article__author">
                                    {this.state.article.owner.avatar ?
                                        <img className="article__avatar" src={this.state.article.owner.avatar}/> : null
                                    }
                                    {this.state.article.owner.first_name}&nbsp;{this.state.article.owner.last_name}
                                </Link>
                            </div>
                        </div> */}

                        {/* FOOTER BANNER */}
                        {this.state.article.ads_enabled ?
                            <div id={BannerID.BANNER_BOTTOM} className="banner_container"></div> : null
                        }

                        {!this.state.isDesktop ?
                            <div className="article__shares_btn" onClick={this.openSharePopup.bind(this)}>
                                <ShareButton/>Поделиться
                            </div> : null
                        }

                        {this.state.isDesktop && this.props.isPreview ?
                            <div key={"tools" + this.state.article.id} className="left_tool_panel">
                                <LeftSideButton key="toolPublish"
                                                tooltip="Опубликовать"
                                                onClick={this.publishArticle.bind(this)}>
                                    <PublishButton/>
                                </LeftSideButton>
                                <LeftSideButton key="toolEdit"
                                                tooltip="Редактировать"
                                                onClick={this.route.bind(this, `/articles/${this.state.article.id}/edit`)}>
                                    <EditBlackButton/>
                                </LeftSideButton>
                            </div> : null}
                        {this.state.isDeskto && !this.props.isPreview && this.state.user && this.state.article.owner.id == this.state.user.id ?
                            <div key={"tools" + this.state.article.id} className="left_tool_panel">
                                <LeftSideButton key="toolEdit"
                                                tooltip="Редактировать"
                                                onClick={this.route.bind(this, `/articles/${this.state.article.id}/edit`)}>
                                    <EditBlackButton/>
                                </LeftSideButton>
                            </div> : null}

                    </div> : <div className="article__loading"><Loading/></div>
                : this.state.error
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


interface IGalleryModalProps {
    isPreview?: boolean;
    article?: IArticle;
    router?: any;
    photos: IPhoto[];
    currentPhotoIndex: number;
}

type SwipingDirection = 'left' | 'right';

interface IGalleryModalState {
    currentPhotoIndex?: number,
    isDesktop?: boolean,
    swipingDirection?: SwipingDirection | null;
}


class GalleryModal extends React.Component<IGalleryModalProps|any, IGalleryModalState|any> {
    refs: {
        image: HTMLDivElement
    };

    constructor(props: any) {
        super(props);
        this.state = {
            currentPhotoIndex: this.props.currentPhotoIndex,
            isDesktop: MediaQuerySerice.getIsDesktop(),
            swipingDirection: null
        };
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
    }

    back() {
        ModalAction.do(CLOSE_MODAL, null);
        if (!this.props.isPreview) {
            window.history.pushState(null, null, (window.history as any).previous)
        }
    }

    nextPhoto() {
        this.state.currentPhotoIndex++;
        if (this.state.currentPhotoIndex >= this.props.photos.length) {
            this.state.currentPhotoIndex = 0;
        }
        this.setState({currentPhotoIndex: this.state.currentPhotoIndex, swipingDirection: null});
    }

    prevPhoto() {
        this.state.currentPhotoIndex--;
        if (this.state.currentPhotoIndex < 0) {
            this.state.currentPhotoIndex = this.props.photos.length - 1;
        }
        this.setState({currentPhotoIndex: this.state.currentPhotoIndex, swipingDirection: null});
    }

    getPrevPhotoIndex() {
        if (this.props.photos.length < 2) {
            return null;
        } else if (this.props.photos.length == 2 && this.state.currentPhotoIndex == 1) {
            return 0;
        } else {
            return this.state.currentPhotoIndex == 0 ? this.props.photos.length - 1 : this.state.currentPhotoIndex - 1;
        }
    }

    getNextPhotoIndex() {
        if (this.props.photos.length < 2) {
            return null;
        } else if (this.props.photos.length == 2 && this.state.currentPhotoIndex == 0) {
            return 1;
        } else {
            return this.state.currentPhotoIndex == this.props.photos.length - 1 ? 0 : this.state.currentPhotoIndex + 1;
        }
    }

    getImageStyle(index: number) {
        if (index == null) {
            return {background: 'transparent'};
        } else {
            return {background: `url('${this.props.photos[index].image}') no-repeat center center`};
        }
    }

    handleMediaQuery(isDesktop: boolean) {
        if (this.state.isDesktop != isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    handleSwipingRight(e: any, deltaX: number) {
        this.setState({swipingDirection: 'right'}, () => {
            this.refs.image.style.left = deltaX * 0.1 + 'px';
        });
    }

    handleSwipingLeft(e: any, deltaX: number) {
        this.setState({swipingDirection: 'left'}, () => {
            this.refs.image.style.left = -deltaX * 0.1 + 'px';
        });
    }

    handleSwipeRight() {
        this.prevPhoto();
    }

    handleSwipeLeft() {
        this.nextPhoto();
    }

    handleSwipe() {
        this.setState({swipingDirection: null}, () => {
            this.refs.image.style.left = "0";
        });
    }

    lazyLoad(index: number, el: HTMLElement) {
        // let img = new Image();
        // img.onload = () => {
        //     el.style.background = `url('${this.props.photos[index].image}') no-repeat center center`;
        // };
        // img.src = this.props.photos[index].image;
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.handleMediaQuery);
    }

    render() {
        let photo = this.props.photos[this.state.currentPhotoIndex];
        return (
            <div className="gallery_modal">
                {this.state.isDesktop ?
                    <div className="gallery_modal__header">
                        <div className="gallery_modal__prev" onClick={this.prevPhoto.bind(this)}>
                            <ArrowButton/> НАЗАД
                        </div>
                        <div className="gallery_modal__counter">
                            {this.state.currentPhotoIndex + 1}/{this.props.photos.length}
                        </div>
                        <div className="gallery_modal__next" onClick={this.nextPhoto.bind(this)}>
                            ДАЛЕЕ <ArrowButton/>
                        </div>
                        <div className="gallery_modal__close" onClick={this.back.bind(this)}><CloseIcon/></div>
                    </div> :
                    <div className="gallery_modal__header">
                        <BackButton className="gallery_modal__back" onClick={this.back.bind(this)}/>
                        <div className="gallery_modal__counter">
                            {this.state.currentPhotoIndex + 1}/{this.props.photos.length}
                        </div>
                    </div>
                }

                {this.state.isDesktop ?
                    <div className="gallery_modal__viewport">
                        {this.getPrevPhotoIndex() != null ?
                            <div className="gallery_modal__img gallery_modal__image_prev"
                                 style={this.getImageStyle(this.getPrevPhotoIndex())}
                                 onClick={this.prevPhoto.bind(this)}></div> :
                            <div className="gallery_modal__image_prev empty"></div>
                        }
                        <div ref={this.lazyLoad.bind(this, this.state.currentPhotoIndex)}
                             className="gallery_modal__img gallery_modal__image"
                             style={this.getImageStyle(this.state.currentPhotoIndex)}
                             onClick={this.nextPhoto.bind(this)}/>
                        {this.getNextPhotoIndex() != null ?
                            <div className="gallery_modal__img gallery_modal__image_next"
                                 style={this.getImageStyle(this.getNextPhotoIndex())}
                                 onClick={this.nextPhoto.bind(this)}></div> :
                            <div className="gallery_modal__image_next empty"></div>
                        }
                    </div> :
                    <Swapeable nodeName="span"
                               delta={30}
                               onSwipingRight={this.handleSwipingRight.bind(this)}
                               onSwipingLeft={this.handleSwipingLeft.bind(this)}
                               onSwipedRight={this.handleSwipeRight.bind(this)}
                               onSwipedLeft={this.handleSwipeLeft.bind(this)}
                               onSwiped={this.handleSwipe.bind(this)}>
                        <div ref="image"
                             className={"gallery_modal__image" + (this.state.swipingDirection? ' ' + this.state.swipingDirection: '')}
                             style={this.getImageStyle(this.state.currentPhotoIndex)}
                             onClick={this.nextPhoto.bind(this)}/>
                    </Swapeable>

                }
                {photo.caption ? <div className="gallery_modal__caption">{photo.caption}</div> : null}
            </div>
        );
    }
}

class ShareFloatingPanel extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            scrollDelta: 0,
        };
        // this.handleScroll = this.handleScroll.bind(this);
    }

    refs: {
        el: HTMLDivElement
    };

    // handleScroll() {
    //     let rect = this.refs.el.getBoundingClientRect();
    //     let articleRect = document.getElementById(this.props.articleElementId).getBoundingClientRect();
    //     console.log(articleRect)
    //     if (rect && articleRect) {
    //         let visible = articleRect.top <= -100;
    //         visible ? this.refs.el.classList.add('visible') : this.refs.el.classList.remove('visible');
            // let snapToBottom = rect.bottom < 0 ||rect.bottom >= articleRect.bottom;
            // console.log(this.props.articleElementId, rect.bottom, articleRect.bottom)
            // snapToBottom ? this.refs.el.classList.add('snap') : this.refs.el.classList.remove('snap');
        // }
    // }

    // componentDidMount() {
    //     window.addEventListener('scroll', this.handleScroll);
    // }

    // componentWillUnmount() {
    //     window.removeEventListener('scroll', this.handleScroll);
    // }

    render() {
        let className = 'share_panel visible';
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

export class ArticlePreview extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        let props = Object.assign({}, this.props, {isPreview: true});
        return <Article {...props}/>;
    }
}