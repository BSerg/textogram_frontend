import * as React from "react";
import {Captions, BlockContentTypes, Constants} from "../../constants";
import BaseContentBlock from "./BaseContentBlock";
import {
    ContentBlockAction,
    ACTIVATE_CONTENT_BLOCK,
    DEACTIVATE_CONTENT_BLOCK
} from "../../actions/editor/ContentBlockAction";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";
import {
    DELETE_CONTENT_BLCK, ContentAction, IContentData, UPDATE_CONTENT_BLCK,
    MOVE_DOWN_CONTENT_BLCK, MOVE_UP_CONTENT_BLCK
} from "../../actions/editor/ContentAction";
import ContentBlockPopup from "./ContentBlockPopup";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../../actions/shared/PopupPanelAction";
import {UploadImageAction, UPLOAD_IMAGE, UPDATE_PROGRESS} from "../../actions/editor/UploadImageAction";
import ProgressBar, {PROGRESS_BAR_TYPE} from "../shared/ProgressBar";
import {DesktopBlockToolsAction, UPDATE_TOOLS} from "../../actions/editor/DesktopBlockToolsAction";
import PopupPrompt from "../shared/PopupPrompt";
import {PhotoModal} from "./PhotoModal";
import {MediaQuerySerice} from "../../services/MediaQueryService";
import "../../styles/editor/photo_content_block.scss";
import Sortable = require('sortablejs');
import ContentEditable from "../shared/ContentEditable";
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";

const AddButton = require('babel!svg-react!../../assets/images/desktop_editor_icon_gallery.svg?name=AddButton');
const DeleteButton = require('babel!svg-react!../../assets/images/editor_delete.svg?name=DeleteButton');
const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');

const ResizeBig = require('babel!svg-react!../../assets/images/desktop_editor_icon_fullsize.svg?name=ResizeBig');
const ResizeSmall = require('babel!svg-react!../../assets/images/desktop_editor_icon_crop.svg?name=ResizeSmall');

type PhotoSize = 'original' | 'cropped';

interface IPhoto {
    id: number
    image: string
    preview?: string
    caption?: string
    size?: PhotoSize
}

interface IPhotoProps {
    className?: string
    style?: any
    content: IPhoto
    onDelete?: (id: number) => any
    onOpenModal?: (id: number) => any
    showOriginal?: boolean
}

export interface IPhotoContent {
    id: string
    type: BlockContentTypes
    photos: Array<IPhoto>
}

export class Photo extends React.Component<IPhotoProps, any> {
    constructor(props: any) {
        super(props);
    }

    static defaultProps = {
        showOriginal: false
    };

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
        if (this.props.content.size == 'cropped') {
            className += ' photo_cropped';
        }
        if (this.props.className) {
            className += ' ' + this.props.className
        }
        let style = this.props.style || {};
        let imgSrc = this.props.showOriginal ? this.props.content.image : (this.props.content.preview || this.props.content.image);
        Object.assign(style, {
            background: `url('${imgSrc}') no-repeat center center`,
            backgroundSize: 'cover'
        });
        return (
            <div className={className} style={style} onClick={this.handleOpenModal.bind(this)}>
                <img src={imgSrc} style={{visibility: "hidden"}}/>
                <div onClick={this.handleDelete.bind(this)} className="content_block_photo__delete"></div>
                {/*<DeleteButton onClick={this.handleDelete.bind(this)} className="content_block_photo__delete"/>*/}
            </div>
        )
    }
}


interface IPhotoContentBlockProps {
    articleId: number
    content: IContentData
    maxPhotoCount?: number
    className?: string
}

interface IPhotoContentBlockState {
    isActive?: boolean;
    content?: IPhotoContent;
    loadingImage?: boolean;
    loadingImageFilename?: string | null;
    loadingImageLoaded?: number;
    loadingImageAmount?: number;
    imageUploadProgress?: {progress: number, total: number} | null;
    sortable?: any;
    isDesktop?: boolean;
}


