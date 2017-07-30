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
    SWAP_CONTENT_BLCK,
    MOVE_UP_CONTENT_BLCK,
    MOVE_DOWN_CONTENT_BLCK,
    SOFT_DELETE_CONTENT_BLCK,
    RESTORE_CONTENT_BLCK,
    UPDATE_THEME_CONTENT,
    SAVING_PROCESS
} from "../actions/editor/ContentAction";
import {Captions, BlockContentTypes, ArticleStatuses, Validation} from "../constants";
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from "../actions/shared/ModalAction";
import ColumnContentBlock from "./editor/ColumnContentBlock";
import {Validator} from "./editor/utils";
import {Error404, Error500, Error403} from "./Error";
import {api} from "../api";
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
import DeletedContentBlockInline from "./editor/DeletedContentBlockInline";
import LeftSideButton from "./shared/LeftSideButton";
import "../styles/editor.scss";
import "../styles/shared/left_tool_panel.scss";
import ArticlePublishingParamsModal from "./editor/ArticlePublishingParamsModal";

const PreviewButton = require('-!babel-loader!svg-react-loader!../assets/images/preview.svg?name=PreviewButton');
const PublishButton = require('-!babel-loader!svg-react-loader!../assets/images/publish.svg?name=PublishButton');


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


export default class Editor extends React.Component<any, any> {
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
            isDesktop: MediaQuerySerice.getIsDesktop(),
            isSavingArticle: ContentAction.getStore().savingProcess
        };
        this.resetContent = this.resetContent.bind(this);
        this.updateContent = this.updateContent.bind(this);
        this.forceUpdateContent = this.updateContent.bind(this, true);
        this.handleSavingProcess = this.handleSavingProcess.bind(this);
        this.handleResetContent = this.handleResetContent.bind(this);
        this.handleActiveBlock = this.handleActiveBlock.bind(this);
        this.handleOpenInlineBlock = this.handleOpenInlineBlock.bind(this);
        this.handleCloseInlineBlock = this.handleCloseInlineBlock.bind(this);
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleExit = this.handleExit.bind(this);
    }

    // static defaultProps: any = {
    //     newArticle: false
    // };

    route(url: string) {
        this.props.history.push(url);
    }

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
            this.setState({newArticle: false}, () => {
                this.createArticle(Object.assign(this.state.article, {content: store.content})).then((article: any) => {
                    this.setState({article: article, autoSave: true, isValid: isValid}, () => {
                        this.resetContent(this.state.autoSave);
                    });
                })
            });

        } else {
            this.setState({
                article: Object.assign({}, this.state.article, {content: store.content}),
                isValid: isValid,
                forceUpdate: isValid != this.state.isValid
            }, () => {
                this.resetContent(this.state.autoSave);
            });
        }
    }

    preview() {
        if (!this.state.isValid || this.state.isSavingArticle) return;

        this.resetContent(true).then((data: any) => {
            this.route(`/articles/${this.state.article.id}/preview`);
        });
    }

    _publishArticle() {
        this.resetContent();
        api.patch(`/articles/editor/${this.state.article.id}/`, this.state.article).then(() => {
            api.post(`/articles/editor/${this.state.article.id}/publish/`).then((response: any) => {
                this.setState({article: response.data}, () => {
                    ModalAction.do(CLOSE_MODAL, null);
                    NotificationAction.do(SHOW_NOTIFICATION, {content: 'Поздравляем, ваш материал опубликован.'});
                    this.route(`/articles/${this.state.article.slug}`);
                });
            }).catch((err: any) => {
                console.log(err);
                NotificationAction.do(SHOW_NOTIFICATION, {content: Captions.editor.publishing_error, type: 'error'});
                ModalAction.do(CLOSE_MODAL, null);
            });
        }).catch((err: any) => {
            console.log(err);
            NotificationAction.do(SHOW_NOTIFICATION, {content: Captions.editor.publishing_error, type: 'error'});
            ModalAction.do(CLOSE_MODAL, null);
        });

    }

    publishArticle() {
        if (!this.state.isValid || this.state.isSavingArticle) return;

        if (process.env.IS_LENTACH) {

            if (this.state.isDesktop) {
                if (confirm('Опубликовать материал?')) {
                    this._publishArticle();
                }
            } else {
                let content = <PopupPrompt confirmLabel="Опубликовать"
                                           onConfirm={() => {this._publishArticle(); PopupPanelAction.do(BACK_POPUP, null)}}/>;
                PopupPanelAction.do(OPEN_POPUP, {content: content});
            }

        } else {

            let onPublish = (article: any) => {
                Object.assign(this.state.article, article);
                this._publishArticle()
            };

            ModalAction.do(
                OPEN_MODAL,
                {
                    content: <ArticlePublishingParamsModal article={this.state.article} onPublish={onPublish}/>
                }
            );

        }
    }

    _updateArticle() {
        this.resetContent();
        api.patch(`/articles/editor/${this.state.article.id}/`, this.state.article).then(() => {
            ModalAction.do(CLOSE_MODAL, null);
            NotificationAction.do(SHOW_NOTIFICATION, {content: 'Публикация обновлена'});
            if (process.env.IS_LENTACH) {
                this.route(`/articles/${this.state.article.slug}`);
            }
        }).catch((err: any) => {
            console.log(err);
            NotificationAction.do(SHOW_NOTIFICATION, {content: Captions.editor.saving_error, type: 'error'});
            ModalAction.do(CLOSE_MODAL, null);
        });
    }

    updateArticle() {
        if (!this.state.isValid || this.state.isSavingArticle) return;

        if (process.env.IS_LENTACH) {

            if (this.state.isDesktop) {
                if (confirm('Обновить материал?')) {
                    this._updateArticle();
                }
            } else {
                let content = <PopupPrompt confirmLabel="Обновить"
                                           onConfirm={() => {this._updateArticle(); PopupPanelAction.do(BACK_POPUP, null)}}/>;
                PopupPanelAction.do(OPEN_POPUP, {content: content});
            }

        } else {

            let onUpdate = (article: any) => {
                Object.assign(this.state.article, article);
                this._updateArticle();
            };

            ModalAction.do(
                OPEN_MODAL,
                {
                    content: <ArticlePublishingParamsModal article={this.state.article}
                                                           onPublish={onUpdate}/>
                }
            );

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

    handleSavingProcess() {
        let isSavingProcess = ContentAction.getStore().savingProcess;
        if (isSavingProcess != this.state.isSavingArticle) {
            this.setState({isSavingArticle: isSavingProcess});
        }
    }

    handleResetContent() {
        this.state.article.id = this.state.article.id || ContentAction.getStore().articleId;
        this.state.article.content = ContentAction.getStore().content;
        if (this.state.article.id) {
            this.state.newArticle = false;
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
                    case 403:
                        this.setState({error: <Error403/>});
                        break;
                    case 404:
                        this.setState({error: <Error404/>});
                        break;
                    case 500:
                        this.setState({error: <Error500/>});
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

    b64EncodeUnicode (str: string) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return p1;
            // return String.fromCharCode('0x' + p1);
        }));
    }

    handleExit(e: Event) {
        console.log('HELLO')
        return false;
        // if (ContentAction.getStore().savingProcess) {
        //     return Captions.editor.onDangerousExit;
        // } else {
        //     return true;
        // }
    }

    componentWillReceiveProps(nextProps: any) {
        this.setState({
            article: {
                id: null,
                status: ArticleStatuses.DRAFT,
                content: {title: null, cover: null, blocks: [], inverted_theme: true}
            },
            autoSave: false,
            isValid: false
        }, () => {
            this.resetContent();
        });
        if (this.props.match.params && this.props.match.params.articleId != nextProps.match.params.articleId) {
            this.loadArticle(nextProps.match.params.articleId);
        }
    }

    componentDidMount() {
        ContentAction.onChange(UPDATE_CONTENT_BLCK, this.updateContent);
        ContentAction.onChange(
            [
                CREATE_CONTENT_BLCK, DELETE_CONTENT_BLCK, UPDATE_COVER_CONTENT, UPDATE_TITLE_CONTENT,
                UPDATE_THEME_CONTENT, SWAP_CONTENT_BLCK, MOVE_UP_CONTENT_BLCK, MOVE_DOWN_CONTENT_BLCK,
                SOFT_DELETE_CONTENT_BLCK, RESTORE_CONTENT_BLCK
            ],
            this.forceUpdateContent
        );
        ContentAction.onChange(RESET_CONTENT, this.handleResetContent);
        ContentAction.onChange(SAVING_PROCESS, this.handleSavingProcess);
        ContentBlockAction.onChange([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleActiveBlock);
        InlineBlockAction.onChange(OPEN_INLINE_BLOCK, this.handleOpenInlineBlock);
        InlineBlockAction.onChange(CLOSE_INLINE_BLOCK, this.handleCloseInlineBlock);
        MediaQuerySerice.listen(this.handleMediaQuery);

        if (this.state.newArticle) {
            this.setState({
                article: {
                    id: null,
                    status: ArticleStatuses.DRAFT,
                    content: {title: '', cover: null, blocks: [], inverted_theme: true}
                },
                autoSave: false,
                isValid: false
            }, () => {
                this.resetContent();
            });
        } else {
            this.loadArticle(this.props.match.params.articleId);
        }

        document.addEventListener('click', this.handleDocumentClick);
        window.addEventListener("beforeunload", this.handleExit);
    }

    componentWillUnmount() {
        ContentAction.unbind(UPDATE_CONTENT_BLCK, this.updateContent);
        ContentAction.unbind(
            [
                CREATE_CONTENT_BLCK, DELETE_CONTENT_BLCK, UPDATE_COVER_CONTENT, UPDATE_TITLE_CONTENT,
                UPDATE_THEME_CONTENT, SWAP_CONTENT_BLCK, MOVE_UP_CONTENT_BLCK, MOVE_DOWN_CONTENT_BLCK,
                SOFT_DELETE_CONTENT_BLCK, RESTORE_CONTENT_BLCK
            ],
            this.forceUpdateContent
        );
        ContentAction.unbind(RESET_CONTENT, this.handleResetContent);
        ContentAction.unbind(SAVING_PROCESS, this.handleSavingProcess);
        ContentBlockAction.unbind([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleActiveBlock);
        PopupPanelAction.do(CLOSE_POPUP, null);
        InlineBlockAction.unbind(OPEN_INLINE_BLOCK, this.handleOpenInlineBlock);
        InlineBlockAction.unbind(CLOSE_INLINE_BLOCK, this.handleCloseInlineBlock);
        MediaQuerySerice.unbind(this.handleMediaQuery);
        document.removeEventListener('click', this.handleDocumentClick);
        window.removeEventListener("beforeunload", this.handleExit);
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
                            // TITLE BLOCK
                            this.props.newArticle ?
                                <TitleBlock key={'titleBlockNew'}
                                            articleSlug={null}
                                            title={''}
                                            cover={null}
                                            invertedTheme={this.state.article.content.inverted_theme}
                                            autoSave={this.state.autoSave}/> :
                                <TitleBlock key={titleBlockKey}
                                            articleSlug={this.state.article.id}
                                            title={this.state.article.content.title}
                                            cover={this.state.article.content.cover}
                                            invertedTheme={this.state.article.content.inverted_theme}
                                            autoSave={this.state.autoSave}/>,
                            // CONTENT
                            this.state.article.id ?
                                <div key={"articleContent" + this.state.article.id} className="editor__content">
                                    {this.state.article.content.blocks.map((contentBlock: IContentData, index: number) => {
                                        let blockHandlerButtons, block, isLast = index == this.state.article.content.blocks.length - 1;
                                        blockHandlerButtons = [BlockContentTypes.ADD];

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
                                                let hash = this.b64EncodeUnicode((contentBlock as any).value);
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
                                                <InlineBlock key={"inlineBlock" + index}>{this.state.inlineBlock.content}</InlineBlock>,
                                                block
                                            ]
                                        } else {
                                            return [
                                                <BlockHandler key={"handler" + index}
                                                              articleId={this.state.article.id}
                                                              blockPosition={index}
                                                              items={blockHandlerButtons}/>,
                                                contentBlock.__meta && contentBlock.__meta.deleted ?
                                                    <DeletedContentBlockInline key={"deletedBlock" + contentBlock.id}
                                                                               content={contentBlock}/> : block
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
                                                          items={this.state.article.content.blocks.length ?
                                                            [BlockContentTypes.TEXT, BlockContentTypes.ADD, BlockContentTypes.PHOTO] :
                                                            [BlockContentTypes.ADD]}/>
                                            : null
                                    }
                                </div> : null,
                            // BUTTONS DESKTOP
                            (this.state.isDesktop && this.state.article.id && this.state.article.status == ArticleStatuses.DRAFT ?
                                <div key="articleButtons" className="article_buttons">
                                    <div className={"article_buttons__button"  + (!this.state.isValid || this.state.isSavingArticle ? ' disabled': '')}
                                         onClick={this.publishArticle.bind(this)}>
                                        <PublishButton/> Опубликовать
                                    </div>
                                    <div className={"article_buttons__button"  + (!this.state.isValid || this.state.isSavingArticle ? ' disabled': '')}
                                         onClick={this.preview.bind(this)}>
                                        <PreviewButton/> Предпросмотр
                                    </div>
                                </div> : null),
                            (this.state.isDesktop && this.state.article.id && this.state.article.status == ArticleStatuses.PUBLISHED ?
                                <div key="articleButtons" className={"article_buttons" + (!this.state.isValid || this.state.isSavingArticle ? ' disabled': '')}>
                                    <div className={"article_buttons__button"  + (!this.state.isValid || this.state.isSavingArticle ? ' disabled': '')}
                                         onClick={this.updateArticle.bind(this, true)}>
                                        <PublishButton/> Обновить публикацию
                                    </div>
                                </div> : null),
                            // BUTTONS MOBILE
                            (!this.state.isDesktop ?
                                [
                                    (this.state.article.id && this.state.article.status == ArticleStatuses.DRAFT ?
                                        <div key="publish_button"
                                             className={"editor__publish" + (!this.state.isValid || this.state.isSavingArticle ? ' disabled': '')}
                                             onClick={this.publishArticle.bind(this)}>
                                            Опубликовать
                                        </div> : null),
                                    (this.state.article.id && this.state.article.status == ArticleStatuses.PUBLISHED ?
                                        <div key="update_publish_button"
                                             className={"editor__publish" + (!this.state.isValid || this.state.isSavingArticle ? ' disabled': '')}
                                             onClick={this.updateArticle.bind(this, true)}>
                                            Обновить публикацию
                                        </div> : null)
                                ] : null
                            ),
                            // TOOLS
                            this.state.isDesktop && this.state.article.id ?
                                <div className="left_tool_panel">
                                    {this.state.article.status == ArticleStatuses.DRAFT ?
                                        [
                                            <LeftSideButton key="toolPublish"
                                                            tooltip="Опубликовать"
                                                            onClick={this.publishArticle.bind(this)}
                                                            disabled={!this.state.isValid || this.state.isSavingArticle}>
                                                <PublishButton/>
                                            </LeftSideButton>,
                                            <LeftSideButton key="toolPreview"
                                                            tooltip="Предпросмотр"
                                                            onClick={this.preview.bind(this)}
                                                            disabled={!this.state.isValid || this.state.isSavingArticle}>
                                                <PreviewButton/>
                                            </LeftSideButton>
                                        ] : null
                                    }
                                    {this.state.article.status == ArticleStatuses.PUBLISHED ?
                                        <LeftSideButton key="toolUpdatePublish"
                                                        tooltip="Обновить публикацию"
                                                        onClick={this.updateArticle.bind(this, true)}
                                                        disabled={!this.state.isValid || this.state.isSavingArticle}>
                                            <PublishButton/>
                                        </LeftSideButton> : null
                                    }
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
        return <Editor newArticle={true} match={this.props.match} history={this.props.history}/>;
    }
}