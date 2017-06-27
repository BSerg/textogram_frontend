import * as React from "react";
import BlockHandlerButton from "./BlockHandlerButton";
import {BlockContentTypes, Captions} from "../../constants";
import "../../styles/editor/block_handler_inline.scss";
import {InlineBlockAction, CLOSE_INLINE_BLOCK} from "../../actions/editor/InlineBlockAction";

const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/close.svg?name=CloseIcon');


interface IBlockHandlerInline {
    articleId: number
    blockPosition: number
}


export class BlockHandlerInline extends React.Component<IBlockHandlerInline, any> {
    constructor(props: any) {
        super(props);
    }

    close() {
        InlineBlockAction.do(CLOSE_INLINE_BLOCK, null);
    }

    render() {
        let items = [
            {type: BlockContentTypes.TEXT, caption: Captions.editor.content_text},
            {type: BlockContentTypes.HEADER, caption: Captions.editor.content_header},
            {type: BlockContentTypes.LEAD, caption: Captions.editor.content_lead},
            {type: BlockContentTypes.VIDEO, caption: Captions.editor.content_video},
            {type: BlockContentTypes.PHOTO, caption: Captions.editor.content_photo},
            {type: BlockContentTypes.AUDIO, caption: Captions.editor.content_audio},
            {type: BlockContentTypes.QUOTE, caption: Captions.editor.content_quote},
            {type: BlockContentTypes.COLUMNS, caption: Captions.editor.content_columns},
            {type: BlockContentTypes.PHRASE, caption: Captions.editor.content_phrase},
            {type: BlockContentTypes.LIST, caption: Captions.editor.content_list},
            {type: BlockContentTypes.DIALOG, caption: Captions.editor.content_dialog},
            {type: BlockContentTypes.POST, caption: Captions.editor.content_post},
        ];
        return (
            <div className="block_handler_inline">
                {items.map((item) => {
                    return (
                        <div className="block_handler_inline__item">
                            <BlockHandlerButton type={item.type}
                                                size="small"
                                                articleId={this.props.articleId}
                                                blockPosition={this.props.blockPosition}
                                                onClick={this.close.bind(this)}/>
                            <div className="block_handler_inline__caption">{item.caption}</div>
                        </div>
                    )
                })}
            </div>
        )
    }
}