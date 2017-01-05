import * as React from 'react';
import {BlockContentTypes} from '../../constants';
import {BlockHandlerAction, OPEN_BLOCK_HANDLER_MODAL} from '../../actions/editor/BlockHandlerAction';
import {ContentAction, CREATE_CONTENT, SWAP_CONTENT, IContentData} from '../../actions/editor/ContentAction';
import {api} from '../../api';
import '../../styles/editor/block_handler_button.scss';

const AddIcon = require('babel!svg-react!../../assets/images/redactor_icon_add.svg?name=AddIcon');
const SwapIcon = require('babel!svg-react!../../assets/images/redactor_icon_swing.svg?name=SwapIcon');
const TextIcon = require('babel!svg-react!../../assets/images/redactor_icon_text.svg?name=TextIcon');
const HeaderIcon = require('babel!svg-react!../../assets/images/redactor_icon_h2.svg?name=HeaderIcon');
const LeadIcon = require('babel!svg-react!../../assets/images/redactor_icon_lead.svg?name=LeadIcon');
const VideoIcon = require('babel!svg-react!../../assets/images/redactor_icon_video.svg?name=VideoIcon');
const AudioIcon = require('babel!svg-react!../../assets/images/redactor_icon_music.svg?name=AudioIcon');
const PhotoIcon = require('babel!svg-react!../../assets/images/redactor_icon_image.svg?name=PhotoIcon');
const PostIcon = require('babel!svg-react!../../assets/images/redactor_icon_post.svg?name=PostIcon');
const QuoteIcon = require('babel!svg-react!../../assets/images/redactor_icon_quote.svg?name=QuoteIcon');
const ColumnsIcon = require('babel!svg-react!../../assets/images/redactor_icon_column.svg?name=ColumnsIcon');
const ListIcon = require('babel!svg-react!../../assets/images/redactor_icon_list.svg?name=ListIcon');
const DialogIcon = require('babel!svg-react!../../assets/images/redactor_icon_dialog.svg?name=DialogIcon');
const PhraseIcon = require('babel!svg-react!../../assets/images/redactor_icon_phrase.svg?name=PhraseIcon');

type Size = "small" | "normal";


interface IContentButtonProps {
    type: BlockContentTypes
    size?: Size
    articleId: number
    blockPosition: number
    onClick?: () => any
}


export default class BlockHandlerButton extends React.Component<IContentButtonProps, any> {
    constructor(props: any) {
        super(props);
        this.state = this.getButtonProps();
    }

    static defaultProps = {
        size: "normal"
    };

    private createContent(type: BlockContentTypes) {
        api.post('/articles/content/', {
            articleId: this.props.articleId
        })
    }

    private getButtonProps(): {icon: any, onClick: () => any} {
        switch (this.props.type) {
            case BlockContentTypes.ADD:
                return {
                    icon: <AddIcon/>,
                    onClick: () => {
                        BlockHandlerAction.do(
                            OPEN_BLOCK_HANDLER_MODAL,
                            {articleId: this.props.articleId, blockPosition: this.props.blockPosition}
                        )
                    }
                };
            case BlockContentTypes.SWAP_BLOCKS:
                return {
                    icon: <SwapIcon/>,
                    onClick: () => {
                        console.log('SWAP BLOCKS');
                        ContentAction.do(
                            SWAP_CONTENT,
                            {articleId: this.props.articleId, position: this.props.blockPosition}
                        );
                    }
                };
            case BlockContentTypes.TEXT:
                return {
                    icon: <TextIcon/>,
                    onClick: () => {
                        console.log('ADD TEXT');
                        let data: IContentData = {
                            type: BlockContentTypes.TEXT,
                            article: this.props.articleId,
                            position: this.props.blockPosition,
                            text: ''
                        };
                        ContentAction.do(CREATE_CONTENT, data);
                    }
                };
            case BlockContentTypes.HEADER:
                return {
                    icon: <HeaderIcon/>,
                    onClick: () => {
                        console.log('ADD HEADER');
                        let data: IContentData = {
                            type: BlockContentTypes.HEADER,
                            article: this.props.articleId,
                            position: this.props.blockPosition,
                            text: ''
                        };
                        ContentAction.do(CREATE_CONTENT, data);
                    }
                };
            case BlockContentTypes.LEAD:
                return {
                    icon: <LeadIcon/>,
                    onClick: () => {
                        console.log('ADD LEAD')
                    }
                };
            case BlockContentTypes.VIDEO:
                return {
                    icon: <VideoIcon/>,
                    onClick: () => {
                        console.log('ADD VIDEO')
                    }
                };
            case BlockContentTypes.PHOTO:
                return {
                    icon: <PhotoIcon/>,
                    onClick: () => {
                        console.log('ADD PHOTO')
                    }
                };
            case BlockContentTypes.AUDIO:
                return {
                    icon: <AudioIcon/>,
                    onClick: () => {
                        console.log('ADD AUDIO')
                    }
                };
            case BlockContentTypes.QUOTE:
                return {
                    icon: <QuoteIcon/>,
                    onClick: () => {
                        console.log('ADD QUOTE')
                    }
                };
            case BlockContentTypes.COLUMNS:
                return {
                    icon: <ColumnsIcon/>,
                    onClick: () => {
                        console.log('ADD COLUMNS')
                    }
                };
            case BlockContentTypes.PHRASE:
                return {
                    icon: <PhraseIcon/>,
                    onClick: () => {
                        console.log('ADD PHRASE')
                    }
                };
            case BlockContentTypes.LIST:
                return {
                    icon: <ListIcon/>,
                    onClick: () => {
                        console.log('ADD TEXT')
                    }
                };
            case BlockContentTypes.DIALOG:
                return {
                    icon: <DialogIcon/>,
                    onClick: () => {
                        console.log('ADD DIALOG')
                    }
                };
            case BlockContentTypes.POST:
                return {
                    icon: <PostIcon/>,
                    onClick: () => {
                        console.log('ADD POST')
                    }
                };
        }
    }

    handleClick() {
        this.state.onClick();
        if (this.props.onClick) this.props.onClick();
    }

    render() {
        let className = 'block_handler_button';
        if (this.props.size == 'small') {
            className += ' small';
        }
        return (
            <div onClick={this.handleClick.bind(this)} className={className}>
                {this.state.icon}
            </div>
        )
    }
}
