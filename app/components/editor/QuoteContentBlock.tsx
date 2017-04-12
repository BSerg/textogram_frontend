import * as React from "react";
import {Captions, BlockContentTypes, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT_BLCK, IContentData} from "../../actions/editor/ContentAction";
import {UploadImageAction, UPLOAD_IMAGE_BASE64} from "../../actions/editor/UploadImageAction";
import ProgressBar, {PROGRESS_BAR_TYPE} from "../shared/ProgressBar";
import {Validator} from "./utils";
import {SHOW_NOTIFICATION, NotificationAction} from "../../actions/shared/NotificationAction";
import * as toMarkdown from "to-markdown";
import * as marked from "marked";
import "../../styles/editor/quote_content_block.scss";
import {MediaQuerySerice} from "../../services/MediaQueryService";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";
import EditableImageModal from "../shared/EditableImageModal";

interface IQuoteContent {
    id: string
    type: BlockContentTypes
    value: string
    image: {id: number, image: string, preview?: string} | null
    __meta?: any
}

interface IQuoteContentBlockProps {
    articleId: number
    content: IContentData
    className?: string
}

interface IQuoteContentBlockState {
    content?: IQuoteContent;
    contentIsLong?: boolean;
    menuOpened?: boolean
    doNotUpdateComponent?: boolean
    isActive?: boolean
    loadingImage?: boolean
    loadingProgress?: {progress: number, total: number} | null
    isDesktop?: boolean
}

