import * as React from 'react'
import BlockHandlerButton from './BlockHandlerButton';
import {BlockContentTypes, Captions} from '../../constants';
import {ModalAction, CLOSE_MODAL} from '../../actions/shared/ModalAction';
import '../../styles/editor/block_handler_modal.scss';

const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/close.svg?name=CloseIcon');


interface IBlockHandlerModal {
    articleId: number
    blockPosition: number
}


export class BlockHandlerModal extends React.Component<IBlockHandlerModal, any> {
    constructor(props: any) {
        super(props);
    }

    closeModal() {
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
                <div className="block_handler_modal__header">
                    <CloseIcon className="block_handler_modal__close" onClick={this.closeModal.bind(this)}/>
                </div>
                <div className="block_handler_modal__content">
                    {items.map((item) => {
                        return (
                            <div className="block_handler_modal__item">
                                <BlockHandlerButton type={item.type}
                                                    articleId={this.props.articleId}
                                                    blockPosition={this.props.blockPosition}
                                                    onClick={this.closeModal.bind(this)}/>
                                <div className="block_handler_modal__caption">{item.caption}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}