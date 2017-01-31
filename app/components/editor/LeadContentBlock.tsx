import * as React from "react";
import {Captions, BlockContentTypes, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT, IContentData} from "../../actions/editor/ContentAction";
import * as toMarkdown from 'to-markdown';
import * as marked from 'marked';
import "../../styles/editor/lead_content_block.scss";
import {Validator} from "./utils";
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";

interface ILeadContent {
    id: string
    type: BlockContentTypes
    value: string
    __meta?: any
}

interface ILeadContentBlockProps {
    content: IContentData
    className?: string
}

interface ILeadContentBlockState {
    content?: ILeadContent
    isValid?: boolean
}

export default class LeadContentBlock extends React.Component<ILeadContentBlockProps, ILeadContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as ILeadContent,
            isValid: this.isValid(this.props.content as ILeadContent)
        }
    }

    private isValid(content: ILeadContent): boolean {
        return Validator.isValid(content, Validation.LEAD);
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleChange(content: string, contentText: string) {
        console.log(content, contentText);
        this.state.content.value = toMarkdown(content);
        let isValid = this.isValid(this.state.content);
        if (!isValid) {
            NotificationAction.do(SHOW_NOTIFICATION, {content: Validation.LEAD.value.message});
        }
        this.state.content.__meta = {is_valid: isValid};
        this.setState({content: this.state.content, isValid: isValid}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
        });
    }

    render() {
        let className = 'content_block_lead';
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
                                 placeholder={Captions.editor.enter_lead}/>
            </BaseContentBlock>
        )
    }
}