export default class QuoteContentBlock extends React.Component<IQuoteContentBlockProps, IQuoteContentBlockState> {
    refs: {
        inputUpload: HTMLInputElement,
    };

    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IQuoteContent,
            contentIsLong: this.checkContentIsLong((this.props.content as IQuoteContent).value),
            menuOpened: false,
            loadingImage: false,
            isDesktop: MediaQuerySerice.getIsDesktop()
        };
        this.handleActivate = this.handleActivate.bind(this);
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
    }

    private isValid(content: IQuoteContent): boolean {
        return Validator.isValid(content, Validation.QUOTE);
    }

    private validate(content: IQuoteContent): any {
        return Validator.validate(content, Validation.QUOTE);
    }

    private checkContentIsLong(value: string) {
        let el = document.createElement('div');
        el.innerHTML = marked(value);
        return el.innerText.length > 500;
    }

    handleActivate() {
        let store = ContentBlockAction.getStore();
        this.setState({isActive: store.id == this.props.content.id}, () => {
            this.updateValidationState();
        });
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
        this.closePhotoMenu();
    }

    handleBlur() {
        this.closePhotoMenu();
    }

    updateValidationState() {
        let el = document.getElementById(this.state.content.id);
        if (!this.isValid(this.state.content) && !el.classList.contains('invalid')) el.classList.add('invalid');
        else if (this.isValid(this.state.content) && el.classList.contains('invalid')) el.classList.remove('invalid');
    }

    handleChange(content: string, contentText: string) {
        this.state.content.value = toMarkdown(content);
        let validationInfo = this.validate(this.state.content);
        if (!validationInfo.isValid) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: Object.values(validationInfo.messages)}
            );
        }
        this.state.content.__meta = {is_valid: validationInfo.isValid};
        this.setState({content: this.state.content, contentIsLong: this.checkContentIsLong(content)}, () => {
            ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
            this.updateValidationState();
        });
    }

    openFileDialog() {
        this.refs.inputUpload.click();
        this.closePhotoMenu();
    }

    handleUploadProgress(fileName: string) {
        let store = UploadImageAction.getStore();
        let progress = store.progress[fileName];
        if (progress) {
            this.setState({loadingProgress: progress});
        }
    }

    updateImage() {
        let file: any = this.refs.inputUpload.files[0];
        if (!file) {
            this.refs.inputUpload.value = "";
            return;
        }
        let handleConfirm = (imageBase64: string) => {
            UploadImageAction.doAsync(
                UPLOAD_IMAGE_BASE64,
                {articleId: this.props.articleId, image: imageBase64}
            ).then((data: any) => {
                this.state.content.image = data;
                this.setState({content: this.state.content, loadingImage: false, loadingProgress: null}, () => {
                    ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
                });
            });
        };

        let img = new Image();
        img.onload = () => {
            let modalContent = <EditableImageModal image={img} width={250} height={250} foregroundColor="#7F7F7F"
                                                   foregroundShape="circle" onConfirm={handleConfirm}/>;
            ModalAction.do(OPEN_MODAL, {content: modalContent});
        };
        img.src = window.URL.createObjectURL(file);
    }

    deleteImage() {
        this.state.content.image = null;
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
        });
        this.closePhotoMenu();
    }

    handleClickPhoto() {
        this.handleFocus();
        this.openPhotoMenu();
    }

    openPhotoMenu() {
        if (this.state.isActive) {
            this.setState({menuOpened: true});
        }
    }

    closePhotoMenu() {
        this.setState({menuOpened: false});
    }

    handleMediaQuery(isDesktop: boolean) {
        if (this.state.isDesktop != isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    componentDidMount() {
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleActivate);
        MediaQuerySerice.listen(this.handleMediaQuery);
        this.updateValidationState();
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleActivate);
        MediaQuerySerice.unbind(this.handleMediaQuery);
    }

    render() {
        let className = 'content_block_quote';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        if (this.state.contentIsLong) className += ' long';
        let imageStyle: any = {};
        if (this.state.content.image) {
            className += ' personal';
            imageStyle = {
                background: `url('${this.state.content.image.preview ||this.state.content.image.image}') no-repeat center center`,
                backgroundSize: 'cover'
            };
            if (this.state.content.image.id == null) {
                imageStyle.filter = 'grayscale(1)'
            }
        }
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                {this.state.content.image ?
                    this.state.isDesktop ?
                        <div key="photo"
                             onClick={this.state.isActive ? this.deleteImage.bind(this) : this.handleFocus.bind(this)}
                             className="content_block_quote__photo"
                             style={imageStyle}>
                            {this.state.isActive ?
                                <div className="content_block_quote__foreground"></div> : null
                            }
                        </div> :
                        [
                            <div onClick={this.state.isActive ? this.openPhotoMenu.bind(this) : this.handleFocus.bind(this)}
                                 key="photo"
                                 className="content_block_quote__photo"
                                 style={imageStyle}/>,
                            (
                                this.state.menuOpened ?
                                    <div key="photoMenu" className="content_block_quote__menu">
                                        <div onClick={this.openFileDialog.bind(this)} className="content_block_quote__menu_item">
                                            {Captions.editor.enter_quote_replace}
                                        </div>
                                        <div onClick={this.deleteImage.bind(this)} className="content_block_quote__menu_item">
                                            {Captions.editor.enter_quote_delete}
                                        </div>
                                    </div> : null
                            )
                        ] : <div className="content_block_quote__empty_photo" onClick={this.openFileDialog.bind(this)}/>
                }
                <div className="content_block_quote__quote">
                    <ContentEditable allowLineBreak={true}
                                     onFocus={this.handleFocus.bind(this)}
                                     onBlur={this.handleBlur.bind(this)}
                                     onChange={this.handleChange.bind(this)}
                                     onChangeDelay={0}
                                     content={marked(this.state.content.value)}
                                     enableTextFormat={true}
                                     placeholder={Captions.editor.enter_quote}/>
                </div>
                {this.state.loadingProgress ?
                    <ProgressBar type={PROGRESS_BAR_TYPE.DETERMINATE}
                                 value={this.state.loadingProgress.progress}
                                 total={this.state.loadingProgress.total}
                                 className="active"
                                 label={Captions.editor.loading_image}/>
                    : null
                }
                <input ref="inputUpload"
                       type="file"
                       accept="image/jpeg,image/png,image/gif"
                       style={{display: "none"}}
                       onChange={this.updateImage.bind(this)} />
            </BaseContentBlock>
        )
    }
}