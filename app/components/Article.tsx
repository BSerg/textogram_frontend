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

const EditButton = require('babel!svg-react!../assets/images/edit.svg?name=EditButton');
const DeleteButton = require('babel!svg-react!../assets/images/redactor_icon_delete.svg?name=DeleteButton');
const BackButton = require('babel!svg-react!../assets/images/back.svg?name=BackButton');
const ViewIcon = require('babel!svg-react!../assets/images/views_white.svg?name=ViewIcon');
const CloseIcon = require('babel!svg-react!../assets/images/close_white.svg?name=CloseIcon');
const ArrowButton = require('babel!svg-react!../assets/images/arrow.svg?name=ArrowButton');



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
}

interface IArticleState {
    article?: IArticle | null
    error?: any
    isSelf?: boolean
    isDesktop?: boolean
}

export default class Article extends React.Component<any, IArticleState> {
    constructor(props: any) {
        super(props);
        this.state = {
            article: null,
            isSelf: false,
            isDesktop: MediaQuerySerice.getIsDesktop()
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
                            <Link to={`/profile/${this.state.article.owner.id}`} className="article__author">
                                <span className="article__first_name">{this.state.article.owner.first_name}</span>
                                {this.state.article.owner.last_name}
                            </Link>
                            <h1>{this.state.article.title}</h1>
                            <div className="article__stats">
                                <div className="article__date">{this.state.article.date}</div>
                                <div className="article__views">
                                    <ViewIcon/> {this.state.article.views}
                                </div>
                            </div>
                        </div>
                        <div className="article__content" dangerouslySetInnerHTML={{__html: this.state.article.html}}/>
                        <div className="article__share">
                            <Link to={`/profile/${this.state.article.owner.id}`} className="article__author">
                                {this.state.article.owner.avatar ?
                                    <img className="article__avatar" src={this.state.article.owner.avatar}/> : null
                                }
                                 <span className="article__first_name">{this.state.article.owner.first_name}</span>
                                {this.state.article.owner.last_name}
                            </Link>
                            <div className="article__shares">
                                <a href={"http://vk.com/share.php?url=" + this.state.article.url}
                                   className="article__share_btn"><SocialIcon social="vk"/></a>
                                <a href={"https://www.facebook.com/sharer/sharer.php?u=" + this.state.article.url}
                                   className="article__share_btn"><SocialIcon social="facebook"/></a>
                                <a href={"https://twitter.com/home?status=" + this.state.article.url}
                                   className="article__share_btn"><SocialIcon social="twitter"/></a>
                            </div>
                        </div>
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

interface IGalleryModalState {
    currentPhotoIndex?: number,
    isDesktop?: boolean
}


class GalleryModal extends React.Component<IGalleryModalProps, IGalleryModalState> {
    constructor(props: any) {
        super(props);
        this.state = {
            currentPhotoIndex: this.props.currentPhotoIndex,
            isDesktop: MediaQuerySerice.getIsDesktop()
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
        this.setState({currentPhotoIndex: this.state.currentPhotoIndex});
    }

    prevPhoto() {
        this.state.currentPhotoIndex--;
        if (this.state.currentPhotoIndex < 0) {
            this.state.currentPhotoIndex = this.props.photos.length - 1;
        }
        this.setState({currentPhotoIndex: this.state.currentPhotoIndex});
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
        console.log(index, this.props.photos);
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
                    <div className="gallery_modal__image" style={imageStyle} onClick={this.nextPhoto.bind(this)}/>
                }
                {photo.caption ? <div className="gallery_modal__caption">{photo.caption}</div> : null}
            </div>
        );
    }
}