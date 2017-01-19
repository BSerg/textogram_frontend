import * as React from 'react';
import {Captions, Constants, BlockContentTypes} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import BaseContentBlock from './BaseContentBlock';
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from '../../actions/editor/ContentBlockAction';
import {ContentAction, UPDATE_CONTENT, IContentData} from '../../actions/editor/ContentAction';
import * as toMarkdown from 'to-markdown';
import * as marked from 'marked';
import {IPhoto} from "../../actions/editor/PhotoContentBlockAction";
import {UploadImageAction, UPLOAD_IMAGE} from "../../actions/editor/UploadImageAction";
import '../../styles/editor/column_content_block.scss';

interface IColumnContent {
    id: string
    type: BlockContentTypes
    image: null|IPhoto
    value: string
}

interface IColumnContentBlockProps {
    articleId: number
    content: IContentData
    className?: string
}

interface IColumnContentBlockState {
    content?: IColumnContent
    updateComponent?: boolean
    uploadImageInProgress?: boolean
}

export default class ColumnContentBlock extends React.Component<IColumnContentBlockProps, IColumnContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IColumnContent,
            uploadImageInProgress: false
        }
    }

    refs: {
        inputUpload: HTMLInputElement
    };

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleChange(content: string, contentText: string) {
        this.state.content.value = toMarkdown(content);
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
        });
    }

    openFileDialog() {
        this.refs.inputUpload.click();
    }

    updateImage() {
        this.setState({uploadImageInProgress: true}, () => {
            let file = this.refs.inputUpload.files[0];
            UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleId, image: file}).then(() => {
                let store = UploadImageAction.getStore();
                this.state.content.image = store.image;
                this.setState({content: this.state.content, updateComponent: true, uploadImageInProgress: false}, () => {
                    ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
                });
            })
        });
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        let update = nextState.updateComponent;
        delete nextState.updateComponent;
        return !!update;
    }

    fixImageSize(el: HTMLElement) {
        if (!el) return;
        window.setTimeout(() => {
            el.style.height = el.offsetWidth + 'px';
        });
    }

    render() {
        let className = 'content_block_column';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        let imageClassName='content_block_column__image', imageStyle = {};
        if (!this.state.content.image) imageClassName += ' empty';
        if (this.state.uploadImageInProgress) imageClassName += ' loading';
        if (this.state.content.image) {
            imageStyle = {
                background: `url('${this.state.content.image.image}') no-repeat center center`
            }
        }
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                <div className="content_block_column__column content_block_column__column_left">
                    <div
                         className={imageClassName}
                         style={imageStyle}
                         onClick={this.openFileDialog.bind(this)}/>
                </div>
                <ContentEditable className="content_block_column__column content_block_column__column_right"
                                 onFocus={this.handleFocus.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={1000}
                                 content={marked(this.state.content.value)}
                                 placeholder={Captions.editor.enter_text}/>
                <div style={{clear: "both"}}></div>
                <input type="file"
                       ref="inputUpload"
                       style={{display: "none"}}
                       onChange={this.updateImage.bind(this)}/>
            </BaseContentBlock>
        )
    }
}