export default class PhotoContentBlock extends React.Component<IPhotoContentBlockProps, IPhotoContentBlockState> {
    refs: {
        inputUpload: HTMLInputElement,
        photosContainer: HTMLDivElement
    };
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IPhotoContent,
            isActive: false,
            loadingImage: false,
            loadingImageFilename: null,
            loadingImageLoaded: 0,
            loadingImageAmount: 0,
            imageUploadProgress: null,
            sortable: null,
            isDesktop: MediaQuerySerice.getIsDesktop()
        };
        this.handleBlockActive = this.handleBlockActive.bind(this);
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
    }

    static defaultProps = {
        maxPhotoCount: 100
    };

    getPosition() {
        let blocks = ContentAction.getStore().content.blocks;
        let index = -1;
        blocks.forEach((block: any, i: number) => {
            if (block.id == this.state.content.id) {
                index = i;
            }
        });
        return index;
    }

    initSortable() {
        if (this.state.sortable) {
            this.state.sortable.option("disabled", false);
        } else {
            let that = this;
            let sortable: any = new Sortable(this.refs.photosContainer, {
                sort: true,
                delay: 0,
                animation: 150,
                draggable: ".content_block_photo__photo",
                onEnd: (e: any) => {
                    if (e.oldIndex != e.newIndex) {
                        let movedPhoto = that.state.content.photos.splice(e.oldIndex, 1)[0];
                        that.state.content.photos.splice(e.newIndex, 0, movedPhoto);
                        that.setState({content: that.state.content}, () => {
                            ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: that.state.content});
                        });
                    }
                },
                onMove: (e: any): boolean => {
                    this.handleOnMovePhoto();
                    return true;
                }
            });
            this.setState({sortable: sortable});
        }
    }

    disableSortable() {
        if (this.state.sortable) this.state.sortable.option("disabled", true);
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    deleteBlock() {
        ContentAction.do(DELETE_CONTENT_BLCK, {id: this.state.content.id});
        ContentBlockAction.do(DEACTIVATE_CONTENT_BLOCK, null);
        PopupPanelAction.do(CLOSE_POPUP, null);
    }

    handleDelete() {
        let content = <PopupPrompt confirmLabel="Удалить"
                                   confirmClass="warning"
                                   onConfirm={this.deleteBlock.bind(this)}/>;
        PopupPanelAction.do(
            OPEN_POPUP,
            {content: content}
        );
    }

    handleMoveUp() {
        ContentAction.do(MOVE_UP_CONTENT_BLCK, {id: this.state.content.id});
    }

    handleMoveDown() {
        ContentAction.do(MOVE_DOWN_CONTENT_BLCK, {id: this.state.content.id});
    }

    handleBlockActive() {
        let store = ContentBlockAction.getStore();
        this.setState({isActive: store.id == this.state.content.id}, () => {
            if (this.state.isActive) {
                this.initSortable();
                PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
                DesktopBlockToolsAction.do(UPDATE_TOOLS, {position: this.getPosition(), tools: this.getDesktopToolsContent()});
            } else {
                this.disableSortable();
            }
        });
    }

    handleUploadProgress(fileName: string) {
        let store = UploadImageAction.getStore();
        let progress = store.progress[fileName];
        if (progress) {
            this.setState({imageUploadProgress: progress}, () => {
                PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
            });
        }
    }

    handleOnMovePhoto() {
        window.setTimeout(() => {
            let photos = this.refs.photosContainer.getElementsByClassName('content_block_photo__photo');
            for (let i in photos) {
                let photo = photos[i];
                if (photo && photo.classList) {
                    photo.classList.remove('photo0', 'photo1', 'photo2', 'photo3', 'photo4', 'photo5');
                    photo.classList.add('photo' + i);
                }
            }
        });
    }

    openModal(id: number) {
        if (this.state.isActive) {
            let currentPhotoIndex = 0;
            this.state.content.photos.forEach((photo, index) => {
                if (photo.id == id) {
                    currentPhotoIndex = index;
                }
            });
            ModalAction.do(
                OPEN_MODAL,
                {content: <PhotoModal contentBlockId={this.state.content.id}
                                             photos={this.state.content.photos}
                                             initPhotoIndex={currentPhotoIndex}/>}
            )
        } else {
            this.handleFocus();
        }
    }

    _prevalidateFiles(files: FileList) {
        let invalidFiles = [];
        let validFiles = [];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file.size > Constants.maxImageSize) {
                invalidFiles.push(file);
            } else {
                validFiles.push(file);
            }
        }
        if (invalidFiles.length == 1) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: `Размер изображения "${invalidFiles[0].name}" превышает ${Constants.maxImageSize/1024/1024}Mb`}
            );
        } else if (invalidFiles.length) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: `Размер некоторых изображений превышает ${Constants.maxImageSize/1024/1024}Mb`}
            );
        }
        return validFiles;
    }

    _uploadPhoto(index: number, photoPlaceholder: any, files: File[]) {
        if (index >= files.length) {
            this.setState({loadingImage: false});
            return;
        }
        this.state.content.photos.push(photoPlaceholder);
        let file = files[index];
        this.setState({loadingImageFilename: file.name});
        PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
        const progressHandler = this.handleUploadProgress.bind(this, file.name);
        UploadImageAction.onChange(UPDATE_PROGRESS, progressHandler);
        UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleId, image: file}).then((uploadedImage) => {
            UploadImageAction.unbind(UPDATE_PROGRESS, progressHandler);
            this.state.content.photos.splice(this.state.content.photos.indexOf(photoPlaceholder), 1);
            this.state.content.photos.push(uploadedImage);
            this.setState({content: this.state.content, loadingImageLoaded: this.state.loadingImageLoaded + 1}, () => {
                DesktopBlockToolsAction.do(UPDATE_TOOLS, {position: this.getPosition(), tools: this.getDesktopToolsContent()});
                ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
                if (index < files.length - 1) {
                    let tempURL = window.URL.createObjectURL(files[index+1]);
                    this._uploadPhoto(index + 1, {id: null, image: tempURL}, files);
                } else {
                    this.setState({
                        loadingImage: false,
                        loadingImageAmount: 0,
                        loadingImageLoaded: 0,
                        loadingImageFilename: null
                    });
                }
            });
        }).catch((err) => {
            console.log(err);
            UploadImageAction.unbind(UPDATE_PROGRESS, progressHandler);
            this.state.content.photos.splice(this.state.content.photos.indexOf(photoPlaceholder), 1);
            this.setState({content: this.state.content}, () => {
                if (index < files.length - 1) {
                    let tempURL = window.URL.createObjectURL(files[index+1]);
                    this._uploadPhoto(index + 1, {id: null, image: tempURL}, files);
                } else {
                    this.setState({
                        loadingImage: false,
                        loadingImageAmount: 0,
                        loadingImageLoaded: 0,
                        loadingImageFilename: null
                    });
                }
            });
        });
    }

    addPhoto() {
        let files = this._prevalidateFiles(this.refs.inputUpload.files);
        if (!files.length) {
            this.refs.inputUpload.value = '';
            return;
        }
        let photoPlaceholder: any = {id: null, image: window.URL.createObjectURL(files[0])};
        this.setState({loadingImage: true, loadingImageAmount: files.length, content: this.state.content}, () => {
            this._uploadPhoto(0, photoPlaceholder, files);
        });
    }

    deletePhoto(id: number) {
        let photos: IPhoto[] = [];
        this.state.content.photos.forEach((photo) => {
            if (photo.id != id) {
                photos.push(photo);
            }
        });
        this.state.content.photos = photos;
        this.setState({content: this.state.content}, () => {
            PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
            DesktopBlockToolsAction.do(UPDATE_TOOLS, {position: this.getPosition(), tools: this.getDesktopToolsContent()})
            ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
        });
    }

    resizePhoto() {
        let photo = this.state.content.photos[0];
        if (photo) {
            if (!photo.size || photo.size == 'original') {
                photo.size = 'cropped';
            } else {
                photo.size = 'original';
            }
        }
        this.setState({content: this.state.content}, () => {
            PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
            DesktopBlockToolsAction.do(UPDATE_TOOLS, {position: this.getPosition(), tools: this.getDesktopToolsContent()})
            ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
        });
    }

    private openFileDialog() {
        this.refs.inputUpload.value = '';
        this.refs.inputUpload.click();
    }

    private getPopupContent() {
        let extraContent = [];
        if (this.state.content.photos.length == 1) {
            this.state.content.photos[0].size == 'cropped' ?
                extraContent.push(<div onClick={this.resizePhoto.bind(this)}><ResizeBig/></div>):
                extraContent.push(<div onClick={this.resizePhoto.bind(this)}><ResizeSmall/></div>)
        }
        if (this.state.content.photos.length >= this.props.maxPhotoCount ||
            (this.state.imageUploadProgress && this.state.imageUploadProgress.progress != this.state.imageUploadProgress.total)) {
            extraContent.push(<div><AddButton className="disabled"/></div>);
        } else {
            extraContent.push(<div onClick={this.openFileDialog.bind(this)}><AddButton/></div>);
        }
        return <ContentBlockPopup extraContent={extraContent}
                                  onMoveUp={this.handleMoveUp.bind(this)}
                                  onMoveDown={this.handleMoveDown.bind(this)}
                                  onDelete={this.handleDelete.bind(this)}/>;
    }

    private getDesktopToolsButton(icon: any, placeholder: string, callback: () => any | null = null, disabled: boolean = false) {
        return (
            callback == null ?
                <div className={"base_content_block__tools_button" + (disabled ? " disabled" : "")}
                     placeholder={placeholder}>
                    {icon}
                </div> :
                <div className={"base_content_block__tools_button" + (disabled ? " disabled" : "")}
                     placeholder={placeholder}
                     onClick={callback}>
                    {icon}
                </div>

        )
    }

    private getDesktopToolsContent() {
        let content = [];
        if (this.state.content.photos.length == 1) {
            this.state.content.photos[0].size == 'cropped' ?
                content.push(this.getDesktopToolsButton(<ResizeBig/>, 'По высоте', this.resizePhoto.bind(this))) :
                content.push(this.getDesktopToolsButton(<ResizeSmall/>, 'Обрезать', this.resizePhoto.bind(this)));
        }
        if (this.state.content.photos.length >= this.props.maxPhotoCount ||
            (this.state.imageUploadProgress && this.state.imageUploadProgress.progress != this.state.imageUploadProgress.total)) {
            content.push(this.getDesktopToolsButton(<AddButton/>, "", null, true));
        } else {
            content.push(this.getDesktopToolsButton(<AddButton/>, "Добавить фото", this.openFileDialog.bind(this)));
        }
        return content;
    }

    handleMediaQuery(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    componentDidMount() {
        ContentBlockAction.onChange([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleBlockActive);
        if (!this.state.content.photos.length) {
            this.handleFocus();
            this.refs.inputUpload.click();
        }
        MediaQuerySerice.listen(this.handleMediaQuery);
        this.handleBlockActive();
    }

    componentWillUnmount() {
        ContentBlockAction.unbind([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleBlockActive);
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    render() {
        let className = 'content_block_photo';
        if (this.state.content.photos.length && this.state.content.photos.length <= 6) {
            className += ' grid_' + this.state.content.photos.length;
        }

        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <BaseContentBlock id={this.props.content.id}
                              className={className}
                              onClick={this.handleFocus.bind(this)}
                              disableDefaultPopup={true}>
                <div ref="photosContainer">
                    {this.state.content.photos.length ?
                        this.state.content.photos.map((photo: IPhoto, index: number) => {
                            let photoStyle = {};
                            if (photo.id == null) {
                                photoStyle = {filter: 'grayscale(1)'}
                            }
                            return <Photo key={'photo' + photo.id}
                                          className={'photo' + index + (this.state.content.photos.length == 1 ? ' photo_single' : '')}
                                          style={photoStyle}
                                          content={photo}
                                          onDelete={this.deletePhoto.bind(this)}
                                          onOpenModal={this.openModal.bind(this)}
                                          showOriginal={this.state.content.photos.length == 1}/>
                        }) : null
                    }
                    {this.state.content.photos.length == 1 ?
                        <div className="content_block_photo__caption">
                            {this.state.isActive ?
                                <ContentEditable elementType="inline"
                                                 allowLineBreak={false}
                                                 placeholder="Описание"
                                                 onChange={(content, contentText) => {
                                                    this.state.content.photos[0].caption = contentText;
                                                    this.setState({});
                                                    ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
                                                 }}
                                                 content={this.state.content.photos[0].caption}/> :
                                this.state.content.photos[0].caption
                            }
                        </div> : null
                    }

                    {!this.state.isActive && this.state.content.photos.length > 6 ?
                        <div className="content_block_photo__caption">Галерея из {this.state.content.photos.length} фото</div> : null
                    }

                    {!this.state.isDesktop && this.state.isActive && this.state.content.photos.length ?
                        <div className="content_block_photo__help">{Captions.editor.help_photo}</div> : null
                    }
                    {!this.state.content.photos.length ?
                        <div className="content_block_photo__photo content_block_photo__empty"
                             onClick={this.openFileDialog.bind(this)}></div> : null
                    }

                </div>
                <div style={{clear: "both"}}/>
                {this.state.imageUploadProgress ?
                    <ProgressBar type={PROGRESS_BAR_TYPE.DETERMINATE}
                                 value={this.state.loadingImageLoaded + (this.state.imageUploadProgress.total ? this.state.imageUploadProgress.progress / this.state.imageUploadProgress.total : 0)}
                                 total={this.state.loadingImageAmount}
                                 className={this.state.loadingImage ? 'active' : ''}
                                 label={`${Captions.editor.loading_image} (${this.state.loadingImageFilename})`}/>
                        : null
                }
                <input id={"inputUpload" + this.props.content.id}
                       style={{display: "none"}}
                       ref="inputUpload"
                       type="file"
                       accept="image/jpeg,image/png,image/gif"
                       multiple={true}
                       onChange={this.addPhoto.bind(this)}/>
            </BaseContentBlock>
        )
    }
}