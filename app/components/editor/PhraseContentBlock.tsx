import * as React from "react";
import {Captions, BlockContentTypes} from "../../constants";
import ContentEditable from "../shared/ContentEditable";
import BaseContentBlock from "./BaseContentBlock";
import {ContentBlockAction, ACTIVATE_CONTENT_BLOCK} from "../../actions/editor/ContentBlockAction";
import {ContentAction, UPDATE_CONTENT, IContentData} from "../../actions/editor/ContentAction";
import "../../styles/editor/phrase_content_block.scss";

interface IPhraseContent {
    id: string
    type: BlockContentTypes
    value: string
}

interface IPhraseContentBlockProps {
    content: IContentData
    className?: string
}

interface IPhraseContentBlockState {
    content: IPhraseContent
}

export default class PhraseContentBlock extends React.Component<IPhraseContentBlockProps, IPhraseContentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content as IPhraseContent
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
        let className = 'content_block_phrase';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <BaseContentBlock id={this.props.content.id} className={className}>
                <ContentEditable elementType="inline"
                                 allowLineBreak={false}
                                 onFocus={this.handleFocus.bind(this)}
                                 onChange={this.handleChange.bind(this)}
                                 onChangeDelay={1000}
                                 content={this.state.content.value}
                                 placeholder={Captions.editor.enter_phrase}/>
            </BaseContentBlock>
        )
    }
}