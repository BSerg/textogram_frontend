import * as React from "react";
import {PhotoBlockContentTypes, Captions, BlockContentTypes} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";
import {DELETE_CONTENT, ContentAction, IContentData, UPDATE_CONTENT} from "../../actions/editor/ContentAction";
import {PhotoContentBlockAction, ADD_IMAGE, DELETE_IMAGE} from "../../actions/editor/PhotoContentBlockAction";
import ContentBlockPopup from "./ContentBlockPopup";
import "../../styles/editor/photo_content_block.scss";
import {PopupPanelAction, OPEN_POPUP} from "../../actions/shared/PopupPanelAction";
import {UploadImageAction, UPLOAD_IMAGE} from "../../actions/editor/UploadImageAction";

const AddButton = require('babel!svg-react!../../assets/images/redactor_icon_popup_add.svg?name=AddButton');
const DeleteButton = require('babel!svg-react!../../assets/images/close.svg?name=DeleteButton');

interface IPhoto {
    id: number,
    image: string
    caption?: string
}

interface IPhotoProps {
    className?: string
    content: IPhoto
    onDelete?: (id: number) => any
    onOpenModal?: (id: number) => any
}

export interface IPhotoContent {
    id: string
    type: BlockContentTypes
    photos: Array<IPhoto>
}

interface IPhotoContentBlockProps {
    articleId: number
    content: IContentData
    maxPhotoCount?: number
    className?: string
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
            content: this.props.content as IPhotoContent,
            isActive: false
        }
    }

    static defaultProps = {
        maxPhotoCount: 6
    };

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleDelete() {
        ContentAction.do(DELETE_CONTENT, {id: this.state.content.id});
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
        UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleId, image: file}).then(() => {
            let store = UploadImageAction.getStore();
            this.state.content.photos.push(store.image);
            this.setState({content: this.state.content}, () => {
                PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
                ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
            });
        });
    }

    deletePhoto(id: number) {
        console.log('DELETE PHOTO #' + id);
        let photos: IPhoto[] = [];
        this.state.content.photos.forEach((photo) => {
            if (photo.id != id) {
                photos.push(photo);
            }
        });
        this.state.content.photos = photos;
        this.setState({content: this.state.content}, () => {
            PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
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
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleBlockActive.bind(this));
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
                                      className={'photo' + index}
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