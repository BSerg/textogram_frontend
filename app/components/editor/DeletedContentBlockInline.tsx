import * as React from "react";
import {Captions, BlockContentTypes} from "../../constants";
import {
    IContentData,
    ContentAction,
    RESTORE_CONTENT_BLCK,
    DELETE_CONTENT_BLCK
} from "../../actions/editor/ContentAction";
import "../../styles/editor/deleted_content_block_inline.scss";
import {MediaQuerySerice} from "../../services/MediaQueryService";

const CloseButton = require('babel!svg-react!../../assets/images/close.svg?name=CloseButton');



interface IDeletedContentBlockInlineProps {
    content: IContentData;
    blockPosition?: number;
    onRestore?: () => any;
    onSubmit?: () => any;
}

interface IDeletedContentBlockInlineState {
    content?: IContentData;
    isDesktop?: boolean;
}

export default class DeletedContentBlockInline extends React.Component<IDeletedContentBlockInlineProps, IDeletedContentBlockInlineState> {
    constructor(props: any) {
        super(props);
        this.state = {
            content: this.props.content,
            isDesktop: MediaQuerySerice.getIsDesktop()
        };
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
    }

    handleMediaQuery() {
        this.setState({isDesktop: MediaQuerySerice.getIsDesktop()})
    }

    restore() {
        ContentAction.do(RESTORE_CONTENT_BLCK, {id: this.state.content.id});
    }

    close() {
        ContentAction.do(DELETE_CONTENT_BLCK, {id: this.state.content.id});
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.handleMediaQuery);
    }

    render() {
        let text = '';
        switch (this.state.content.type) {
            case BlockContentTypes.TEXT:
                text = Captions.editor.deleted_text_block;
                break;
            case BlockContentTypes.HEADER:
                text = Captions.editor.deleted_header_block;
                break;
            case BlockContentTypes.LEAD:
                text = Captions.editor.deleted_lead_block;
                break;
            case BlockContentTypes.PHOTO:
                text = Captions.editor.deleted_photo_block;
                break;
            case BlockContentTypes.AUDIO:
                text = Captions.editor.deleted_audio_block;
                break;
            case BlockContentTypes.VIDEO:
                text = Captions.editor.deleted_video_block;
                break;
            case BlockContentTypes.QUOTE:
                text = Captions.editor.deleted_quote_block;
                break;
            case BlockContentTypes.COLUMNS:
                text = Captions.editor.deleted_column_block;
                break;
            case BlockContentTypes.LIST:
                text = Captions.editor.deleted_list_block;
                break;
            case BlockContentTypes.DIALOG:
                text = Captions.editor.deleted_dialog_block;
                break;
            case BlockContentTypes.POST:
                text = Captions.editor.deleted_post_block;
                break;
        }
        return (
            <div className="deleted_content_block_inline">
                {this.state.isDesktop ? <span className="deleted_content_block_inline__text">{text}</span> : null}
                <span className="deleted_content_block_inline__restore"
                      onClick={this.restore.bind(this)}>{Captions.editor.restore}</span>
                <div className="deleted_content_block_inline__close"
                     onClick={this.close.bind(this)}><CloseButton/></div>
            </div>
        )
    }
}