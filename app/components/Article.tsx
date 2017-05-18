import * as React from "react";
import {Link} from "react-router";
import {IContentData} from "../actions/editor/ContentAction";
import {api} from "../api";
import Error, {Error404, Error500, Error403} from "./Error";
import {UserAction, LOGIN, LOGOUT, UPDATE_USER, SAVE_USER} from "../actions/user/UserAction";
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from "../actions/shared/ModalAction";
import * as moment from "moment";
import SocialIcon from "./shared/SocialIcon";
import {MediaQuerySerice} from "../services/MediaQueryService";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../actions/shared/PopupPanelAction";
import * as Swapeable from "react-swipeable";
import PopupPrompt from "./shared/PopupPrompt";
import {NotificationAction, SHOW_NOTIFICATION} from "../actions/shared/NotificationAction";
import Loading from "./shared/Loading";
import "../styles/article.scss";
import "../styles/banners.scss";
import {BannerID, Captions} from "../constants";
import LeftSideButton from "./shared/LeftSideButton";

const EditButton = require('babel!svg-react!../assets/images/edit.svg?name=EditButton');
const DeleteButton = require('babel!svg-react!../assets/images/redactor_icon_delete.svg?name=DeleteButton');
const BackButton = require('babel!svg-react!../assets/images/back.svg?name=BackButton');
const ViewIcon = require('babel!svg-react!../assets/images/views_white.svg?name=ViewIcon');
const CloseIcon = require('babel!svg-react!../assets/images/close_white.svg?name=CloseIcon');
const ArrowButton = require('babel!svg-react!../assets/images/arrow.svg?name=ArrowButton');
const ShareButton = require('babel!svg-react!../assets/images/share.svg?name=ShareButton');
const EditBlackButton = require('babel!svg-react!../assets/images/edit-small.svg?name=EditBlackButton');
const PublishButton = require('babel!svg-react!../assets/images/publish.svg?name=PublishButton');
const ConfirmButton = require('babel!svg-react!../assets/images/editor_confirm.svg?name=ConfirmButton');


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
    images: IPhoto[]
    url: string;
    short_url?: string;
    ads_enabled?: boolean,
    advertisement?: any,
    inverted_theme?: boolean
}

interface IArticleProps {
    isPreview?: boolean,
    params?: any,
    router?: any
}

interface IArticleState {
    article?: IArticle | null;
    error?: any;
    isSelf?: boolean;
    isDesktop?: boolean;
}

export default class Article extends React.Component<IArticleProps, IArticleState> {
    constructor(props: any) {
        super(props);
        this.state = {
            article: null,
            isSelf: false,
            isDesktop: MediaQuerySerice.getIsDesktop(),
        };
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
    }

    refs: {
        shortUrlInput: HTMLInputElement
    };

    static defaultProps = {
        isPreview: false
    };

    handleUser() {
        let user = UserAction.getStore().user;
        if (user && this.state.article) {
            this.setState({isSelf: user.id == this.state.article.owner.id});
        }
    }

    editArticle() {
        this.state.article && this.props.router.push(`/articles/${this.state.article.id}/edit`);
    }

