import * as React from 'react';
import TitleBlock from './editor/TitleBlock'
import BlockHandler from './editor/BlockHandler';
import BaseContentBlock from './editor/BaseContentBlock';
import TextContentBlock from './editor/TextContentBlock';
import {ContentAction, CREATE_CONTENT, DELETE_CONTENT, SWAP_CONTENT} from '../actions/editor/ContentAction';
import {Captions, BlockContentTypes} from '../constants'
import Error from './Error';
import {api} from '../api';

import '../styles/editor.scss';


interface IEditorState {
    article?: any,
    error?: any
}


export default class Editor extends React.Component<any, IEditorState> {
    constructor(props: any) {
        super(props);
    }

    processContentBlock(contentBlock: any) {
        return contentBlock;
    }

    processContent(content: any[]) {
        return content.map((contentBlock: any) => {
            return this.processContentBlock(contentBlock);
        });
    }

    handleCreateContent() {
        let store: any = ContentAction.getStore();
        let item = store.actionMap[CREATE_CONTENT];
        console.log(item);
        this.state.article.content = this.state.article.content.map((_item: any, index: number) => {
            if (index >= item.position) {
                _item.position++;
            }
            return _item;
        });
        this.state.article.content.splice(item.position, 0, item);
        console.log(this.state.article);
        this.setState({article: this.state.article});
    }

    handleDeleteContent() {
        let store = ContentAction.getStore();
    }

    handleSwapContent() {
        let store = ContentAction.getStore();
    }

    componentDidMount() {
        api.get(`/articles/editor/${this.props.params.articleSlug}/`).then((response: any) => {
            console.log(response);
            this.setState({article: response.data});
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

        ContentAction.onChange(CREATE_CONTENT, this.handleCreateContent.bind(this));
        ContentAction.onChange(DELETE_CONTENT, this.handleCreateContent.bind(this));
        ContentAction.onChange(SWAP_CONTENT, this.handleSwapContent.bind(this));
    }

    componentWillUnmount() {
        ContentAction.unbind(CREATE_CONTENT, this.handleCreateContent.bind(this));
        ContentAction.unbind(DELETE_CONTENT, this.handleCreateContent.bind(this));
        ContentAction.unbind(SWAP_CONTENT, this.handleSwapContent.bind(this));
    }

    render() {
        return (
            <div className="editor">
                <div className="editor__wrapper">
                    {this.state && this.state.article && !this.state.error ?
                        [
                            <TitleBlock key="titleBlock" articleSlug={this.props.params.articleSlug}
                                title={this.state.article.title}
                                cover={this.state.article.cover}/>,

                            this.state.article.content.map((contentBlock: any, index: number) => {
                                let blockHandlerButtons, block;
                                if (index == 0) {
                                    blockHandlerButtons = [BlockContentTypes.ADD]
                                }

                                switch (contentBlock.type) {
                                    case BlockContentTypes.TEXT:
                                        block = <TextContentBlock key={"content" + contentBlock.id} content={contentBlock}/>
                                }

                                return [
                                    <BlockHandler key={"handler" + contentBlock.position}
                                                  articleId={this.state.article.id}
                                                  blockPosition={contentBlock.position}
                                                  items={blockHandlerButtons}/>,
                                    block
                                ]
                            }),
                            <BlockHandler key={"handler" + this.state.article.content.length}
                                          articleId={this.state.article.id}
                                          blockPosition={this.state.article.content.length}
                                          isLast={true}
                                          items={[
                                              BlockContentTypes.TEXT,
                                              BlockContentTypes.ADD,
                                              BlockContentTypes.PHOTO
                                          ]}/>,
                            <div key="add_content_help" className="add_content_help">{Captions.editor.add_content_help}</div>
                        ] : null
                    }
                    {this.state && this.state.error ? this.state.error : null}
                </div>
            </div>
        )
    }
}