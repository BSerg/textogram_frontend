import * as React from 'react';
import {Captions, Constants, BlockContentTypes} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import BaseContentBlock from './BaseContentBlock';
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from '../../actions/editor/ContentBlockAction';
import {ContentAction, UPDATE_CONTENT, IContentData} from '../../actions/editor/ContentAction';
import * as toMarkdown from 'to-markdown';
import '../../styles/editor/text_content_block.scss';
import * as marked from 'marked';

interface ITextContent {
    id: string
    type: BlockContentTypes
    value: string
}

interface ITextContentBlockProps {
    content: IContentData
    className?: string
}

interface ITextContentBlockState {
    content: ITextContent
}

export default class TextContentBlock extends React.Component<ITextContentBlockProps, ITextContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as ITextContent
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
        // TODO more flexible component updating!
        return false;
    }

    render() {
        let className = 'content_block_text';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                <ContentEditable onFocus={this.handleFocus.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={1000}
                                 content={marked(this.state.content.value)}
                                 placeholder={Captions.editor.enter_text}/>
            </BaseContentBlock>
        )
    }
}