import * as React from "react";
import {BlockContentTypes, Captions} from "../../constants";
import {
    ContentBlockAction, ACTIVATE_CONTENT_BLOCK,
    DEACTIVATE_CONTENT_BLOCK
} from "../../actions/editor/ContentBlockAction";
import {IContentData, DELETE_CONTENT, ContentAction} from "../../actions/editor/ContentAction";
import BaseContentBlock from "./BaseContentBlock";
import ContentBlockPopup from "./ContentBlockPopup";
import {PopupPanelAction, OPEN_POPUP} from "../../actions/shared/PopupPanelAction";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";
import EmbedModal from "./EmbedModal";
import {api} from "../../api";
import "../../styles/editor/embed_content_block.scss";

const EditButton = require('babel!svg-react!../../assets/images/edit.svg?name=EditButton');

export interface IEmbedContent {
    id: string
    type: BlockContentTypes
    value: string
    __meta?: any
}

interface IEmbedContentBlockProps {
    content: IContentData
    className?: string

}

interface IEmbedContentBlockState {
    content?: IEmbedContent,
    isActive?: boolean,
    loaded?: boolean
}

export default class EmbedContentBlock extends React.Component<IEmbedContentBlockProps, IEmbedContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IEmbedContent,
            isActive: false,
            loaded: false
        };
        this.handleActive = this.handleActive.bind(this);
    }

    refs: {
        urlInput: HTMLInputElement,
        embed: HTMLElement
    };

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleActive() {
        let store = ContentBlockAction.getStore();
        if (this.state.isActive != (store.id == this.state.content.id)) {
            this.setState({isActive: store.id == this.state.content.id}, () => {
                if (this.state.isActive) {
                    PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
                }
            });
        }
    }

    handleContent() {
        ContentAction.do(DELETE_CONTENT, {id: this.state.content.id});
        ContentBlockAction.do(DEACTIVATE_CONTENT_BLOCK, null);
    }

    private getPopupContent() {
        let extraContent = <EditButton onClick={() => {
            ModalAction.do(OPEN_MODAL, {content: <EmbedModal content={this.state.content}/>})
        }}/>;
        return <ContentBlockPopup extraContent={extraContent}
                                  onDelete={this.handleContent.bind(this)}/>;
    }

    processEmbedElement(embed: HTMLElement) {
        if (!embed || this.state.loaded) return;
        window.setTimeout(() => {
            if (this.state.content.type == BlockContentTypes.VIDEO) {
                embed.style.height = embed.offsetWidth * 450 / 800 + 'px';
                let iframe = embed.getElementsByTagName('iframe')[0];
                if (iframe) {
                    iframe.addEventListener('load', () => {
                        iframe.style.height = iframe.offsetWidth * 450 / 800 + 'px';
                        this.setState({loaded: true});
                    });
                }
            } else {
                this.setState({loaded: true}, () => {
                    // TWITTER LOAD EMBED
                    twttr.widgets && twttr.widgets.load(document.getElementById(this.props.content.id));
                    // INSTAGRAM LOAD EMBED
                    instgrm.Embeds.process();
                });

            }
        });
    }

    componentDidMount() {
        if (!this.state.content.__meta) {
            let params: {url: string, type?: string} = {url: this.state.content.value};
            if (this.state.content.type == BlockContentTypes.VIDEO) {
                params.type = 'video';
            }
            api.post('/utils/embed/', params).then((response: any) => {
                console.log(response);
                if (response.data.embed) {
                    this.state.content.__meta = {embed: response.data.embed};
                    this.setState({content: this.state.content}, () => {
                        window.setTimeout(() => {
                            // TWITTER EMBED
                            twttr.widgets && twttr.widgets.load(document.getElementById(this.props.content.id));
                            // INSTAGRAM LOAD EMBED
                            instgrm.Embeds.process();
                        });
                    });
                }
            })
        }
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleActive);
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleActive);
    }

    render() {
        let className = 'content_block_embed';
        if (this.state.loaded) {
            className += ' loaded';
        }
        switch (this.state.content.type) {
            case BlockContentTypes.VIDEO:
                className += ' content_block_embed__video';
                break;
            case BlockContentTypes.AUDIO:
                className += ' content_block_embed__audio';
                break;
            case BlockContentTypes.POST:
                className += ' content_block_embed__post';
                break;
        }
        return (
            <BaseContentBlock id={this.props.content.id}
                              className={className}
                              disableDefaultPopup={true}>
                {this.state.content.__meta && this.state.content.__meta.embed ?
                    <div ref={this.processEmbedElement.bind(this)} className="content_block_embed__html"
                         dangerouslySetInnerHTML={{__html: this.state.content.__meta.embed}}/>
                    : Captions.editor.help_embed_empty
                }
                {!this.state.isActive ?
                    <div className="content_block_embed__foreground" onClick={this.handleFocus.bind(this)}>
                        {!this.state.loaded ? Captions.editor.loading : null}
                    </div> : null
                }
            </BaseContentBlock>
        )
    }
}