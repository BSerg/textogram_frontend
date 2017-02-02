import * as React from "react";
import {Captions, BlockContentTypes, Constants, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT, IContentData} from "../../actions/editor/ContentAction";
import {UploadImageAction, UPLOAD_IMAGE, UPDATE_PROGRESS} from "../../actions/editor/UploadImageAction";
import ProgressBar, {PROGRESS_BAR_TYPE} from "../shared/ProgressBar";
import {Validator} from "./utils";
import {SHOW_NOTIFICATION, NotificationAction} from "../../actions/shared/NotificationAction";
import * as toMarkdown from "to-markdown";
import * as marked from "marked";
import "../../styles/editor/quote_content_block.scss";

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
    content?: IQuoteContent
    menuOpened?: boolean
    doNotUpdateComponent?: boolean
    isActive?: boolean
    loadingImage?: boolean
    loadingProgress?: {progress: number, total: number} | null
}

export default class QuoteContentBlock extends React.Component<IQuoteContentBlockProps, IQuoteContentBlockState> {
    refs: {
        inputUpload: HTMLInputElement,
    };

    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IQuoteContent,
            menuOpened: false,
            loadingImage: false,
        };
        this.handleActivate = this.handleActivate.bind(this);
    }

    private isValid(content: IQuoteContent): boolean {
        return Validator.isValid(content, Validation.QUOTE);
    }

    private validate(content: IQuoteContent): any {
        return Validator.validate(content, Validation.QUOTE);
    }

    handleActivate() {
        let store = ContentBlockAction.getStore();
        this.setState({isActive: store.id == this.props.content.id});
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
        console.log(content, contentText);
        this.state.content.value = toMarkdown(content);
        let validationInfo = this.validate(this.state.content);
        if (!validationInfo.isValid) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: Object.values(validationInfo.messages)}
            );
        }
        this.state.content.__meta = {is_valid: validationInfo.isValid};
        this.setState({content: this.state.content, doNotUpdateComponent: true}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
            this.updateValidationState();
        });
    }

    openFileDialog() {
        this.refs.inputUpload.click();
    }

    handleUploadProgress(fileName: string) {
        let store = UploadImageAction.getStore();
        let progress = store.progress[fileName];
        if (progress) {
            this.setState({loadingProgress: progress});
        }
    }

    updateImage() {
        let file = this.refs.inputUpload.files[0];
        if (!file) {
            this.refs.inputUpload.value = "";
            return;
        }
        if (file.size > Constants.maxImageSize) {
            alert(`Image size is more than ${Constants.maxImageSize/1024/1024}Mb`);
            return;
        }
        this.setState({loadingImage: true, menuOpened: false});
        let tempURL = window.URL.createObjectURL(file);
        this.state.content.image = {id: null, image: tempURL};
        const handlerUploadProgress = this.handleUploadProgress.bind(this, file.name);
        this.setState({content: this.state.content}, () => {
            UploadImageAction.onChange(UPDATE_PROGRESS, handlerUploadProgress);
            UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleId, image: file}).then(() => {
                UploadImageAction.unbind(UPDATE_PROGRESS, handlerUploadProgress);
                let store = UploadImageAction.getStore();
                this.state.content.image = store.image;
                this.setState({content: this.state.content, loadingImage: false, loadingProgress: null}, () => {
                    ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
                    this.closePhotoMenu();
                });
            }).catch((err) => {
                UploadImageAction.unbind(UPDATE_PROGRESS, handlerUploadProgress);
                this.setState({loadingImage: false, loadingProgress: null});
            })
        });
    }

    deleteImage() {
        this.state.content.image = null;
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
        });
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

    shouldComponentUpdate(nextProps: any, nextState: any) {
        if (nextState.updateComponent) {
            delete nextState.updateComponent;
            return false;
        }
        return true;
    }

    componentDidMount() {
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleActivate);
        this.updateValidationState();
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleActivate);
    }

    render() {
        let className = 'content_block_quote';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        let imageStyle: any = {};
        if (this.state.content.image) {
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
                    [
                        <div onClick={this.openPhotoMenu.bind(this)}
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
                    ] :
                    <div className="content_block_quote__empty_photo" onClick={this.openFileDialog.bind(this)}/>
                }
                <ContentEditable allowLineBreak={false}
                                 onFocus={this.handleFocus.bind(this)}
                                 onBlur={this.handleBlur.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={0}
                                 content={marked(this.state.content.value)}
                                 enableTextFormat={true}
                                 placeholder={Captions.editor.enter_quote}/>
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