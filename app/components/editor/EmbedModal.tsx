import * as React from "react";
import {Captions, BlockContentTypes, Embed} from "../../constants";
import {
    IContentData,
    ContentAction,
    UPDATE_CONTENT,
    CREATE_CONTENT,
    DELETE_CONTENT
} from "../../actions/editor/ContentAction";
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import {IEmbedContent} from "./EmbedContentBlock";
import "../../styles/editor/embed_modal.scss";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../../actions/shared/PopupPanelAction";
import PopupPrompt from "../shared/PopupPrompt";
import {ContentBlockAction, DEACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";

const DeleteButton = require('babel!svg-react!../../assets/images/redactor_icon_delete.svg?name=DeleteButton');
const ConfirmButton = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmButton');
const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');
const CloseButton = require('babel!svg-react!../../assets/images/close.svg?name=CloseButton');


interface IEmbedModalProps {
    content: IContentData
    blockPosition?: number
    onSubmit?: () => any
    className?: string

}

interface IEmbedModalState {
    content?: IEmbedContent
    isError?: boolean
}

export default class EmbedModal extends React.Component<IEmbedModalProps, IEmbedModalState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IEmbedContent,
            isError: false
        }
    }

    refs: {
        urlInput: HTMLInputElement
    };

    back() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    handleChangeUrl() {
        let url = this.refs.urlInput.value;
        this.state.content.value = url;
        delete this.state.content.__meta;
        this.setState({content: this.state.content, isError: url.length && !this.validate(url)});
    }

    updateContent(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.isError || !this.refs.urlInput.value) return;
        if (!this.state.content.id) {
            ContentAction.doAsync(CREATE_CONTENT, {contentBlock: this.state.content, position: this.props.blockPosition});
        } else {
            ContentAction.doAsync(UPDATE_CONTENT, {contentBlock: this.state.content});
        }
        ModalAction.do(CLOSE_MODAL, null);
        this.props.onSubmit && this.props.onSubmit();
    }

    deleteBlock() {
        ContentAction.do(DELETE_CONTENT, {id: this.state.content.id});
        ContentBlockAction.do(DEACTIVATE_CONTENT_BLOCK, null);
        PopupPanelAction.do(CLOSE_POPUP, null);
    }

    handleDeleteContent() {
        console.log('DELETE EMBED', this.state.content.id);
        if (this.state.content.id) {
            ModalAction.do(CLOSE_MODAL, null);
            let content = <PopupPrompt confirmLabel="Удалить"
                                       confirmClass="warning"
                                       onConfirm={this.deleteBlock.bind(this)}/>;
            PopupPanelAction.do(OPEN_POPUP, {content: content});
        }
    }

    validate(url: string): boolean {
        let isValid = false, testRegexps;
        switch (this.state.content.type) {
            case BlockContentTypes.VIDEO:
                testRegexps = Embed.urlRegex.VIDEO;
                break;
            case BlockContentTypes.AUDIO:
                testRegexps = Embed.urlRegex.AUDIO;
                break;
            case BlockContentTypes.POST:
                testRegexps = Embed.urlRegex.POST;
                break;
        }
        if (testRegexps) {
            Object.values(testRegexps).forEach((regex) => {
                if (regex.test(url)) {
                    isValid = true;
                }
            });
        }
        return isValid;
    }

    componentDidMount() {
        this.refs.urlInput.focus();
    }

    render() {
        let className = 'embed_modal';
        let help;
        switch (this.state.content.type) {
            case BlockContentTypes.VIDEO:
                help = Captions.editor.help_embed_video;
                break;
            case BlockContentTypes.AUDIO:
                help = Captions.editor.help_embed_audio;
                break;
            case BlockContentTypes.POST:
                help = Captions.editor.help_embed_post;
                break;

        }
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <div className={className}>
                <div className="embed_modal__header">
                    <CloseButton className="embed_modal__back" onClick={this.back.bind(this)}/>
                </div>
                <div className={"embed_modal__content" + (this.state.isError ? ' error' : '')}>
                    <form onSubmit={this.updateContent.bind(this)}>
                        <input className="embed_modal__input"
                               ref="urlInput"
                               type="text"
                               value={this.state.content.value}
                               placeholder={Captions.editor.enter_embed_url} onChange={this.handleChangeUrl.bind(this)}/>
                    </form>
                    {this.state.isError ?
                    <div className="content_block_embed__error">{Captions.editor.error_embed_url}</div>:
                    <div className="content_block_embed__help">{help}</div>
                    }
                </div>
                <div className="editor_modal__tools">
                    {this.state.content.id ?
                        <DeleteButton onClick={this.handleDeleteContent.bind(this)}/> : null
                    }
                    <ConfirmButton className={!this.state.content.value.length || this.state.isError ? "disabled" : ""}
                                   onClick={this.updateContent.bind(this)}/>
                </div>
            </div>
        )
    }
}