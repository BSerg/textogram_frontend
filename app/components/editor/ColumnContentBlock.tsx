import * as React from "react";
import {Captions, Constants, BlockContentTypes, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {
    ContentBlockAction, ACTIVATE_CONTENT_BLOCK,
    DEACTIVATE_CONTENT_BLOCK
} from "../../actions/editor/ContentBlockAction";
import {
    ContentAction, UPDATE_CONTENT_BLCK, IContentData,
    DELETE_CONTENT_BLCK, MOVE_UP_CONTENT_BLCK, MOVE_DOWN_CONTENT_BLCK
} from "../../actions/editor/ContentAction";
import * as toMarkdown from "to-markdown";
import * as marked from "marked";
import {
    UploadImageAction, UPLOAD_IMAGE, UPDATE_PROGRESS,
    UPLOAD_IMAGE_BASE64
} from "../../actions/editor/UploadImageAction";
import ProgressBar, {PROGRESS_BAR_TYPE} from "../shared/ProgressBar";
import {Validator} from "./utils";
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";
import "../../styles/editor/column_content_block.scss";
import EditableImageModal from "../shared/EditableImageModal";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../../actions/shared/PopupPanelAction";
import {DesktopBlockToolsAction, UPDATE_TOOLS} from "../../actions/editor/DesktopBlockToolsAction";
import ContentBlockPopup from "./ContentBlockPopup";
import PopupPrompt from "../shared/PopupPrompt";

const ClearPhotoIcon = require('-!babel-loader!svg-react-loader!../../assets/images/desktop_editor_icon_clear_square.svg?name=ClearPhotoIcon');


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
    isActive?: boolean;
    content?: IColumnContent;
    contentIsLong?: boolean;
    firstLetter?: string;
    updateComponent?: boolean;
    uploadImageProgress?: {progress: number, total: number} | null;
}

export default class ColumnContentBlock extends React.Component<IColumnContentBlockProps, IColumnContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isActive: false,
            content: this.props.content as IColumnContent,
            contentIsLong: this.checkContentIsLong((this.props.content as IColumnContent).value),
            firstLetter: this.getFirstLetter(this.props.content as IColumnContent) || 'T',
            uploadImageProgress: null,
        };
        this.handleActive = this.handleActive.bind(this);
    }

    refs: {
        inputUpload: HTMLInputElement
    };

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
        let firstLetter = contentText.trim().length ? contentText[0] : 'T';
        let validationState = this.updateValidationState();
        if (!validationState.isValid) {
            NotificationAction.do(
                SHOW_NOTIFICATION,
                {content: (Object as any).values(validationState.messages).join(', ')}
            );
        }
        this.state.content.__meta = {is_valid: validationState.isValid};
        this.setState({
            content: Object.assign(this.state.content, {value: toMarkdown(content)}),
            contentIsLong: this.checkContentIsLong(this.state.content.value),
            firstLetter: firstLetter
        }, () => {
            ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
        });
    }

    getFirstLetter(content: IColumnContent) {
        if (content.value.length) {
            let el = document.createElement('div');
            el.innerHTML = marked(content.value);
            return el.innerText ? el.innerText[0] : ''
        } else {
            return '';
        }
    }

    private checkContentIsLong(value: string) {
        let el = document.createElement('div');
        el.innerHTML = marked(value);
        return el.innerText.length > 500;
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

        let handleConfirm = (imageBase64: string) => {
            UploadImageAction.doAsync(
                UPLOAD_IMAGE_BASE64,
                {articleId: this.props.articleId, image: imageBase64}
            ).then((data: any) => {
                this.state.content.image = data;
                this.setState({
                    content: this.state.content,
                    updateComponent: true,
                    uploadImageProgress: null,
                }, () => {
                    ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
                    PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
                    DesktopBlockToolsAction.do(UPDATE_TOOLS, {position: this.getPosition(), tools: this.getDesktopToolsContent()});
                });
            });
        };

        let img = new Image();
        img.onload = () => {
            let modalContent = <EditableImageModal image={img}
                                                   outputWidth={200}
                                                   outputHeight={200}
                                                   onConfirm={handleConfirm}/>;
            ModalAction.do(OPEN_MODAL, {content: modalContent});
        };
        img.src = window.URL.createObjectURL(file);
    }

    deleteImage() {
        console.log('HDHDHHD')
        this.state.content.image = null;
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
            PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
            DesktopBlockToolsAction.do(UPDATE_TOOLS, {position: this.getPosition(), tools: this.getDesktopToolsContent()});
        });
    }

    getPopupContent() {
        let extraContent = this.state.content.image ?
            <div onClick={this.deleteImage.bind(this)}><ClearPhotoIcon/></div> : null;
        return <ContentBlockPopup extraContent={extraContent}
                                  onMoveUp={this.handleMoveUp.bind(this)}
                                  onMoveDown={this.handleMoveDown.bind(this)}
                                  onDelete={this.handleDelete.bind(this)}/>;


    }

    getDesktopToolsContent() {
        return this.state.content.image ?
            (
                <div className="base_content_block__tools_button"
                     placeholder="Удалить фото"
                     onClick={this.deleteImage.bind(this)}>
                    <ClearPhotoIcon/>
                </div>
            ) : null
    }

    handleActive() {
        let store = ContentBlockAction.getStore();
        if (this.state.isActive !== (store.id == this.state.content.id)) {
            this.setState({isActive: store.id == this.state.content.id}, () => {
                if (this.state.isActive) {
                    PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
                    DesktopBlockToolsAction.do(UPDATE_TOOLS, {position: this.getPosition(), tools: this.getDesktopToolsContent()});
                }
            })
        }
    }

    componentDidMount() {
        ContentBlockAction.onChange([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleActive);
        this.updateValidationState();
        this.handleActive();
    }

    componentWillUnmount() {
        ContentBlockAction.unbind([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleActive);
    }

    render() {
        let className = 'content_block_column';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        if (this.state.contentIsLong) className += ' long';
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
            <BaseContentBlock id={this.state.content.id} className={className} disableDefaultPopup={true}>
                <div className="content_block_column__column content_block_column__column_left">
                    {this.state.content.image ?
                        <div className="content_block_column__image"
                             style={imageStyle}
                             onClick={this.handleClickImage.bind(this)}/> :
                        <div className="content_block_column__image empty"
                             style={imageStyle}
                             onClick={this.handleClickImage.bind(this)}>{this.state.firstLetter}</div>
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