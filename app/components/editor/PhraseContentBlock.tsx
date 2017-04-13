import * as React from "react";
import {Captions, BlockContentTypes, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT_BLCK, IContentData} from "../../actions/editor/ContentAction";
import "../../styles/editor/phrase_content_block.scss";
import {Validator} from "./utils";
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";

interface IPhraseContent {
    id: string
    type: BlockContentTypes
    value: string
    __meta?: any
}

interface IPhraseContentBlockProps {
    content: IContentData
    className?: string
}

type contentLengthState = 'short' | 'normal' | 'long';

interface IPhraseContentBlockState {
    content?: IPhraseContent;
    isValid?: boolean;
    contentLengthState?: contentLengthState;
}

export default class PhraseContentBlock extends React.Component<IPhraseContentBlockProps, IPhraseContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IPhraseContent,
            isValid: this.isValid(this.props.content as IPhraseContent),
            contentLengthState: this.getContentLengthState((this.props.content as IPhraseContent).value)
        }
    }

    private isValid(content: IPhraseContent): boolean {
        return Validator.isValid(content, Validation.PHRASE);
    }

    private getContentLengthState(value: string) {
        if (value.length <= 70) {
            return 'short';
        } else if (value.length <= 200) {
            return 'normal';
        } else {
            return 'long';
        }
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleChange(content: string, contentText: string) {
        this.state.content.value = contentText;
        let isValid = this.isValid(this.state.content);
        if (!isValid) {
            NotificationAction.do(SHOW_NOTIFICATION, {content: Validation.PHRASE.value.message});
        }
        this.state.content.__meta = {is_valid: isValid};
        this.setState({
            content: this.state.content,
            isValid: isValid,
            contentLengthState: this.getContentLengthState(contentText)
        }, () => {
            ContentAction.do(UPDATE_CONTENT_BLCK, {contentBlock: this.state.content});
        });
    }

    render() {
        let className = 'content_block_phrase';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        if (this.state.contentLengthState != 'normal') {
            className += ' ' + this.state.contentLengthState;
        }
        !this.state.isValid && (className += ' invalid');
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                <ContentEditable elementType="inline"
                                 allowLineBreak={false}
                                 onFocus={this.handleFocus.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={0}
                                 alignContent="center"
                                 content={this.state.content.value}
                                 placeholder={Captions.editor.enter_phrase}/>
            </BaseContentBlock>
        )
    }
}