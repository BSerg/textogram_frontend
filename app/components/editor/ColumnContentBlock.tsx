import * as React from 'react';
import {Captions, Constants, BlockContentTypes, Validation} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import BaseContentBlock from './BaseContentBlock';
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from '../../actions/editor/ContentBlockAction';
import {ContentAction, UPDATE_CONTENT, IContentData} from '../../actions/editor/ContentAction';
import * as toMarkdown from 'to-markdown';
import * as marked from 'marked';
import {IPhoto} from "../../actions/editor/PhotoContentBlockAction";
import {UploadImageAction, UPLOAD_IMAGE} from "../../actions/editor/UploadImageAction";
import '../../styles/editor/column_content_block.scss';
import ProgressBar from "../shared/ProgressBar";
import {Validator} from "./utils";
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";

interface IColumnContent {
    id: string
    type: BlockContentTypes
    image: null|IPhoto|{id: null, image: string}
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
    uploadImageInProgress?: boolean
    loadingImage?: boolean
}

export default class ColumnContentBlock extends React.Component<IColumnContentBlockProps, IColumnContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isActive: false,
            content: this.props.content as IColumnContent,
            uploadImageInProgress: false,
            loadingImage: false
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
        this.refs.inputUpload.click();
    }

    updateImage() {
        let file = this.refs.inputUpload.files[0];
        if (file.size > Constants.maxImageSize) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: `Размер изображения не может превышать ${Constants.maxImageSize/1024/1024}Mb`}
            );
            return;
        }
        let tempURL = window.URL.createObjectURL(file);
        this.state.content.image = {id: null, image: tempURL};
        this.setState({
            uploadImageInProgress: true,
            content: this.state.content,
            updateComponent: true,
            loadingImage: true
        }, () => {
            UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleId, image: file}).then(() => {
                let store = UploadImageAction.getStore();
                this.state.content.image = store.image;
                this.setState({
                    content: this.state.content,
                    updateComponent: true,
                    uploadImageInProgress: false,
                    loadingImage: false
                }, () => {
                    ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
                    this.updateValidationState();
                });
            }).catch((error) => {
                this.setState({
                    updateComponent: true,
                    uploadImageInProgress: false,
                    loadingImage: false
                });
                NotificationAction.do(
                    SHOW_NOTIFICATION,
                    {content: `Ошибка при загрузке изображения`}
                );
            })
        });
    }

    fixImageSize(el: HTMLElement) {
        if (!el) return;
        window.setTimeout(() => {
            el.style.height = el.offsetWidth + 'px';
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
        if (this.state.uploadImageInProgress) imageClassName += ' loading';
        if (this.state.content.image) {
            imageStyle = {
                background: `url('${this.state.content.image.image}') no-repeat center center`
            };
            if (this.state.content.image.id == null) {
                imageStyle.filter = 'grayscale(1)';
            }
        }
        return (
            <BaseContentBlock id={this.state.content.id} className={className}>
                <div className="content_block_column__column content_block_column__column_left">
                    <div className={imageClassName}
                         style={imageStyle}
                         onClick={this.handleClickImage.bind(this)}/>
                </div>
                <ContentEditable className="content_block_column__column content_block_column__column_right"
                                 onFocus={this.handleFocus.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={0}
                                 content={marked(this.state.content.value)}
                                 enableTextFormat={true}
                                 placeholder={Captions.editor.enter_text}/>
                <div style={{clear: "both"}}/>
                <ProgressBar className={this.state.loadingImage ? 'active' : ''} label={Captions.editor.loading_image}/>
                <input type="file"
                       ref="inputUpload"
                       style={{display: "none"}}
                       accept="image/jpeg,image/png,image/gif"
                       onChange={this.updateImage.bind(this)}/>
            </BaseContentBlock>
        )
    }
}