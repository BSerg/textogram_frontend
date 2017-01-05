import * as React from "react";
import {Captions} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT} from "../../actions/editor/ContentAction";
import "../../styles/editor/header_content_block.scss";

interface IHeaderContent {
    id: number
    article: number
    position: number
    text: string
}

interface IHeaderContentBlockProps {
    content: IHeaderContent
    className?: string
}

interface IHeaderContentBlockState {
    content: IHeaderContent
}

export default class HeaderContentBlock extends React.Component<IHeaderContentBlockProps, IHeaderContentBlockState> {
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
        this.state.content.text = contentText;
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT, this.state.content);
        });
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        // TODO more flexible component updating!
        return false;
    }

    render() {
        let className = 'content_block_header';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                <ContentEditable elementType="inline"
                                 allowLineBreak={false}
                                 onFocus={this.handleFocus.bind(this)}
                                 onBlur={this.handleBlur.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={1000}
                                 content={this.state.content.text}
                                 placeholder={Captions.editor.enter_header}/>
            </BaseContentBlock>
        )
    }
}