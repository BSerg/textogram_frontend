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
    UPDATE_CONTENT_BLCK,
    DELETE_CONTENT_BLCK,
    CREATE_CONTENT_BLCK,
    IContentData,
    UPDATE_COVER_CONTENT,
    UPDATE_TITLE_CONTENT,
    SWAP_CONTENT_BLCK
} from "../actions/editor/ContentAction";
import {Captions, BlockContentTypes, ArticleStatuses, Validation} from "../constants";
import {ModalAction, OPEN_MODAL} from "../actions/shared/ModalAction";
import PublishingParamsModal from "./editor/PublishingParamsModal";
import ColumnContentBlock from "./editor/ColumnContentBlock";
import {Validator} from "./editor/utils";
import Error from "./Error";
import {api} from "../api";
import "../styles/editor.scss";
import DialogContentBlock from "./editor/DialogContentBlock";
import {
    ContentBlockAction,
    ACTIVATE_CONTENT_BLOCK,
    DEACTIVATE_CONTENT_BLOCK
} from "../actions/editor/ContentBlockAction";
import {PopupPanelAction, CLOSE_POPUP, OPEN_POPUP, BACK_POPUP} from "../actions/shared/PopupPanelAction";
import {InlineBlockAction, OPEN_INLINE_BLOCK, CLOSE_INLINE_BLOCK} from "../actions/editor/InlineBlockAction";
import InlineBlock from "./editor/InlineBlock";
import {MediaQuerySerice} from "../services/MediaQueryService";
import {NotificationAction, SHOW_NOTIFICATION} from "../actions/shared/NotificationAction";
import PopupPrompt from "./shared/PopupPrompt";
import {UserAction} from "../actions/user/UserAction";
import {Link} from 'react-router';

const PreviewButton = require('babel!svg-react!../assets/images/preview.svg?name=PreviewButton');
const PublishButton = require('babel!svg-react!../assets/images/publish.svg?name=PublishButton');


interface IEditorProps {
    newArticle?: boolean
    params?: any
    router?: any
}

interface IEditorState {
    newArticle?: boolean
    article?: any
    isValid?: boolean
    error?: any
    autoSave?: boolean
    showLastBlockHandler?: boolean
    isSavingArticle?: boolean
    isDesktop?: boolean
    inlineBlock?: {position: number, content: any}
}


export default class Editor extends React.Component<IEditorProps, IEditorState> {
    forceUpdateContent: (forceUpdate?: boolean) => void;

    refs: {
        editor: HTMLDivElement
    };

    constructor(props: any) {
        super(props);
        this.state = {
            newArticle: this.props.newArticle,
            article: null,
            isValid: true,
            error: null,
            autoSave: true,
            showLastBlockHandler: true,
            inlineBlock: null,
            isDesktop: MediaQuerySerice.getIsDesktop()
        };
        this.resetContent = this.resetContent.bind(this);
        this.updateContent = this.updateContent.bind(this);
        this.forceUpdateContent = this.updateContent.bind(this, true);
        this.handleActiveBlock = this.handleActiveBlock.bind(this);
        this.handleOpenInlineBlock = this.handleOpenInlineBlock.bind(this);
        this.handleCloseInlineBlock = this.handleCloseInlineBlock.bind(this);
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
    }

    static defaultProps = {
        newArticle: false
    };

    createArticle(article: any) {
        return api.post('/articles/editor/', article).then((response: any) => {
            NotificationAction.do(SHOW_NOTIFICATION, {content: Captions.editor.article_created});
            return response.data;
        });
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
        return ContentAction.doAsync(
            RESET_CONTENT,
            {articleId: this.state.article.id, autoSave: save, content: this.state.article.content}
        )
    }

