import * as React from 'react';
import {Captions, Constants, Validation} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import {UploadImageAction, UPLOAD_IMAGE} from '../../actions/editor/UploadImageAction';
import {ContentAction, UPDATE_TITLE_CONTENT, UPDATE_COVER_CONTENT} from '../../actions/editor/ContentAction';

import {TitleBlockAction, UPDATE_COVER_ACTION, UPDATE_TITLE_ACTION} from '../../actions/editor/TitleBlockAction';

import {api} from '../../api';

import '../../styles/editor/title_block.scss';
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";
import {Validator} from "./utils";

interface TitleBlockPropsInterface {
    title: string|null,
    cover: string|null,
    articleSlug: string
    autoSave?: boolean
}

interface TitleBlockStateInterface {
    title?: string|null,
    cover?: {id: number, image: string} | null,
    isValid?: boolean
}

export default class TitleBlock extends React.Component<TitleBlockPropsInterface, TitleBlockStateInterface> {
    constructor(props: any) {
        super(props);
        this.state = {
            title: props.title,
            cover: props.cover,
        }
    }

    static defaultProps = {
        autoSave: true
    };

    refs: {
        fileInput: HTMLInputElement;
        componentRootElement: HTMLElement
    };

    isValid(title: string) {
        return Validator.isValid(this.state, Validation.ROOT);
    }

    private updateValidState() {
        if (!this.isValid(this.state.title) && !this.refs.componentRootElement.classList.contains('invalid')) {
            this.refs.componentRootElement.classList.add('invalid');
        } else if (this.isValid(this.state.title) && this.refs.componentRootElement.classList.contains('invalid')) {
            this.refs.componentRootElement.classList.remove('invalid');
        }
    }

    openFileDialog() {
        this.refs.fileInput.click();
    }

    handleTitle(content: string, contentText: string) {
        this.setState({title: contentText}, () => {
            ContentAction.do(UPDATE_TITLE_CONTENT, {articleId: this.props.articleSlug, autoSave: this.props.autoSave, title: this.state.title});
            this.updateValidState();
            if (!this.isValid(this.state.title)) {
                NotificationAction.do(
                    SHOW_NOTIFICATION,
                    {content: Validation.ROOT.title.message}
                );
            }
        });
    }

    handleCover() {
        var file = this.refs.fileInput.files[0];
        UploadImageAction.doAsync(UPLOAD_IMAGE, {articleId: this.props.articleSlug, image: file}).then(() => {
            let store = UploadImageAction.getStore();
            console.log(store);
            this.setState({cover: store.image}, () => {
                ContentAction.do(UPDATE_COVER_CONTENT, {articleId: this.props.articleSlug, autoSave: this.props.autoSave, cover: store.image});
            });
        });
    }

    deleteCover() {
        this.setState({cover: null}, () => {
            ContentAction.do(UPDATE_COVER_CONTENT, {articleId: this.props.articleSlug, autoSave: this.props.autoSave, cover: null});
        });
    }

    componentDidMount() {
        this.updateValidState();
    }

    render() {
        let className = 'title_block',
            style = {};
        if (this.state.cover) {
            className += ' inverse';
            style = {background: 'url("' + this.state.cover.image + '") no-repeat center center', backgroundSize: 'cover'}
        }

        return (
            <div className={className} style={style} ref="componentRootElement">
                {this.props.articleSlug != null ?
                    <div className="title_block__cover_handler_wrapper">
                        {!this.state.cover ?
                            <div onClick={this.openFileDialog.bind(this)} className="title_block__cover_handler">
                                {Captions.editor.add_cover_ru}
                            </div> :
                            <div onClick={this.deleteCover.bind(this)} className="title_block__cover_handler">
                                {Captions.editor.remove_cover_ru}
                            </div>
                        }
                    </div> : null
                }
                <ContentEditable className="title_block__title"
                                 elementType="inline"
                                 allowLineBreak={false}
                                 alignContent="center"
                                 focusOnMount={!this.state.title}
                                 onChange={this.handleTitle.bind(this)}
                                 placeholder={Captions.editor.enter_title_ru}
                                 content={this.state.title}/>
                <input ref="fileInput"
                       type="file"
                       style={{display: 'none'}}
                       accept="image/jpeg,image/png,image/gif"
                       onChange={this.handleCover.bind(this)}/>
            </div>
        )
    }
}