    processArticle(article: IArticle) {
        let calendarParams = {
            sameDay: 'Сегодня, LT',
            lastDay: 'Вчера, LT',
            sameElse: 'DD MMMM YYYY, LT',
            lastWeek: 'DD MMMM YYYY, LT'
        };
        if (this.props.isPreview && !article.published_at) {
            article.date = moment().locale('ru').calendar(null, calendarParams);
        } else {
            article.date = moment(article.published_at).locale('ru').calendar(null, calendarParams);
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

    processQuote() {
        let quotes = document.getElementsByTagName('blockquote');
        for (let i in quotes) {
            let quote = quotes[i] as HTMLElement;
            if (quote.innerText && quote.innerText.length > 500) {
                quote.classList.add('long');
            }
        }
    }

    processPhrase() {
        let phrases = document.getElementsByClassName('phrase');
        for (let i in phrases) {
            let phrase = phrases[i] as HTMLElement;
            if (phrase && phrase.innerText) {
                if (phrase.innerText.length <= 70) {
                    phrase.classList.add('short');
                } else if (phrase.innerText.length > 200) {
                    phrase.classList.add('long');
                }
            }
        }
    }

    processColumn() {
        let columns = document.getElementsByClassName('column');
        for (let i in columns) {
            let column = columns[i] as HTMLElement;
            if (column && column.innerText) {
                if (column.innerText.length > 500) {
                    column.classList.add('long');
                }
            }
        }
    }

    processEmbed() {
        let videoEmbeds = document.getElementsByClassName('embed video');
        for (let i in videoEmbeds) {
            let video = videoEmbeds[i] as HTMLDivElement;
            if (video) {
                try {
                    video.style.height = video.offsetWidth * 450 / 800 + 'px';
                    let iframe = video.getElementsByTagName('iframe')[0];
                    if (iframe) {
                        iframe.addEventListener('load', () => {
                            iframe.style.height = iframe.offsetWidth * 450 / 800 + 'px';
                            video.style.visibility = "visible";
                        });
                    }
                } catch (err) {

                }
            }
        }
        let posts = document.getElementsByClassName('embed post');
        for (let i in posts) {
            try {
                twttr.widgets && twttr.widgets.load(posts[i]);
            } catch (err) {}
            try {
                let script = posts[i].getElementsByTagName('script')[0];
                if (script) {
                    let f = new Function(script.innerText);
                    f();
                }
            } catch (err) {}
        }
        try {
            // INSTAGRAM LOAD EMBED
            instgrm.Embeds.process();
        } catch (err) {
            // console.log('INSTAGRAM EMBED LOADING ERROR', err);
        }
    }

    processAds() {
        if (!this.state.article || !this.state.article.advertisement) return;
        let ads = this.state.article.advertisement[this.state.isDesktop ? 'desktop' : 'mobile'];
        let articleElement = document.getElementById("article" + this.state.article.id);
        for (let k in ads) {
            let banners = ads[k];
            let bannersElements = articleElement.getElementsByClassName(k);
            if (bannersElements.length && banners.length) {
                banners.forEach((banner: any, index: number) => {
                    if (index < bannersElements.length) {
                        let bannerElement = bannersElements[index];
                        bannerElement.innerHTML = banner.code;
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
                });
            }
        }
    }

    processPhoto() {
        let galleries = document.getElementsByClassName('photos');
        for (let i = 0; i < galleries.length; i++) {
            try {
                let gallery = galleries[i] as HTMLElement;
                let photos = gallery.getElementsByClassName('photo');
                let photoData: IPhoto[] = [];
                for (let i = 0; i < photos.length; i++) {
                    let photo = photos[i];
                    photoData.push({
                        id: parseInt(photo.getAttribute('data-id')),
                        preview: photo.getAttribute('data-preview'),
                        image: photo.getAttribute('data-src'),
                        caption: photo.getAttribute('data-caption'),
                    });
                    if (i < 6) {
                        let img = document.createElement('img');
                        img.onload = () => {
                            gallery.replaceChild(img, photo);
                        };
                        img.className = photo.getAttribute('class');
                        img.src = photo.getAttribute('data-src');
                        img.alt = photo.getAttribute('data-caption');
                        img.addEventListener('click', this.openGalleryModal.bind(this, i, photoData, gallery.getAttribute('id')));
                    }
                }
                if (this.props.params.galleryBlockId && this.props.params.galleryBlockId == gallery.getAttribute('id')) {
                    this.openGalleryModal(0, photoData);
                }
            } catch (err) {}
        }
    }

    processes() {
        this.processPhoto();
        this.processEmbed();
        this.processQuote();
        this.processPhrase();
        this.processAds();
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
            this.props.router.push(`/articles/${this.state.article.slug}/gallery/${galleryId}`);
        }
        ModalAction.do(OPEN_MODAL, {content: <GalleryModal isPreview={this.props.isPreview}
                                                           currentPhotoIndex={currentPhotoIndex}
                                                           photos={photos}
                                                           router={this.props.router}
                                                           article={this.state.article}/>});
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
            this.setState({isDesktop: isDesktop});
        }
    }

    loadArticle(data: IArticle) {
        let isSelf = UserAction.getStore().user ? UserAction.getStore().user.id == data.owner.id : false;
        let articleContent = this.processArticle(data);
        this.setState({article: articleContent, isSelf: isSelf}, () => {
            window.setTimeout(() => {
                this.processes();
            }, 100);
            document.title = this.state.article.title;
        });
    }

    coverLazyLoad(el: HTMLElement) {
        if (this.state.article && this.state.article.cover) {
            let img = new Image();
            img.onload = () => {
                el.style.background = `url('${this.state.article.cover}') no-repeat center center`;
            };
            img.src = this.state.article.cover;
        }
    }

    _publish() {
        api.post(`/articles/editor/${this.props.params.articleId}/publish/`).then((response: any) => {
            NotificationAction.do(SHOW_NOTIFICATION, {content: 'Поздравляем, ваш материал опубликован.'});
            this.props.router.push(`/articles/${this.state.article.slug}/`);
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
        api.get(`/articles/${this.props.params.articleSlug}/`).then((response: any) => {
            let data = response.data;
            this.loadArticle(data);
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
        api.get(`/articles/${this.props.params.articleId}/preview/`).then((response: any) => {
            let data = response.data;
            this.loadArticle(data);
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

    route(url: string) {
        this.props.router.push(url);
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.handleMediaQuery);
        UserAction.onChange([LOGIN, LOGOUT, UPDATE_USER, SAVE_USER], this.handleUser);
        if (this.props.isPreview) {
            this.retrieveArticlePreview();
        } else {
            this.retrieveArticle();
        }
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.isPreview) {
            if (nextProps.params.articleId != this.props.params.articleId) {
                this.retrieveArticlePreview();
            }
        } else {
            if (!nextProps.params.galleryBlockId) {
                ModalAction.do(CLOSE_MODAL, null);
            } else if (nextProps.params.galleryBlockId != this.props.params.galleryBlockId) {
                this.processPhoto();
            }
            if (nextProps.params.articleSlug != this.props.params.articleSlug) {
                this.retrieveArticle();
            }
        }
    }

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.handleMediaQuery);
        UserAction.unbind([LOGIN, LOGOUT, UPDATE_USER, SAVE_USER], this.handleUser);
    }

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

        let shiftContentStyle = {};
        if (MediaQuerySerice.getScreenWidth() >= 1280 && this.getRightBanner()) {
            let offset = Math.min(0, 2 * ((MediaQuerySerice.getScreenWidth() - 650 ) / 2 - 400));
            if (offset) shiftContentStyle = {marginLeft: `${offset}px`};
        }

        return (
            !this.state.error ?
                this.state.article ?
                    <div id={"article" + this.state.article.id} className="article">
                        {/* SIDE BANNER */}
                        {this.state.isDesktop && this.state.article.ads_enabled
                            && this.getRightBanner() ?
                            <div className={"banner " + BannerID.BANNER_RIGHT_SIDE}></div> : null
                        }

                        {/* TITLE BLOCK */}
                        <div ref={this.coverLazyLoad.bind(this)} className={titleClassName}>
                            <div className="article__title_container" style={shiftContentStyle}>
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
                            <div className="article__content"
                                 style={shiftContentStyle}
                                 dangerouslySetInnerHTML={{__html: this.state.article.html}}/>
                        </div>

                        {/* FOOTER */}
                        <div className="article__footer">
                            <div className="article__footer_content">
                                <Link to={authorLink} className="article__author">
                                    {this.state.article.owner.avatar ?
                                        <img className="article__avatar" src={this.state.article.owner.avatar}/> : null
                                    }
                                    {this.state.article.owner.first_name}&nbsp;{this.state.article.owner.last_name}
                                </Link>
                            </div>
                        </div>

                        {this.state.article.ads_enabled && this.getBanner(BannerID.BANNER_BOTTOM) ?
                            <div className="banner_container">
                                <div className={"banner " + BannerID.BANNER_BOTTOM} style={shiftContentStyle}></div>
                            </div> : null
                        }

                        {!this.state.isDesktop ?
                            <div className="article__shares_btn" onClick={this.openSharePopup.bind(this)}>
                                <ShareButton/>Поделиться
                            </div> : null
                        }

                        {this.state.isDesktop ?
                            <ShareFloatingPanel articleUrl={this.state.article.short_url}/> : null}

                        {this.state.isDesktop && this.props.isPreview ?
                            <div className="left_tool_panel">
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
                        {this.state.isDesktop && !this.props.isPreview && this.state.isSelf ?
                            <div className="left_tool_panel">
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

class ShareLinkButton extends React.Component<{shortUrl: string, className?: string}, {process?: boolean, copied?: boolean}> {
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

    static defaultProps = {
        className: ''
    };

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


class GalleryModal extends React.Component<IGalleryModalProps, IGalleryModalState> {
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
            this.props.router.push(`/articles/${this.props.article.slug}`);
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
            return {background: `url('${this.props.photos[index].preview}') no-repeat center center`};
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
        let imageStyle = {
            background: `url('${photo.image}') no-repeat center center`
        };
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
                             style={imageStyle}
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
            visible: false,
            scrollDelta: 0,
        };
        this.handleScroll = this.handleScroll.bind(this);
    }

    handleScroll() {
        let visible = window.pageYOffset >= 100;
        if (this.state.visible != visible) {
            this.setState({visible: visible});
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    render() {
        let className = 'share_panel';
        if (this.state.visible) {
            className += ' visible';
        }
        return (
            <div className={className}>
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