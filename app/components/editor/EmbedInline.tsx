import * as React from "react";
import {Captions, BlockContentTypes, Embed} from "../../constants";
import {IContentData, ContentAction, UPDATE_CONTENT, CREATE_CONTENT} from "../../actions/editor/ContentAction";
import {IEmbedContent} from "./EmbedContentBlock";
import "../../styles/editor/embed_inline.scss";
import {InlineBlockAction, CLOSE_INLINE_BLOCK} from "../../actions/editor/InlineBlockAction";

const CloseButton = require('babel!svg-react!../../assets/images/close.svg?name=CloseButton');


interface IEmbedInlineProps {
    content: IContentData
    blockPosition?: number
    onSubmit?: () => any
    className?: string
}

interface IEmbedInlineState {
    content?: IEmbedContent
    isError?: boolean
}

export default class EmbedInline extends React.Component<IEmbedInlineProps, IEmbedInlineState> {
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
        InlineBlockAction.do(CLOSE_INLINE_BLOCK, null);
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
            ContentAction.do(CREATE_CONTENT, {contentBlock: this.state.content, position: this.props.blockPosition});
        } else {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
        }
        InlineBlockAction.do(CLOSE_INLINE_BLOCK, null);
        this.props.onSubmit && this.props.onSubmit();
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
        let className = 'embed_inline';
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
                <form onSubmit={this.updateContent.bind(this)}>
                    <input className="embed_inline__input"
                           ref="urlInput"
                           type="text"
                           value={this.state.content.value}
                           placeholder={Captions.editor.enter_embed_url} onChange={this.handleChangeUrl.bind(this)}/>
                </form>
                {this.state.isError ?
                    <div className="embed_inline__error">{Captions.editor.error_embed_url}</div>
                    : <div className="embed_inline__help">{help}</div>
                }
            </div>
        )
    }
}