    updateContent(forceUpdate: boolean = false): void {
        let store: any = ContentAction.getStore();
        let isValid = this.validateContent(store.content, Validation.ROOT);
        if (this.state.newArticle) {
            this.createArticle(Object.assign(this.state.article, {content: store.content})).then((article: any) => {
                this.state.article = article;
                this.state.autoSave = true;
                this.state.newArticle = false;
                // this.setState({article: article, autoSave: true, newArticle: false});
            })
        } else {
            this.state.article.content = store.content;
            if (isValid != this.state.isValid) {
                forceUpdate = true;
            }
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
        ModalAction.do(
            OPEN_MODAL,
            {
                content: <PublishingParamsModal article={this.state.article}
                                                onPublish={(article: any) => {this.setState({article: article})}}/>
            }
        );
    }

    prePublish() {
        if (this.state.isDesktop) {
            if (confirm('Опубликовать материал?')) {
                this.publish();
            }
        } else {
            let content = <PopupPrompt confirmLabel="Опубликовать" onConfirm={this.publish.bind(this)}/>;
            PopupPanelAction.do(OPEN_POPUP, {content: content});
        }

    }

    publish() {
        api.post(`/articles/editor/${this.state.article.id}/publish/`).then((response: any) => {
            this.setState({article: response.data}, () => {
                NotificationAction.do(SHOW_NOTIFICATION, {content: 'Поздравляем, ваш материал опубликован.'});
                // this.props.router.push(`/profile/${UserAction.getStore().user.id}`);
                this.props.router.push(`/articles/${this.state.article.slug}`);
            });
        });
    }

    _updateArticle() {
        if (this.state.isDesktop) {

        } else {
            PopupPanelAction.do(BACK_POPUP, null);
        }
        this.resetContent(true).then(() => {
            NotificationAction.do(SHOW_NOTIFICATION, {content: 'Публикация обновлена'});
        });
    }

    updateArticle() {
        if (this.state.isDesktop) {
            if (confirm('Обновить?')) {
                this._updateArticle();
            }
        } else {
            let content = <PopupPrompt confirmLabel="Обновить" onConfirm={this._updateArticle.bind(this)}/>;
            PopupPanelAction.do(OPEN_POPUP, {content: content});
        }
    }

    handleActiveBlock() {
        let store = ContentBlockAction.getStore();
        this.setState({showLastBlockHandler: store.id == -1});
    }

    handleOpenInlineBlock() {
        let store = InlineBlockAction.getStore();
        this.setState({inlineBlock: store});
    }

    handleCloseInlineBlock() {
        this.setState({inlineBlock: null});
    }

    handleMediaQuery(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    loadArticle(articleId: number) {
        api.get(`/articles/editor/${articleId}/`).then((response: any) => {
            this.setState({
                article: response.data,
                autoSave: response.data.status == ArticleStatuses.DRAFT,
                isValid: this.validateContent(response.data.content, Validation.ROOT)
            }, () => {
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
    }

    handleDocumentClick(e: Event) {
        e.stopPropagation();
        if ((e.target as HTMLElement).classList.contains('editor__wrapper')) {
            ContentBlockAction.do(DEACTIVATE_CONTENT_BLOCK, null);
        }
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.params.articleId != nextProps.params.articleId) {
            this.loadArticle(nextProps.params.articleId);
        }
    }

    componentDidMount() {
        ContentAction.onChange(UPDATE_CONTENT_BLCK, this.updateContent);
        ContentAction.onChange(
            [CREATE_CONTENT_BLCK, DELETE_CONTENT_BLCK, UPDATE_COVER_CONTENT, UPDATE_TITLE_CONTENT, SWAP_CONTENT_BLCK],
            this.forceUpdateContent
        );
        ContentBlockAction.onChange([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleActiveBlock);
        InlineBlockAction.onChange(OPEN_INLINE_BLOCK, this.handleOpenInlineBlock);
        InlineBlockAction.onChange(CLOSE_INLINE_BLOCK, this.handleCloseInlineBlock);
        MediaQuerySerice.listen(this.handleMediaQuery);

        if (this.state.newArticle) {
            this.setState({
                article: {id: null, status: ArticleStatuses.DRAFT, content: ContentAction.getStore().content},
                autoSave: false,
                isValid: false
            });
        } else {
            this.loadArticle(this.props.params.articleId);
        }

        document.addEventListener('click', this.handleDocumentClick);
    }

    componentWillUnmount() {
        ContentAction.unbind(UPDATE_CONTENT_BLCK, this.updateContent);
        ContentAction.unbind(
            [CREATE_CONTENT_BLCK, DELETE_CONTENT_BLCK, UPDATE_COVER_CONTENT, UPDATE_TITLE_CONTENT, SWAP_CONTENT_BLCK],
            this.forceUpdateContent
        );
        ContentBlockAction.unbind([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleActiveBlock);
        PopupPanelAction.do(CLOSE_POPUP, null);
        InlineBlockAction.unbind(OPEN_INLINE_BLOCK, this.handleOpenInlineBlock);
        InlineBlockAction.unbind(CLOSE_INLINE_BLOCK, this.handleCloseInlineBlock);
        MediaQuerySerice.unbind(this.handleMediaQuery);
    }

    render() {
        let titleBlockKey = 'titleBlock';
        if (this.props.newArticle) {
            titleBlockKey += 'New';
        } else if (this.state.article && this.state.article.id) {
            titleBlockKey += this.state.article.id;
        }
        return (
            <div ref="editor" onClick={this.handleDocumentClick.bind(this)} className="editor">
                <div className="editor__wrapper">
                    {this.state.article && !this.state.error ?
                        [
                            <TitleBlock key={titleBlockKey}
                                        articleSlug={this.state.article.id}
                                        title={this.state.article.content.title}
                                        cover={this.state.article.content.cover}
                                        coverClipped={this.state.article.content.cover_clipped}
                                        autoSave={this.state.autoSave}/>,
                            <div className="editor__content">
                                {this.state.article.content.blocks.map((contentBlock: IContentData, index: number) => {
                                    let blockHandlerButtons, block, isLast = index == this.state.article.content.blocks.length - 1;

                                    if (index == 0) {
                                        blockHandlerButtons = [BlockContentTypes.ADD]
                                    } else {
                                        blockHandlerButtons = [BlockContentTypes.SWAP_BLOCKS, BlockContentTypes.ADD]
                                    }

                                    switch (contentBlock.type) {
                                        case BlockContentTypes.TEXT:
                                            block = <TextContentBlock key={"content" + contentBlock.id}
                                                                      className={isLast ? 'last' : ''}
                                                                      content={contentBlock}/>;
                                            break;
                                        case BlockContentTypes.LEAD:
                                            block = <LeadContentBlock key={"content" + contentBlock.id}
                                                                      className={isLast ? 'last' : ''}
                                                                      content={contentBlock}/>;
                                            break;
                                        case BlockContentTypes.HEADER:
                                            block = <HeaderContentBlock key={"content" + contentBlock.id}
                                                                        className={isLast ? 'last' : ''}
                                                                        content={contentBlock}/>;
                                            break;
                                        case BlockContentTypes.PHRASE:
                                            block = <PhraseContentBlock key={"content" + contentBlock.id}
                                                                        className={isLast ? 'last' : ''}
                                                                        content={contentBlock}/>;
                                            break;
                                        case BlockContentTypes.LIST:
                                            block = <ListContentBlock key={"content" + contentBlock.id}
                                                                      className={isLast ? 'last' : ''}
                                                                      content={contentBlock}/>;
                                            break;
                                        case BlockContentTypes.PHOTO:
                                            block = <PhotoContentBlock key={"content" + contentBlock.id}
                                                                       className={isLast ? 'last' : ''}
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
                                                                       className={isLast ? 'last' : ''}
                                                                       content={contentBlock}/>;
                                            break;
                                        case BlockContentTypes.AUDIO:
                                            block = <EmbedContentBlock key={"content" + contentBlock.id}
                                                                       className={isLast ? 'last' : ''}
                                                                       content={contentBlock}/>;
                                            break;
                                        case BlockContentTypes.POST:
                                            let hash = btoa((contentBlock as any).value);
                                            block = <EmbedContentBlock key={"content-" + contentBlock.id + '-' + hash}
                                                                       className={isLast ? 'last' : ''}
                                                                       content={contentBlock}/>;
                                            break;
                                        case BlockContentTypes.COLUMNS:
                                            block = <ColumnContentBlock key={"content-" + contentBlock.id}
                                                                        className={isLast ? 'last' : ''}
                                                                        articleId={this.state.article.id}
                                                                        content={contentBlock}/>;
                                            break;
                                        case BlockContentTypes.DIALOG:
                                            block = <DialogContentBlock key={"content-" + contentBlock.id}
                                                                        className={isLast ? 'last' : ''}
                                                                        articleId={this.state.article.id}
                                                                        content={contentBlock}/>;
                                            break;
                                    }

                                    if (this.state.isDesktop && this.state.inlineBlock && this.state.inlineBlock.position == index) {
                                        return [
                                            <InlineBlock>{this.state.inlineBlock.content}</InlineBlock>,
                                            block
                                        ]
                                    } else {
                                        return [
                                            <BlockHandler key={"handler" + index}
                                                          articleId={this.state.article.id}
                                                          blockPosition={index}
                                                          items={blockHandlerButtons}/>,
                                            block
                                        ]
                                    }
                                })}
                                {this.state.showLastBlockHandler || this.state.isDesktop ?
                                    this.state.isDesktop && this.state.inlineBlock && this.state.inlineBlock.position == this.state.article.content.blocks.length ?
                                        <InlineBlock>{this.state.inlineBlock.content}</InlineBlock>
                                        : <BlockHandler key="handlerLast"
                                                      articleId={this.state.article.id}
                                                      blockPosition={this.state.article.content.blocks.length}
                                                      isLast={true}
                                                      items={[
                                                          BlockContentTypes.ADD,
                                                      ]}/>
                                        : null
                                }
                            </div>,
                            <div key="add_content_help" className="add_content_help"></div>,
                            (this.state.article.status == ArticleStatuses.DRAFT ?
                                <div key="publish_button"
                                     className={"editor__publish" + (!this.state.isValid ? ' disabled': '')}
                                     onClick={this.state.isValid && this.prePublish.bind(this)}>
                                    Опубликовать
                                </div> : null),
                            (this.state.article.status == ArticleStatuses.PUBLISHED ?
                                <div key="update_publish_button"
                                     className={"editor__publish" + (!this.state.isValid ? ' disabled': '')}
                                     onClick={this.state.isValid && this.updateArticle.bind(this, true)}>
                                    Обновить публикацию
                                </div> : null),
                            (this.state.article.status == ArticleStatuses.SHARED ?
                                <div key="save_button"
                                     className={"editor__publish" + (!this.state.isValid ? ' disabled': '')}
                                     onClick={this.state.isValid && this.resetContent.bind(this, true)}>
                                    Сохранить
                                </div> : null),
                            this.state.isDesktop && this.state.article.status == ArticleStatuses.DRAFT && this.state.article.id ?
                                <div className="tools_panel">
                                    <div className="tools_panel__item">
                                        <div className="tools_panel__caption">Просмотр</div>
                                        <Link to={`/articles/${this.state.article.id}/preview`}
                                              className="tools_panel__icon"><PreviewButton/></Link>
                                    </div>
                                    <div className="tools_panel__item">
                                        <div className="tools_panel__caption">Опубликовать</div>
                                        <div onClick={this.prePublish.bind(this)}
                                             className="tools_panel__icon"><PublishButton/></div>
                                    </div>
                                </div> : null
                        ] : null
                    }
                </div>
                <div id="selection_tools"></div>
            </div>
        )
    }
}

export class NewArticleEditor extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return <Editor router={this.props.router} newArticle={true}/>;
    }
}