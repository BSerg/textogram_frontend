import * as React from "react";
import {PhotoBlockContentTypes, Captions} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";
import {DELETE_CONTENT, ContentAction} from "../../actions/editor/ContentAction";
import {PhotoContentBlockAction, ADD_IMAGE, DELETE_IMAGE} from "../../actions/editor/PhotoContentBlockAction";
import ContentBlockPopup from "./ContentBlockPopup";
import "../../styles/editor/photo_content_block.scss";
import {PopupPanelAction, OPEN_POPUP} from "../../actions/shared/PopupPanelAction";

const AddButton = require('babel!svg-react!../../assets/images/redactor_icon_popup_add.svg?name=AddButton');
const DeleteButton = require('babel!svg-react!../../assets/images/close.svg?name=DeleteButton');

interface IPhoto {
    id: number,
    position: number
    image: string
    caption: string
}

interface IPhotoProps {
    className?: string
    content: IPhoto
    onDelete?: (id: number) => any
    onOpenModal?: (id: number) => any
}

interface IPhotoContent {
    id: number
    article: number
    position: number
    subtype: PhotoBlockContentTypes,
    photos: Array<IPhoto>
}

interface IPhotoContentBlockProps {
    className?: string
    content: IPhotoContent
    maxPhotoCount?: number
}

interface IPhotoContentBlockState {
    isActive?: boolean
    content?: IPhotoContent
}


export class Photo extends React.Component<IPhotoProps, any> {
    constructor(props: any) {
        super(props);
    }

    handleDelete(e: any) {
        e.preventDefault();
        e.stopPropagation();
        this.props.onDelete && this.props.onDelete(this.props.content.id);
    }

    handleOpenModal(e: any) {
        e.preventDefault();
        e.stopPropagation();
        this.props.onOpenModal && this.props.onOpenModal(this.props.content.id);
    }

    render() {
        let className = 'content_block_photo__photo';
        if (this.props.className) {
            className += ' ' + this.props.className
        }
        let style = {
            background: `url('${this.props.content.image}') no-repeat center center`,
            backgroundSize: 'cover'
        };
        return (
            <div className={className} style={style} onClick={this.handleOpenModal.bind(this)}>
                {/*<div onClick={this.handleOpenModal.bind(this)} className="content_block_photo__image" />*/}
                <DeleteButton onClick={this.handleDelete.bind(this)} className="content_block_photo__delete"/>
            </div>
        )
    }
}


export class PhotoModalContent extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="photo_modal">
                <div className="photo_modal__header">
                    __HEADER__
                </div>
                <div className="photo_modal__image">
                    __IMAGE__
                </div>
                <div className="photo_modal__caption">
                    <ContentEditable elementType="inline" placeholder={Captions.editor.enter_caption}/>
                </div>
            </div>
        );
    }
}


export default class PhotoContentBlock extends React.Component<IPhotoContentBlockProps, IPhotoContentBlockState> {
    refs: {
        inputUpload: HTMLInputElement
    };
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content,
            isActive: false
        }
    }

    static defaultProps = {
        maxPhotoCount: 6
    };

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleBlur() {
        // ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: -1});
    }

    handleDelete() {
        ContentAction.do(DELETE_CONTENT, {id: this.props.content.id});
    }

    handleBlockActive() {
        let store = ContentBlockAction.getStore();
        this.setState({isActive: store.id == this.state.content.id}, () => {
            if (this.state.isActive) {
                PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
            }
        });
    }

    openModal(id: number) {
        if (this.state.isActive) {
            console.log('OPEN MODAL ON PHOTO #' + id);
            ModalAction.do(OPEN_MODAL, {content: <PhotoModalContent/>})
        } else {
            this.handleFocus();
        }
    }

    addPhoto() {
        let file = this.refs.inputUpload.files[0];
        PhotoContentBlockAction.do(ADD_IMAGE, {
            content_item: this.props.content.id,
            position: this.state.content.photos.length,
            image: file,
        })
    }

    deletePhoto(id: number) {
        console.log('DELETE PHOTO #' + id);
        PhotoContentBlockAction.do(DELETE_IMAGE, {id: id});
    }

    handleAddPhoto() {
        let store = PhotoContentBlockAction.getStore();
        this.state.content.photos.push(store.image);
        this.state.content.photos.sort((a, b) => {
            return a.position - b.position;
        });
        this.setState({content: this.state.content}, () => {
            PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
        });
    }

    handleDeletePhoto() {
        let store = PhotoContentBlockAction.getStore();
        let photos: IPhoto[] = [];
        this.state.content.photos.forEach((photo) => {
            if (photo.id != store.image.id) {
                photos.push(photo);
            }
        });
        photos.forEach((photo, index) => {
            photo.position = index;
        });
        this.state.content.photos = photos;
        this.setState({content: this.state.content}, () => {
            PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
        });
    }

    private openFileDialog() {
        this.refs.inputUpload.click();
    }

    private getPopupContent() {
        let extraContent;
        if (this.state.content.photos.length < this.props.maxPhotoCount) {
            extraContent = <AddButton onClick={this.openFileDialog.bind(this)}/>;
        } else {
            extraContent = <AddButton className="disabled"/>;
        }
        return <ContentBlockPopup extraContent={extraContent}
                                  onDelete={this.handleDelete.bind(this)}/>;
    }

    componentDidMount() {
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleBlockActive.bind(this));
        PhotoContentBlockAction.onChange(ADD_IMAGE, this.handleAddPhoto.bind(this));
        PhotoContentBlockAction.onChange(DELETE_IMAGE, this.handleDeletePhoto.bind(this));
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleBlockActive.bind(this));
        PhotoContentBlockAction.unbind(ADD_IMAGE, this.handleAddPhoto.bind(this));
        PhotoContentBlockAction.unbind(DELETE_IMAGE, this.handleDeletePhoto.bind(this));
    }

    render() {
        let className = 'content_block_photo';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <BaseContentBlock id={this.props.content.id}
                              className={className}
                              onClick={this.handleFocus.bind(this)}
                              disableDefaultPopup={true}>
                {this.state.content.photos.length ?
                    this.state.content.photos.map((photo: IPhoto, index: number) => {
                        return <Photo key={'photo' + photo.id}
                                      className={'photo' + photo.position}
                                      content={photo}
                                      onDelete={this.deletePhoto.bind(this)}
                                      onOpenModal={this.openModal.bind(this)}/>
                    }) :
                    <div className="content_block_photo__empty_label">{Captions.editor.add_photo_help}</div>
                }

                <div style={{clear: "both"}}/>
                <input id={"inputUpload" + this.props.content.id}
                       style={{display: "none"}}
                       ref="inputUpload"
                       type="file"
                       onChange={this.addPhoto.bind(this)}/>
            </BaseContentBlock>
        )
    }
}