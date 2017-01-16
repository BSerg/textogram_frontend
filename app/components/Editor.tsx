import * as React from 'react';
import TitleBlock from './editor/TitleBlock'
import BlockHandler from './editor/BlockHandler';
import BaseContentBlock from './editor/BaseContentBlock';
import TextContentBlock from './editor/TextContentBlock';
import HeaderContentBlock from './editor/HeaderContentBlock';
import LeadContentBlock from './editor/LeadContentBlock';
import PhraseContentBlock from './editor/PhraseContentBlock';
import PhotoContentBlock from './editor/PhotoContentBlock';
import ListContentBlock from './editor/ListContentBlock';
import QuoteContentBlock from './editor/QuoteContentBlock';
import {
    ContentAction, RESET_CONTENT, UPDATE_CONTENT, DELETE_CONTENT, CREATE_CONTENT, IContentData, UPDATE_COVER_CONTENT,
    UPDATE_TITLE_CONTENT, SWAP_CONTENT
} from '../actions/editor/ContentAction';
import {Captions, BlockContentTypes, ArticleStatuses} from '../constants'
import Error from './Error';
import {api} from '../api';

import '../styles/editor.scss';
import {ModalAction, OPEN_MODAL} from "../actions/shared/ModalAction";
import PublishingParamsModal from "./editor/PublishingParamsModal";


interface IEditorState {
    article?: any,
    error?: any,
    autoSave?: boolean
}


export default class Editor extends React.Component<any, IEditorState> {
    constructor(props: any) {
        super(props);
        this.state = {
            article: null,
            error: null,
            autoSave: true
        };
        this.handleUpdateContent = this.handleUpdateContent.bind(this);
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

    handleUpdateContent() {
        let store: any = ContentAction.getStore();
        this.state.article.content = store.content;
        this.setState({article: this.state.article}, () => {
            ContentAction.do(
                RESET_CONTENT,
                {articleId: this.state.article.id, autoSave: this.state.autoSave, content: this.state.article.content}
            )
        });
    }

    openPublishParamsModal() {
        ModalAction.do(OPEN_MODAL, {content: <PublishingParamsModal articleId={this.state.article.id}/>});
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
                ContentAction.do(
                    RESET_CONTENT,
                    {articleId: this.state.article.id, autoSave: false, content: this.state.article.content}
                );
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

        ContentAction.onChange(
            [CREATE_CONTENT, UPDATE_CONTENT, DELETE_CONTENT, UPDATE_COVER_CONTENT, UPDATE_TITLE_CONTENT, SWAP_CONTENT],
            this.handleUpdateContent
        );
    }

    componentWillUnmount() {
        ContentAction.unbind(
            [CREATE_CONTENT, UPDATE_CONTENT, DELETE_CONTENT, UPDATE_COVER_CONTENT, UPDATE_TITLE_CONTENT, SWAP_CONTENT],
            this.handleUpdateContent
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
                                <div className="editor__publish"
                                     onClick={this.openPublishParamsModal.bind(this)}>
                                    Опубликовать
                                </div> : null),
                            (this.state.article.status == ArticleStatuses.PUBLISHED ?
                                <div className="editor__publish"
                                     onClick={this.handleUpdateContent.bind(this)}>
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