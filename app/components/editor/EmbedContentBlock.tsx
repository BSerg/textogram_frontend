import * as React from "react";
import {BlockContentTypes, Captions} from "../../constants";
import {
    ContentBlockAction, ACTIVATE_CONTENT_BLOCK,
    DEACTIVATE_CONTENT_BLOCK
} from "../../actions/editor/ContentBlockAction";
import {IContentData, DELETE_CONTENT_BLCK, ContentAction, UPDATE_CONTENT_BLCK} from "../../actions/editor/ContentAction";
import BaseContentBlock from "./BaseContentBlock";
import ContentBlockPopup from "./ContentBlockPopup";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../../actions/shared/PopupPanelAction";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";
import EmbedModal from "./EmbedModal";
import {api} from "../../api";
import "../../styles/editor/embed_content_block.scss";
import ProgressBar from "../shared/ProgressBar";
import InlineBlock from "./InlineBlock";
import {InlineBlockAction, OPEN_INLINE_BLOCK, CLOSE_INLINE_BLOCK} from "../../actions/editor/InlineBlockAction";
import EmbedInline from "./EmbedInline";
import {DesktopBlockToolsAction, UPDATE_TOOLS} from "../../actions/editor/DesktopBlockToolsAction";
import PopupPrompt from "../shared/PopupPrompt";

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
    loaded?: boolean,
    hide?: boolean
}

export default class EmbedContentBlock extends React.Component<IEmbedContentBlockProps, IEmbedContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IEmbedContent,
            isActive: false,
            loaded: false,
            hide: false
        };
        this.handleActive = this.handleActive.bind(this);
        this.handleCloseInline = this.handleCloseInline.bind(this);
    }

    refs: {
        urlInput: HTMLInputElement,
        embed: HTMLElement
    };

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

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleActive() {
        let store = ContentBlockAction.getStore();
        if (this.state.isActive != (store.id == this.state.content.id)) {
            this.setState({isActive: store.id == this.state.content.id}, () => {
                if (this.state.isActive) {
                    PopupPanelAction.do(OPEN_POPUP, {content: this.getPopupContent()});
                    DesktopBlockToolsAction.do(UPDATE_TOOLS, {position: this.getPosition(), tools: this.getDesktopToolsContent()});
                }
            });
        }
    }

    deleteBlock() {
        ContentAction.do(DELETE_CONTENT_BLCK, {id: this.state.content.id});
        ContentBlockAction.do(DEACTIVATE_CONTENT_BLOCK, null);
        PopupPanelAction.do(CLOSE_POPUP, null);
    }

    handleDeleteContent() {
        let content = <PopupPrompt confirmLabel="Удалить"
                                   confirmClass="warning"
                                   onConfirm={this.deleteBlock.bind(this)}/>;
        PopupPanelAction.do(
            OPEN_POPUP,
            {content: content}
        );
    }

    onUpdateUrl() {
        this.forceUpdate();
    }

    private getPopupContent() {
        let extraContent = (
            <div onClick={() => {
                ModalAction.do(
                    OPEN_MODAL,
                    {content: <EmbedModal onSubmit={this.onUpdateUrl.bind(this)} content={this.state.content}/>}
                )}
            }>
                <EditButton/>
            </div>
        );
        return <ContentBlockPopup extraContent={extraContent}
                                  onDelete={this.handleDeleteContent.bind(this)}/>;
    }

    private getDesktopToolsContent() {
        return (
            <div onClick={() => {
                this.setState({hide: true}, () => {
                    InlineBlockAction.do(
                        OPEN_INLINE_BLOCK,
                        {
                            position: this.getPosition(),
                            content: <EmbedInline onSubmit={this.onUpdateUrl.bind(this)} content={this.state.content}/>
                        }
                    )
                });
            }}><EditButton/></div>
        )
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

    handleCloseInline() {
        if (this.state.hide) {
            this.setState({hide: false});
        }
    }

    private update(content: any) {
        if (!content.__meta) {
            let params: {url: string, type?: string} = {url: content.value};
            if (content.type == BlockContentTypes.VIDEO) {
                params.type = 'video';
            }
            api.post('/utils/embed/', params).then((response: any) => {
                console.log(response);
                if (response.data.embed) {
                    content.__meta = {embed: response.data.embed};
                    this.setState({content: content}, () => {
                        window.setTimeout(() => {
                            // TWITTER EMBED
                            twttr.widgets && twttr.widgets.load(document.getElementById(content.id));
                            // INSTAGRAM LOAD EMBED
                            instgrm.Embeds.process();
                        });
                    });
                }
            })
        }
        return content;
    }

    componentWillUpdate(nextState: any) {
        this.update(nextState.content);
    }

    componentDidMount() {
        ContentBlockAction.onChange(ACTIVATE_CONTENT_BLOCK, this.handleActive);
        InlineBlockAction.onChange(CLOSE_INLINE_BLOCK, this.handleCloseInline);
        this.update(this.state.content);
    }

    componentWillUnmount() {
        ContentBlockAction.unbind(ACTIVATE_CONTENT_BLOCK, this.handleActive);
        InlineBlockAction.unbind(CLOSE_INLINE_BLOCK, this.handleCloseInline);
    }

    render() {
        let progressLabel, className = 'content_block_embed';
        if (this.state.loaded) {
            className += ' loaded';
        }
        if (this.state.hide) {
            className += ' hide';
        }
        switch (this.state.content.type) {
            case BlockContentTypes.VIDEO:
                className += ' content_block_embed__video';
                progressLabel = Captions.editor.loading_video;
                break;
            case BlockContentTypes.AUDIO:
                className += ' content_block_embed__audio';
                progressLabel = Captions.editor.loading_audio;
                break;
            case BlockContentTypes.POST:
                className += ' content_block_embed__post';
                progressLabel = Captions.editor.loading_post;
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
                        {!this.state.loaded ?
                            <ProgressBar label={progressLabel}/>
                            : null
                        }
                    </div> : null
                }
            </BaseContentBlock>
        )
    }
}