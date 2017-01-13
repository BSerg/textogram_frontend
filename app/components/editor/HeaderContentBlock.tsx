import * as React from "react";
import {Captions, BlockContentTypes} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT, IContentData} from "../../actions/editor/ContentAction";
import "../../styles/editor/header_content_block.scss";

interface IHeaderContent {
    id: string
    type: BlockContentTypes
    value: string
}

interface IHeaderContentBlockProps {
    content: IContentData
    className?: string
}

interface IHeaderContentBlockState {
    content: IHeaderContent
}

export default class HeaderContentBlock extends React.Component<IHeaderContentBlockProps, IHeaderContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IHeaderContent
        }
    }

    handleFocus() {
        ContentBlockAction.do(ACTIVATE_CONTENT_BLOCK, {id: this.props.content.id});
    }

    handleChange(content: string, contentText: string) {
        console.log(content, contentText);
        this.state.content.value = contentText;
        this.setState({content: this.state.content}, () => {
            ContentAction.do(UPDATE_CONTENT, {contentBlock: this.state.content});
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
                                 onChange={this.handleChange.bind(this)}
                                 content={this.state.content.value}
                                 placeholder={Captions.editor.enter_header}/>
            </BaseContentBlock>
        )
    }
}