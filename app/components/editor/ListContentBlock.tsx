import * as React from 'react';
import {Captions, Constants, ListBlockContentTypes} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import BaseContentBlock from './BaseContentBlock';
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from '../../actions/editor/ContentBlockAction';
import {ContentAction, UPDATE_CONTENT} from '../../actions/editor/ContentAction';
import * as toMarkdown from 'to-markdown';
import '../../styles/editor/list_content_block.scss';
import * as marked from 'marked';

interface IListContent {
    id: number
    article: number
    type: ListBlockContentTypes
    position: number
    text: string
}

interface IListContentBlockProps {
    content: IListContent
    className?: string
}

interface IListContentBlockState {
    content: IListContent
}

export default class ListContentBlock extends React.Component<IListContentBlockProps, IListContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content
        }
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleBlur() {
        // ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: -1});
    }

    handleChange(content: string, contentText: string) {
        console.log(content, contentText);
        this.state.content.text = toMarkdown(content);
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT, this.state.content);
        });
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        return nextState.content.type != this.state.content.type;
    }

    render() {
        let className = 'content_block_list';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        let type;
        switch (this.state.content.type) {
            case ListBlockContentTypes.UNORDERED:
                type = 'ul';
                break;
            case ListBlockContentTypes.ORDERED:
                type = 'ol';
                break;
        }
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                <ContentEditable elementType='ul'
                                 onFocus={this.handleFocus.bind(this)}
                                 onBlur={this.handleBlur.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={1000}
                                 content={marked(this.state.content.text)}
                                 placeholder={Captions.editor.enter_list}/>
            </BaseContentBlock>
        )
    }
}