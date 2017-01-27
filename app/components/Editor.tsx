import * as React from "react";
import TitleBlock from "./editor/TitleBlock";
import BlockHandler from "./editor/BlockHandler";
import TextContentBlock from "./editor/TextContentBlock";
import HeaderContentBlock from "./editor/HeaderContentBlock";
import LeadContentBlock from "./editor/LeadContentBlock";
import PhraseContentBlock from "./editor/PhraseContentBlock";
import PhotoContentBlock from "./editor/PhotoContentBlock";
import ListContentBlock from "./editor/ListContentBlock";
import QuoteContentBlock from "./editor/QuoteContentBlock";
import EmbedContentBlock from "./editor/EmbedContentBlock";
import {
    ContentAction,
    RESET_CONTENT,
    UPDATE_CONTENT,
    DELETE_CONTENT,
    CREATE_CONTENT,
    IContentData,
    UPDATE_COVER_CONTENT,
    UPDATE_TITLE_CONTENT,
    SWAP_CONTENT
} from "../actions/editor/ContentAction";
import {NotificationAction, SHOW_NOTIFICATION, CLOSE_NOTIFICATION} from '../actions/shared/NotificationAction';
import {Captions, BlockContentTypes, ArticleStatuses, Validation} from "../constants";
import {ModalAction, OPEN_MODAL} from "../actions/shared/ModalAction";
import PublishingParamsModal from "./editor/PublishingParamsModal";
import ColumnContentBlock from "./editor/ColumnContentBlock";
import {Validator} from "./editor/utils";
import Error from "./Error";
import {api} from "../api";
import "../styles/editor.scss";
import DialogContentBlock from "./editor/DialogContentBlock";


interface IEditorState {
    article?: any,
    isValid?: boolean,
    error?: any,
    autoSave?: boolean
}


export default class Editor extends React.Component<any, IEditorState> {
    forceUpdateContent: (forceUpdate?: boolean) => void;

    constructor(props: any) {
        super(props);
        this.state = {
            article: null,
            isValid: true,
            error: null,
            autoSave: true
        };
        this.resetContent = this.resetContent.bind(this);
        this.updateContent = this.updateContent.bind(this);
        this.forceUpdateContent = this.updateContent.bind(this, true);
    }

    processContentBlock(block: IContentData) {
        return block;
    }

    processContent(content: {title: string, cover: number, blocks: IContentData[]}) {
        content.blocks = content.blocks.map((block: IContentData) => {
            return this.processContentBlock(block);
        });
        return content;
    }

    validateContent(content: any, config: any) {
        let isValid = Validator.isValid(content, config);
        for (let index in content.blocks || []) {
            let block = content.blocks[index], validationConfig;
            switch (block.type) {
                case BlockContentTypes.TEXT:
                    validationConfig = Validation.TEXT;
                    break;
                case BlockContentTypes.HEADER:
                    validationConfig = Validation.HEADER;
                    break;
                case BlockContentTypes.LEAD:
                    validationConfig = Validation.LEAD;
                    break;
                case BlockContentTypes.QUOTE:
                    validationConfig = Validation.QUOTE;
                    break;
                case BlockContentTypes.COLUMNS:
                    validationConfig = Validation.COLUMN;
                    break;
                case BlockContentTypes.PHRASE:
                    validationConfig = Validation.PHRASE;
                    break;
                case BlockContentTypes.LIST:
                    validationConfig = Validation.LIST;
                    break;
            }
            if (!Validator.isValid(block, validationConfig)) {
                isValid = false;
            }
        }
        return isValid;
    }

    resetContent(save: boolean = false) {
        ContentAction.do(
            RESET_CONTENT,
            {articleId: this.state.article.id, autoSave: save, content: this.state.article.content}
        )
    }

    updateContent(forceUpdate: boolean = false): void {
        let store: any = ContentAction.getStore();
        this.state.article.content = store.content;
        let isValid = this.validateContent(store.content, Validation.ROOT);
        if (isValid != this.state.isValid) {
            forceUpdate = true;
        }
        if (forceUpdate) {
            this.setState({article: this.state.article, isValid: isValid}, () => {
                window.setTimeout(() => {
                    this.resetContent(this.state.autoSave);
                });
            });
        } else {
            window.setTimeout(() => {
                this.resetContent(this.state.autoSave);
            });
        }
    }

    openPublishParamsModal() {
        ModalAction.do(OPEN_MODAL, {content: <PublishingParamsModal article={this.state.article}/>});
    }

    publish() {
        console.log('PUBLISH');
        api.post(`/articles/editor/${this.state.article.id}/publish/`).then((response: any) => {
            console.log(response);
        });
    }

