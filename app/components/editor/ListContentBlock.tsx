import * as React from 'react';
import {Captions, Constants, ListBlockContentTypes, BlockContentTypes} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import BaseContentBlock from './BaseContentBlock';
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from '../../actions/editor/ContentBlockAction';
import {ContentAction, UPDATE_CONTENT, IContentData} from '../../actions/editor/ContentAction';
import * as toMarkdown from 'to-markdown';
import '../../styles/editor/list_content_block.scss';
import * as marked from 'marked';

interface IListContent {
    id: string
    type: BlockContentTypes
    subtype: ListBlockContentTypes
    value: string
}

interface IListContentBlockProps {
    content: IContentData
    className?: string
}

interface IListContentBlockState {
    content: IListContent
}

export default class ListContentBlock extends React.Component<IListContentBlockProps, IListContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IListContent
        }
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleChange(content: string, contentText: string) {
        console.log(content, contentText);
        this.state.content.value = toMarkdown(content);
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
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
        switch (this.state.content.subtype) {
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
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={1000}
                                 enableTextFormat={true}
                                 content={marked(this.state.content.value)}
                                 placeholder={Captions.editor.enter_list}/>
            </BaseContentBlock>
        )
    }
}