import * as React from "react";
import {Link} from 'react-router';
import {IContentData} from "../actions/editor/ContentAction";
import {api} from "../api";
import Error from "./Error";
import {UserAction, LOGIN, LOGOUT, UPDATE_USER, SAVE_USER} from "../actions/user/UserAction";
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from "../actions/shared/ModalAction";
import * as moment from 'moment';
import SocialIcon from "./shared/SocialIcon";
import {MediaQuerySerice} from "../services/MediaQueryService";
import FloatingPanel from "./shared/FloatingPanel";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../actions/shared/PopupPanelAction";
import * as Swapeable from 'react-swipeable';
import PopupPrompt from "./shared/PopupPrompt";
import {NotificationAction, SHOW_NOTIFICATION} from "../actions/shared/NotificationAction";
import Loading from "./shared/Loading";
import "../styles/article.scss";
import "../styles/banners.scss";

const EditButton = require('babel!svg-react!../assets/images/edit.svg?name=EditButton');
const DeleteButton = require('babel!svg-react!../assets/images/redactor_icon_delete.svg?name=DeleteButton');
const BackButton = require('babel!svg-react!../assets/images/back.svg?name=BackButton');
const ViewIcon = require('babel!svg-react!../assets/images/views_white.svg?name=ViewIcon');
const CloseIcon = require('babel!svg-react!../assets/images/close_white.svg?name=CloseIcon');
const ArrowButton = require('babel!svg-react!../assets/images/arrow.svg?name=ArrowButton');
const ShareButton = require('babel!svg-react!../assets/images/share.svg?name=ShareButton');
const EditBlackButton = require('babel!svg-react!../assets/images/edit_black.svg?name=EditBlackButton');
const PublishButton = require('babel!svg-react!../assets/images/publish.svg?name=PublishButton');



interface IPhoto {id: number, image: string, preview?: string, caption?: string}


interface IArticle {
    id: number
    slug: string
    title: string
    cover: {id: number, image: string} | null
    blocks: IContentData[]
    html: string
    published_at: string
    date?: string
    views: number
    owner: {
        id: number,
        first_name: string,
        last_name: string,
        avatar: string
    },
    images: IPhoto[]
    url: string
    ads_enabled?: boolean
}

interface IArticleProps {
    isPreview?: boolean,
    params?: any,
    router?: any
}

interface IArticleState {
    article?: IArticle | null
    error?: any
    isSelf?: boolean
    isDesktop?: boolean
    floatingBanner?: any
    topBanner?: any
}

export default class Article extends React.Component<IArticleProps, IArticleState> {
    refs: {
        ad_250x400: HTMLDivElement
    };

    constructor(props: any) {
        super(props);
        this.state = {
            article: null,
            isSelf: false,
            isDesktop: MediaQuerySerice.getIsDesktop(),
            floatingBanner: null
        };
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
    }

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
        if (this.props.isPreview && !article.published_at) {
            article.date = moment().locale('ru').calendar(null, {
                sameDay: 'Сегодня, LT',
                lastDay: 'Вчера, LT',
                sameElse: 'DD MMMM YYYY',
                lastWeek: 'DD MMMM YYYY'
            });
        } else {
            article.date = moment(article.published_at).locale('ru').calendar(null, {
                sameDay: 'Сегодня, LT',
                lastDay: 'Вчера, LT',
                sameElse: 'DD MMMM YYYY',
                lastWeek: 'DD MMMM YYYY'
            });
        }
        return article;
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