    componentDidMount() {
        api.get(`/articles/editor/${this.props.params.articleId}/`).then((response: any) => {
            this.setState({article: response.data, autoSave: response.data.status == ArticleStatuses.DRAFT}, () => {
                this.resetContent(false);
            });
        }). catch((error) => {
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        this.setState({error: <Error code={404} msg="Page not found"/>});
                        break;
                    case 500:
                        this.setState({error: <Error/>});
                        break;
                }
            }
        });

        ContentAction.onChange(UPDATE_CONTENT, this.updateContent);
        ContentAction.onChange(
            [CREATE_CONTENT, DELETE_CONTENT, UPDATE_COVER_CONTENT, UPDATE_TITLE_CONTENT, SWAP_CONTENT],
            this.forceUpdateContent
        );
    }

    componentWillUnmount() {
        ContentAction.unbind(UPDATE_CONTENT, this.updateContent);
        ContentAction.unbind(
            [CREATE_CONTENT, DELETE_CONTENT, UPDATE_COVER_CONTENT, UPDATE_TITLE_CONTENT, SWAP_CONTENT],
            this.forceUpdateContent
        );
    }

    render() {
        return (
            <div className="editor">
                <div className="editor__wrapper">
                    {this.state.article && !this.state.error ?
                        [
                            <TitleBlock key="titleBlock" articleSlug={this.props.params.articleId}
                                title={this.state.article.content.title}
                                cover={this.state.article.content.cover}/>,
                            this.state.article.content.blocks.map((contentBlock: IContentData, index: number) => {
                                let blockHandlerButtons, block;

                                if (index == 0) {
                                    blockHandlerButtons = [BlockContentTypes.ADD]
                                } else {
                                    blockHandlerButtons = [BlockContentTypes.SWAP_BLOCKS, BlockContentTypes.ADD]
                                }

                                switch (contentBlock.type) {
                                    case BlockContentTypes.TEXT:
                                        block = <TextContentBlock key={"content" + contentBlock.id}
                                                                  content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.LEAD:
                                        block = <LeadContentBlock key={"content" + contentBlock.id}
                                                                  content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.HEADER:
                                        block = <HeaderContentBlock key={"content" + contentBlock.id}
                                                                    content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.PHRASE:
                                        block = <PhraseContentBlock key={"content" + contentBlock.id}
                                                                    content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.LIST:
                                        block = <ListContentBlock key={"content" + contentBlock.id}
                                                                  content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.PHOTO:
                                        block = <PhotoContentBlock key={"content" + contentBlock.id}
                                                                   articleId={this.state.article.id}
                                                                   content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.QUOTE:
                                        block = <QuoteContentBlock key={"content" + contentBlock.id}
                                                                   articleId={this.state.article.id}
                                                                   content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.VIDEO:
                                        block = <EmbedContentBlock key={"content" + contentBlock.id}
                                                                   content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.AUDIO:
                                        block = <EmbedContentBlock key={"content" + contentBlock.id}
                                                                   content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.POST:
                                        let hash = btoa((contentBlock as any).value);
                                        block = <EmbedContentBlock key={"content-" + contentBlock.id + '-' + hash}
                                                                   content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.COLUMNS:
                                        block = <ColumnContentBlock key={"content-" + contentBlock.id}
                                                                    articleId={this.state.article.id}
                                                                    content={contentBlock}/>;
                                        break;
                                    case BlockContentTypes.DIALOG:
                                        console.log(contentBlock)
                                        block = <DialogContentBlock key={"content-" + contentBlock.id}
                                                                    articleId={this.state.article.id}
                                                                    content={contentBlock}/>;
                                        break;
                                }

                                return [
                                    <BlockHandler key={"handler" + index}
                                                  articleId={this.state.article.id}
                                                  blockPosition={index}
                                                  items={blockHandlerButtons}/>,
                                    block
                                ]
                            }),
                            <BlockHandler key="handlerLast"
                                          articleId={this.state.article.id}
                                          blockPosition={this.state.article.content.blocks.length}
                                          isLast={true}
                                          items={[
                                              BlockContentTypes.TEXT,
                                              BlockContentTypes.ADD,
                                              BlockContentTypes.PHOTO
                                          ]}/>,
                            <div key="add_content_help" className="add_content_help">
                                {!this.state.article.content.blocks.length ?
                                    Captions.editor.add_content_help : null
                                }
                            </div>,
                            (this.state.article.status == ArticleStatuses.DRAFT ?
                                <div className={"editor__publish" + (!this.state.isValid ? ' disabled': '')}
                                     onClick={this.state.isValid && this.openPublishParamsModal.bind(this)}>
                                    Опубликовать
                                </div> : null),
                            (this.state.article.status == ArticleStatuses.PUBLISHED ?
                                <div className={"editor__publish" + (!this.state.isValid ? ' disabled': '')}
                                     onClick={this.state.isValid && this.resetContent.bind(this, true)}>
                                    Обновить публикацию
                                </div> : null),

                        ]
                        : null
                    }
                </div>
            </div>
        )
    }
}