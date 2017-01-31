import * as React from "react";
import {Captions, BlockContentTypes, Validation} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT, IContentData} from "../../actions/editor/ContentAction";
import "../../styles/editor/header_content_block.scss";
import {Validator} from "./utils";
import {NotificationAction, SHOW_NOTIFICATION} from "../../actions/shared/NotificationAction";

interface IHeaderContent {
    id: string
    type: BlockContentTypes
    value: string
    __meta?: any
}

interface IHeaderContentBlockProps {
    content: IContentData
    className?: string
}

interface IHeaderContentBlockState {
    content?: IHeaderContent
    isValid?: boolean
}

export default class HeaderContentBlock extends React.Component<IHeaderContentBlockProps, IHeaderContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IHeaderContent,
            isValid: this.isValid(this.props.content as IHeaderContent)
        }
    }

    private isValid(content: IHeaderContent): boolean {
        return Validator.isValid(content, Validation.HEADER);
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleChange(content: string, contentText: string) {
        console.log(content, contentText);
        this.state.content.value = contentText;
        let isValid = this.isValid(this.state.content);
        if (!isValid) {
            NotificationAction.do(SHOW_NOTIFICATION, {content: Validation.HEADER.value.message});
        }
        this.state.content.__meta = {is_valid: isValid};
        this.setState({content: this.state.content, isValid: isValid}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
        });
    }

    render() {
        let className = 'content_block_header';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        !this.state.isValid && (className += ' invalid');
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                <ContentEditable elementType="inline"
                                 allowLineBreak={false}
                                 onFocus={this.handleFocus.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={0}
                                 content={this.state.content.value}
                                 placeholder={Captions.editor.enter_header}/>
            </BaseContentBlock>
        )
    }
}