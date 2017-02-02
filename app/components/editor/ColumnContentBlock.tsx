import * as React from "react";
import {Captions, Constants, BlockContentTypes, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT, IContentData} from "../../actions/editor/ContentAction";
import * as toMarkdown from "to-markdown";
import * as marked from "marked";
import {UploadImageAction, UPLOAD_IMAGE, UPDATE_PROGRESS} from "../../actions/editor/UploadImageAction";
import ProgressBar, {PROGRESS_BAR_TYPE} from "../shared/ProgressBar";
import {Validator} from "./utils";
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";
import "../../styles/editor/column_content_block.scss";

interface IColumnContent {
    id: string
    type: BlockContentTypes
    image: null | {id: null, image: string, preview?: string}
    value: string
    __meta?: any
}

interface IColumnContentBlockProps {
    articleId: number
    content: IContentData
    className?: string
}

interface IColumnContentBlockState {
    isActive?: boolean
    content?: IColumnContent
    updateComponent?: boolean
    uploadImageProgress?: {progress: number, total: number} | null
}

export default class ColumnContentBlock extends React.Component<IColumnContentBlockProps, IColumnContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isActive: false,
            content: this.props.content as IColumnContent,
            uploadImageProgress: null,
        };
        this.handleActive = this.handleActive.bind(this);
    }

    refs: {
        inputUpload: HTMLInputElement
    };

    updateValidationState() {
        let validationState = this.isValid(this.state.content);
        let el = document.getElementById(this.state.content.id);
        if (!validationState.isValid && !el.classList.contains('invalid')) el.classList.add('invalid');
        else if (validationState.isValid && el.classList.contains('invalid')) el.classList.remove('invalid');
        return validationState;
    }

    private isValid(content: IColumnContent): any {
        return Validator.validate(content, Validation.COLUMN);
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleChange(content: string, contentText: string) {
        this.state.content.value = toMarkdown(content);
        let validationState = this.updateValidationState();
        if (!validationState.isValid) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: Object.values(validationState.messages).join(', ')}
            );
        }
        this.state.content.__meta = {is_valid: validationState.isValid};
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
        });
    }

    handleClickImage() {
        this.handleFocus();
        this.openFileDialog();
    }

    openFileDialog() {
        this.refs.inputUpload.value = '';
        this.refs.inputUpload.click();
    }

    handleUploadProgress(fileName: string) {
        let store = UploadImageAction.getStore();
        let progress = store.progress[fileName];
        if (progress) {
            this.setState({uploadImageProgress: progress, updateComponent: true});
        }
    }

    updateImage() {
        let file = this.refs.inputUpload.files[0];
        if (!file) {
            this.refs.inputUpload.value = '';
            return;
        }
        if (file.size > Constants.maxImageSize) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: `Размер изображения не может превышать ${Constants.maxImageSize/1024/1024}Mb`}
            );
            return;
        }
        let tempURL = window.URL.createObjectURL(file);
        this.state.content.image = {id: null, image: tempURL};
        const handlerProgress = this.handleUploadProgress.bind(this, file.name);
        this.setState({
            content: this.state.content,
            updateComponent: true,
        }, () => {
            UploadImageAction.onChange(UPDATE_PROGRESS, handlerProgress);
            UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleId, image: file}).then(() => {
                let store = UploadImageAction.getStore();
                this.state.content.image = store.image;
                this.setState({
                    content: this.state.content,
                    updateComponent: true,
                    uploadImageProgress: null,
                }, () => {
                    UploadImageAction.unbind(UPDATE_PROGRESS, handlerProgress);
                    ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
                    this.updateValidationState();
                });
            }).catch((error) => {
                UploadImageAction.unbind(UPDATE_PROGRESS, handlerProgress);
                this.setState({
                    updateComponent: true,
                    uploadImageProgress: null,
                });
                NotificationAction.do(
                    SHOW_NOTIFICATION,
                    {content: `Ошибка при загрузке изображения`}
                );
            })
        });
    }

    handleActive() {
        let store = ContentBlockAction.getStore();
        if (this.state.isActive !== (store.id == this.state.content.id)) {
            this.setState({isActive: store.id == this.state.content.id})
        }
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        let update = nextState.updateComponent;
        delete nextState.updateComponent;
        return !!update;
    }

    componentDidMount() {
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleActive);
        this.updateValidationState();
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleActive);
    }

    render() {
        let className = 'content_block_column';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        let imageClassName='content_block_column__image', imageStyle: any = {};
        if (!this.state.content.image) imageClassName += ' empty';
        if (this.state.uploadImageProgress) imageClassName += ' loading';
        if (this.state.content.image) {
            imageStyle = {
                background: `url('${this.state.content.image.preview || this.state.content.image.image}') no-repeat center center`
            };
            if (this.state.content.image.id == null) {
                imageStyle.filter = 'grayscale(1)';
            }
        }
        return (
            <BaseContentBlock id={this.state.content.id} className={className}>
                <div className="content_block_column__column content_block_column__column_left">
                    {this.state.content.image ?
                        <img className={imageClassName}
                             src={this.state.content.image.preview || this.state.content.image.image}
                             onClick={this.handleClickImage.bind(this)}/> :
                        <div className="content_block_column__image empty"
                             style={imageStyle}
                             onClick={this.handleClickImage.bind(this)}/>
                    }
                </div>
                <ContentEditable className="content_block_column__column content_block_column__column_right"
                                 onFocus={this.handleFocus.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={0}
                                 content={marked(this.state.content.value)}
                                 enableTextFormat={true}
                                 placeholder={Captions.editor.enter_text}/>
                <div style={{clear: "both"}}/>
                {this.state.uploadImageProgress ?
                    <ProgressBar type={PROGRESS_BAR_TYPE.DETERMINATE}
                                 value={this.state.uploadImageProgress.progress}
                                 total={this.state.uploadImageProgress.total}
                                 className='active'
                                 label={Captions.editor.loading_image}/>
                    : null
                }
                <input type="file"
                       ref="inputUpload"
                       style={{display: "none"}}
                       accept="image/jpeg,image/png,image/gif"
                       onChange={this.updateImage.bind(this)}/>
            </BaseContentBlock>
        )
    }
}