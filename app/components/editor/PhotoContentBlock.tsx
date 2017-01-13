import * as React from "react";
import {Captions, BlockContentTypes} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import {DELETE_CONTENT, ContentAction, IContentData, UPDATE_CONTENT} from "../../actions/editor/ContentAction";
import ContentBlockPopup from "./ContentBlockPopup";
import {PopupPanelAction, OPEN_POPUP} from "../../actions/shared/PopupPanelAction";
import {UploadImageAction, UPLOAD_IMAGE} from "../../actions/editor/UploadImageAction";
import "../../styles/editor/photo_content_block.scss";

const AddButton = require('babel!svg-react!../../assets/images/redactor_icon_popup_add.svg?name=AddButton');
const DeleteButton = require('babel!svg-react!../../assets/images/close.svg?name=DeleteButton');
const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');

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


interface IPhotoModalContentProps {
    contentBlockId: string
    photos: IPhoto[]
    initPhotoIndex: number
}

interface IPhotoModalContentState {
    photos?: IPhoto[]
    currentPhotoIndex?: number
    doNotUpdateComponent?: boolean
}

export class PhotoModalContent extends React.Component<IPhotoModalContentProps, IPhotoModalContentState> {
    constructor(props: any) {
        super(props);
        this.state = {
            photos: this.props.photos,
            currentPhotoIndex: this.props.initPhotoIndex
        }
    }

    back() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    handleCaption(content: string, contentText: string) {
        this.state.photos[this.state.currentPhotoIndex].caption = contentText;
        this.setState({photos: this.state.photos, doNotUpdateComponent: true}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: {
                id: this.props.contentBlockId,
                type: BlockContentTypes.PHOTO,
                photos: this.state.photos
            }})
        });
    }

    nextPhoto() {
        this.state.currentPhotoIndex++;
        if (this.state.currentPhotoIndex >= this.state.photos.length) {
            this.state.currentPhotoIndex = 0;
        }
        this.setState({currentPhotoIndex: this.state.currentPhotoIndex});
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        if (nextState.doNotUpdateComponent) {
            delete nextState.doNotUpdateComponent;
            return false;
        }
        return true;
    }

    render() {
        let imageStyle = {
            background: `url('${this.state.photos[this.state.currentPhotoIndex].image}') no-repeat center center`
        };
        return (
            <div className="photo_modal">
                <div className="photo_modal__header">
                    <BackButton className="photo_modal__back" onClick={this.back.bind(this)}/>
                    <div className="photo_modal__counter">
                        {this.state.currentPhotoIndex + 1}/{this.state.photos.length}
                    </div>
                </div>
                <div className="photo_modal__image" style={imageStyle} onClick={this.nextPhoto.bind(this)}/>
                <div className="photo_modal__caption">
                    <ContentEditable elementType="inline"
                                     allowLineBreak={false}
                                     alignContent="center"
                                     onChange={this.handleCaption.bind(this)}
                                     content={this.state.photos[this.state.currentPhotoIndex].caption}
                                     placeholder={Captions.editor.enter_caption}/>
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
        };
        this.handleBlockActive = this.handleBlockActive.bind(this);
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
            let currentPhotoIndex = 0;
            this.state.content.photos.forEach((photo, index) => {
                if (photo.id == id) {
                    currentPhotoIndex = index;
                }
            });
            ModalAction.do(
                OPEN_MODAL,
                {content: <PhotoModalContent contentBlockId={this.state.content.id}
                                             photos={this.state.content.photos}
                                             initPhotoIndex={currentPhotoIndex}/>}
            )
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
        this.refs.inputUpload.click();
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleBlockActive);
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleBlockActive);
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