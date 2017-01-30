import * as React from 'react';
import {Captions, Constants, BlockContentTypes, Validation} from '../../constants';
import ContentEditable from '../shared/ContentEditable';
import BaseContentBlock from './BaseContentBlock';
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from '../../actions/editor/ContentBlockAction';
import {ContentAction, UPDATE_CONTENT, IContentData} from '../../actions/editor/ContentAction';
import {NotificationAction, SHOW_NOTIFICATION, CLOSE_NOTIFICATION} from '../../actions/shared/NotificationAction';
import {Validator} from "./utils";
import * as toMarkdown from 'to-markdown';
import * as marked from 'marked';
import '../../styles/editor/text_content_block.scss';

interface ITextContent {
    id: string
    type: BlockContentTypes
    value: string,
    __meta?: any
}

interface ITextContentBlockProps {
    content: IContentData
    className?: string
}

interface ITextContentBlockState {
    content?: ITextContent,
    isValid?: boolean
}

export default class TextContentBlock extends React.Component<ITextContentBlockProps, ITextContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as ITextContent,
            isValid: this.isValid(this.props.content as ITextContent)
        }
    }

    private isValid(content: ITextContent): boolean {
        return Validator.isValid(content, Validation.TEXT);
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleChange(content: string, contentText: string) {
        this.state.content.value = toMarkdown(content);
        let isValid = this.isValid(this.state.content);
        if (!isValid && isValid != this.state.isValid) {
            NotificationAction.do(SHOW_NOTIFICATION, {content: "Текст ограничен"});
        }
        this.state.content.__meta = {is_valid: isValid};
        this.setState({content: this.state.content, isValid: isValid}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
        });
    }

    render() {
        let className = 'content_block_text';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        !this.state.isValid && (className += ' invalid');
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                <ContentEditable onFocus={this.handleFocus.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={0}
                                 content={marked(this.state.content.value)}
                                 enableTextFormat={true}
                                 placeholder={Captions.editor.enter_text}/>
            </BaseContentBlock>
        )
    }
}