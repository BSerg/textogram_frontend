import * as React from 'react';
import {Captions, Constants} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import BaseContentBlock from './BaseContentBlock';
import {ActivateContentBlockAction, ACTIVATE_CONTENT_BLOCK} from '../../actions/editor/ActivateContentBlockAction';
import {ContentAction, UPDATE_CONTENT} from '../../actions/editor/ContentAction';
import * as toMarkdown from 'to-markdown';
import '../../styles/editor/text_content_block.scss';


import * as marked from 'marked';

interface ITextContent {
    id: number
    article: number
    position: number
    text: string
}

interface ITextContentBlockProps {
    content: ITextContent
}

interface ITextContentBlockState {
    content: ITextContent
}

export default class TextContentBlock extends React.Component<ITextContentBlockProps, ITextContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content
        }
    }

    handleFocus() {
        ActivateContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleBlur() {
        ActivateContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: -1});
    }

    handleChange(content: string, contentText: string) {
        console.log(content, contentText);
        this.state.content.text = toMarkdown(content);
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT, this.state.content);
        });
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        // TODO more flexible component updating!
        return false;
    }

    render() {
        return (
            <BaseContentBlock id={this.props.content.id} className="content_block_text">
                <ContentEditable onFocus={this.handleFocus.bind(this)}
                                 onBlur={this.handleBlur.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={1000}
                                 content={marked(this.state.content.text)}
                                 placeholder={Captions.editor.enter_text}/>
            </BaseContentBlock>
        )
    }
}