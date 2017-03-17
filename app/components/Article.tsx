import * as React from "react";
import {Link} from 'react-router';
import {IContentData} from "../actions/editor/ContentAction";
import {api} from "../api";
import Error from "./Error";
import {UserAction, LOGIN, LOGOUT, UPDATE_USER, SAVE_USER} from "../actions/user/UserAction";
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from "../actions/shared/ModalAction";
import * as moment from 'moment';
import "../styles/article.scss";
import SocialIcon from "./shared/SocialIcon";
import {MediaQuerySerice} from "../services/MediaQueryService";
import FloatingPanel from "./shared/FloatingPanel";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../actions/shared/PopupPanelAction";
import * as Swapeable from 'react-swipeable';

const EditButton = require('babel!svg-react!../assets/images/edit.svg?name=EditButton');
const DeleteButton = require('babel!svg-react!../assets/images/redactor_icon_delete.svg?name=DeleteButton');
const BackButton = require('babel!svg-react!../assets/images/back.svg?name=BackButton');
const ViewIcon = require('babel!svg-react!../assets/images/views_white.svg?name=ViewIcon');
const CloseIcon = require('babel!svg-react!../assets/images/close_white.svg?name=CloseIcon');
const ArrowButton = require('babel!svg-react!../assets/images/arrow.svg?name=ArrowButton');
const ShareButton = require('babel!svg-react!../assets/images/share.svg?name=ShareButton');



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

interface IArticleState {
    article?: IArticle | null
    error?: any
    isSelf?: boolean
    isDesktop?: boolean
    floatingBanner?: any
}

export default class Article extends React.Component<any, IArticleState> {
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
        article.date = moment(article.published_at).locale('ru').calendar(null, {
            sameDay: 'DD MMMM YYYY',
            lastDay: 'DD MMMM YYYY',
            sameElse: 'DD MMMM YYYY',
            lastWeek: 'DD MMMM YYYY'
        });
        return article;
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

    componentDidMount() {
        MediaQuerySerice.listen(this.handleMediaQuery);
        UserAction.onChange([LOGIN, LOGOUT, UPDATE_USER, SAVE_USER], this.handleUser);
        api.get(`/articles/${this.props.params.articleSlug}/`).then((response: any) => {
            let isSelf = UserAction.getStore().user ? UserAction.getStore().user.id == response.data.owner.id : false;
            this.setState({article: this.processArticle(response.data), isSelf: isSelf}, () => {
                window.setTimeout(() => {
                    this.processPhoto();
                    this.processEmbed();
                }, 50);
                if (this.state.article.ads_enabled) {
                    api.get('/banners/250x400/').then((response: any) => {
                        this.setState({floatingBanner: response.data.code});
                    }).catch((err) => {
                        console.log(err);
                    })
                }
            });
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
                        <div className={"article__title" + (this.state.article.cover ? ' inverted' : '')} style={coverStyle}>
                            {false && !this.state.isDesktop ?
                                <Link to={`/profile/${this.state.article.owner.id}`} className="article__author">
                                    {this.state.article.owner.first_name} {this.state.article.owner.last_name}
                                </Link> : null
                            }
                            <h1>{this.state.article.title}</h1>
                            <div className="article__stats">
                                {this.state.isDesktop ?
                                    <div className="article__author1">
                                        Автор:&nbsp;
                                        <Link to={`/profile/${this.state.article.owner.id}`}>
                                            {this.state.article.owner.first_name} {this.state.article.owner.last_name}
                                        </Link>
                                    </div> :
                                    <div className="article__author1">
                                        <Link to={`/profile/${this.state.article.owner.id}`}>
                                            {this.state.article.owner.first_name} {this.state.article.owner.last_name}
                                        </Link>
                                    </div>
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
                                <FloatingPanel className="ad_250x400" fixed={true} content={this.state.floatingBanner}/> : null
                            }
                        </div>

                        <div className="article__share">
                            <Link to={`/profile/${this.state.article.owner.id}`} className="article__author">
                                {this.state.article.owner.avatar ?
                                    <img className="article__avatar" src={this.state.article.owner.avatar}/> : null
                                }
                                {this.state.article.owner.first_name}&nbsp;{this.state.article.owner.last_name}
                            </Link>
                            {this.state.isDesktop ?
                                <div className="article__shares">
                                    <a href={"http://vk.com/share.php?url=" + this.state.article.url}
                                       className="article__share_btn"><SocialIcon social="vk"/></a>
                                    <a href={"https://www.facebook.com/sharer/sharer.php?u=" + this.state.article.url}
                                       className="article__share_btn"><SocialIcon social="facebook"/></a>
                                    <a href={"https://twitter.com/home?status=" + this.state.article.url}
                                       className="article__share_btn"><SocialIcon social="twitter"/></a>
                                    <a href={"https://telegram.me/share/url?url=" + this.state.article.url}
                                       className="article__share_btn"><SocialIcon social="telegram"/></a>
                                </div> :
                                <div className="article__shares_btn" onClick={this.openSharePopup.bind(this)}>
                                    <ShareButton/>Поделиться
                                </div>
                            }

                        </div>
                        {this.state.isDesktop ? <ShareFloatingPanel articleUrl={this.state.article.url}/> : null}
                    </div>
                    : <div className="article__loading"><span>СТАТЬЯ</span> ЗАГРУЖАЕТСЯ...</div>
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