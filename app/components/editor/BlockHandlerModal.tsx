import * as React from 'react'
import BlockHandlerButton from './BlockHandlerButton';
import {BlockContentTypes, Captions} from '../../constants';
import {ModalAction, CLOSE_MODAL} from '../../actions/shared/ModalAction';
import '../../styles/editor/block_handler_modal.scss';


interface IBlockHandlerModal {
    articleSlug: string
    blockPosition: number
}


export class BlockHandlerModal extends React.Component<IBlockHandlerModal, any> {
    constructor(props: any) {
        super(props);
    }

    handleClick() {
        ModalAction.do(CLOSE_MODAL, {content: null});
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
            <div className="block_handler_modal">
                {items.map((item) => {
                    return (
                        <div className="block_handler_modal__item">
                            <BlockHandlerButton type={item.type}
                                                articleSlug={this.props.articleSlug}
                                                blockPosition={this.props.blockPosition}
                                                onClick={this.handleClick.bind(this)}/>
                            <div className="block_handler_modal__caption">{item.caption}</div>
                        </div>
                    )
                })}
            </div>
        )
    }
}