    processTitle() {
        let title = document.getElementsByClassName('article__title')[0] as HTMLHeadElement;
        if (title && title.innerText) {
            if (title.innerText.length > 100) {
                title.classList.add('long');
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
        try {
            let posts = document.getElementsByClassName('embed post');
            for (let i in posts) {
                // TWITTER LOAD EMBED
                twttr.widgets && twttr.widgets.load(posts[i]);
            }
        } catch (err) {
            console.log('TWITTER EMBED LOADING ERROR', err);
        }
        try {
            // INSTAGRAM LOAD EMBED
            instgrm.Embeds.process();
        } catch (err) {
            console.log('INSTAGRAM EMBED LOADING ERROR', err);
        }
    }

    openGalleryModal(currentPhotoIndex: number, photos: any[]) {
        ModalAction.do(OPEN_MODAL, {content: <GalleryModal currentPhotoIndex={currentPhotoIndex} photos={photos}/>});
    }

    processPhoto() {
        let galleries = document.getElementsByClassName('photos');
        for (let i in galleries) {
            try {
                let gallery = galleries[i];
                let photos = gallery.getElementsByClassName('photo');
                let photoData: IPhoto[] = [];
                for (let i in photos) {
                    let photo = photos[i];
                    this.state.article.images.forEach((image) => {
                        if (image.id == parseInt(photo.getAttribute('data-id'))) {
                            image.caption = photo.getAttribute('data-caption');
                            photoData.push(image);
                        }
                    });
                    photo.addEventListener('click', this.openGalleryModal.bind(this, parseInt(i), photoData));
                }
            } catch (err) {}
        }
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

    processes() {
        this.processTitle();
        this.processPhoto();
        this.processEmbed();
        this.processQuote();
        this.processPhrase();
        this.processAds();
    }

    loadArticle(data: IArticle) {
        let isSelf = UserAction.getStore().user ? UserAction.getStore().user.id == data.owner.id : false;
        this.setState({article: this.processArticle(data), isSelf: isSelf}, () => {
            window.setTimeout(() => {
                this.processes();
            }, 50);
            if (this.state.article.ads_enabled) {
                api.get('/banners/250x400/').then((response: any) => {
                    this.setState({floatingBanner: response.data.code});
                }).catch((err) => {
                    console.log(err);
                });
                api.get('/banners/320x100/').then((response: any) => {
                    this.setState({topBanner: response.data.code});
                }).catch((err) => {
                    console.log(err);
                });

            }
            document.title = this.state.article.title;
        });
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
                    case 404:
                        this.setState({error: <Error code={404} msg="Article not found"/>})
                        break;
                    default:
                        this.setState({error: <Error/>})
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
                        this.setState({error: <Error code={404} msg="Article not found"/>});
                        break;
                    case 401:
                        this.setState({error: <Error code={401} msg="You haven't access to this article. Sorry."/>});
                        break;
                    default:
                        this.setState({error: <Error/>})
                }
            }
        });
    }

    processAds() {
        if (this.refs.ad_250x400) {
            console.log('PROCESS ADS');
            try {
                let script = this.refs.ad_250x400.getElementsByTagName('script')[0].innerText;
                let f = new Function(script);
                f();
            } catch(err) {
                console.log(err);
            }
        }
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

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.handleMediaQuery);
        UserAction.unbind([LOGIN, LOGOUT, UPDATE_USER, SAVE_USER], this.handleUser);
    }

    render() {
        let coverStyle = {};
        if (this.state.article && this.state.article.cover) {
            coverStyle = {
                background: `url('${this.state.article.cover}') no-repeat center center`
            }
        }
        return (
            !this.state.error ?
                this.state.article ?
                    <div id={"article" + this.state.article.id} className="article">
                        {this.state.article.ads_enabled ?
                            <div className="banner banner__top"></div>: null
                        }
                        <div className={"article__title" + (this.state.article.cover ? ' inverted' : '')} style={coverStyle}>
                            {!this.state.isDesktop ?
                                <div className="article__author">
                                    Автор:&nbsp;
                                    <Link to={`/profile/${this.state.article.owner.id}`}>
                                        {this.state.article.owner.first_name} {this.state.article.owner.last_name}
                                    </Link>
                                </div> : null
                            }
                            <h1>{this.state.article.title}</h1>
                            <div className="article__stats">
                                {this.state.isDesktop ?
                                    <div className="article__author1">
                                        Автор:&nbsp;
                                        <Link to={`/profile/${this.state.article.owner.id}`}>
                                            {this.state.article.owner.first_name} {this.state.article.owner.last_name}
                                        </Link>
                                    </div> : null
                                }
                                <div className="article__date">{this.state.article.date}</div>
                                <div className="article__views">
                                    <ViewIcon/> {this.state.article.views}
                                </div>
                            </div>
                        </div>
                        <div className="article__content_wrapper">
                            <div className="article__content" dangerouslySetInnerHTML={{__html: this.state.article.html}}/>
                            {this.state.isDesktop && this.state.floatingBanner ?
                                <FloatingPanel className="ad_250x400" fixed={true}>
                                    <div ref="ad_250x400" dangerouslySetInnerHTML={{__html: this.state.floatingBanner}}></div>
                                </FloatingPanel> : null
                            }
                        </div>

                        <div className="article__footer">
                            <div className="article__footer_content">
                                <Link to={`/profile/${this.state.article.owner.id}`} className="article__author">
                                    {this.state.article.owner.avatar ?
                                        <img className="article__avatar" src={this.state.article.owner.avatar}/> : null
                                    }
                                    {this.state.article.owner.first_name}&nbsp;{this.state.article.owner.last_name}
                                </Link>
                            </div>
                        </div>
                        {this.state.article.ads_enabled ?
                            <div className="banner banner__content"></div> : null
                        }

                        {!this.state.isDesktop ?
                            <div className="article__shares_btn" onClick={this.openSharePopup.bind(this)}>
                                <ShareButton/>Поделиться
                            </div> : null
                        }
                        {this.state.isDesktop ?
                            <ShareFloatingPanel articleUrl={this.state.article.url}/> : null}
                        {this.state.isDesktop && this.props.isPreview ?
                            <div className="tools_panel">
                                <div className="tools_panel__item">
                                    <div className="tools_panel__caption">Редактировать</div>
                                    <Link to={`/articles/${this.props.params.articleId}/edit`}
                                          className="tools_panel__icon"><EditBlackButton/></Link>
                                </div>
                                <div className="tools_panel__item">
                                    <div className="tools_panel__caption">Опубликовать</div>
                                    <div onClick={this.publishArticle.bind(this)}
                                         className="tools_panel__icon"><PublishButton/></div>
                                </div>
                            </div> : null}
                        {this.state.isDesktop && !this.props.isPreview && moment().isBefore(moment(this.state.article.published_at).add(12, 'hours')) ?
                            <div className="tools_panel">
                                <div className="tools_panel__item">
                                    <div className="tools_panel__caption">Редактировать</div>
                                    <Link to={`/articles/${this.state.article.id}/edit`}
                                          className="tools_panel__icon"><EditBlackButton/></Link>
                                </div>
                            </div> : null
                        }
                    </div>
                    :
                    <div className="article__loading">
                        {/*<span>СТАТЬЯ</span> ЗАГРУЖАЕТСЯ...*/}
                        <Loading/>
                    </div>
                : this.state.error
        )
    }
}


interface IGalleryModalProps {
    photos: IPhoto[],
    currentPhotoIndex: number,
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
        console.log('SWIPE RIGHT');
        this.prevPhoto();
    }

    handleSwipeLeft() {
        console.log('SWIPE LEFT');
        this.nextPhoto();
    }

    handleSwipe() {
        this.setState({swipingDirection: null}, () => {
            this.refs.image.style.left = "0";
        });
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
                            <div className="gallery_modal__image_prev"
                                 style={this.getImageStyle(this.getPrevPhotoIndex())}
                                 onClick={this.prevPhoto.bind(this)}></div> :
                            <div className="gallery_modal__image_prev empty"></div>
                        }
                        <div className="gallery_modal__image"
                             style={this.getImageStyle(this.state.currentPhotoIndex)}
                             onClick={this.nextPhoto.bind(this)}/>
                        {this.getNextPhotoIndex() != null ?
                            <div className="gallery_modal__image_next"
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
        let visible = window.pageYOffset >= 360;
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
                <a href={"https://telegram.me/share/url?url=" + this.props.articleUrl}
                   className="share_panel__share_btn"><SocialIcon social="telegram"/></a>
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