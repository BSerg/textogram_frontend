import * as React from "react";
import {BlockContentTypes, ListBlockContentTypes} from "../../constants";
import {BlockHandlerAction, OPEN_BLOCK_HANDLER_MODAL} from "../../actions/editor/BlockHandlerAction";
import {api} from "../../api";
import "../../styles/editor/block_handler_button.scss";
import {ContentAction, CREATE_CONTENT, SWAP_CONTENT, IContentData} from "../../actions/editor/ContentAction";
import ListContentBlock from "./ListContentBlock";
import {UploadImageAction, UPLOAD_IMAGE} from "../../actions/editor/UploadImageAction";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";
import EmbedModal from "./EmbedModal";

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
    refs: {
        inputUpload: HTMLInputElement
    };

    constructor(props: any) {
        super(props);
        this.state = this.getButtonProps();
    }

    static defaultProps = {
        size: "normal"
    };

    private getButtonProps(): {icon: any, extraContent?: any, onClick: () => any} {
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
                            {position: this.props.blockPosition}
                        );
                    }
                };
            case BlockContentTypes.TEXT:
                return {
                    icon: <TextIcon/>,
                    onClick: () => {
                        console.log('ADD TEXT');
                        let data= {
                            contentBlock: {
                                type: BlockContentTypes.TEXT,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT, data);
                    }
                };
            case BlockContentTypes.HEADER:
                return {
                    icon: <HeaderIcon/>,
                    onClick: () => {
                        console.log('ADD HEADER');
                        let data= {
                            contentBlock: {
                                type: BlockContentTypes.HEADER,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT, data);

                    }
                };
            case BlockContentTypes.LEAD:
                return {
                    icon: <LeadIcon/>,
                    onClick: () => {
                        console.log('ADD LEAD');
                        let data= {
                            contentBlock: {
                                type: BlockContentTypes.LEAD,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT, data);
                    }
                };
            case BlockContentTypes.VIDEO:
                return {
                    icon: <VideoIcon/>,
                    onClick: () => {
                        console.log('ADD VIDEO');
                        let content = {
                            type: BlockContentTypes.VIDEO,
                            value: "",
                        };
                        window.setTimeout(() => {
                            ModalAction.do(
                                OPEN_MODAL,
                                {content: <EmbedModal blockPosition={this.props.blockPosition}
                                                      content={content}/>}
                            );
                        }, 0);
                    }
                };
            case BlockContentTypes.PHOTO:
                return {
                    icon: <PhotoIcon/>,
                    onClick: () => {
                        console.log('ADD PHOTO');
                        let data: IContentData = {
                            type: BlockContentTypes.PHOTO,
                            photos: []
                        };
                        ContentAction.do(CREATE_CONTENT, {contentBlock: data, position: this.props.blockPosition});
                    }
                };
            case BlockContentTypes.AUDIO:
                return {
                    icon: <AudioIcon/>,
                    onClick: () => {
                        console.log('ADD AUDIO');
                        let content = {
                            type: BlockContentTypes.AUDIO,
                            value: "",
                        };
                        window.setTimeout(() => {
                            ModalAction.do(
                                OPEN_MODAL,
                                {content: <EmbedModal blockPosition={this.props.blockPosition}
                                                      content={content}/>}
                            );
                        }, 0);
                        }
                };
            case BlockContentTypes.QUOTE:
                return {
                    icon: <QuoteIcon/>,
                    onClick: () => {
                        console.log('ADD QUOTE');
                        let data: {contentBlock: IContentData, position: number} = {
                            contentBlock: {
                                type: BlockContentTypes.QUOTE,
                                image: null,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT, data);
                    }
                };
            case BlockContentTypes.COLUMNS:
                return {
                    icon: <ColumnsIcon/>,
                    onClick: () => {
                        console.log('ADD COLUMNS');
                        let data: {contentBlock: IContentData, position: number} = {
                            contentBlock: {
                                type: BlockContentTypes.COLUMNS,
                                image: null,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT, data);
                    }
                };
            case BlockContentTypes.PHRASE:
                return {
                    icon: <PhraseIcon/>,
                    onClick: () => {
                        let data= {
                            contentBlock: {
                                type: BlockContentTypes.PHRASE,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT, data);
                    }
                };
            case BlockContentTypes.LIST:
                return {
                    icon: <ListIcon/>,
                    onClick: () => {
                        console.log('ADD LIST');
                        let data= {
                            contentBlock: {
                                type: BlockContentTypes.LIST,
                                subtype: ListBlockContentTypes.UNORDERED,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT, data);
                    }
                };
            case BlockContentTypes.DIALOG:
                return {
                    icon: <DialogIcon/>,
                    onClick: () => {
                        console.log('ADD DIALOG');
                        let questioner: any = {
                            id: 1,
                            avatar: null,
                            name: 'Sarah',
                            is_interviewer: true
                        };
                        let answerer: any = {
                            id: 2,
                            avatar: null,
                            name: 'John'
                        };
                        let data: any = {
                            contentBlock: {
                                type: BlockContentTypes.DIALOG,
                                recipients: [questioner, answerer],
                                remarks: [
                                    {recipient: questioner, value: ""},
                                    {recipient: answerer, value: ""}
                                ],
                            },
                            position: this.props.blockPosition
                        };
                        console.log(data)
                        ContentAction.do(CREATE_CONTENT, data);
                    }
                };
            case BlockContentTypes.POST:
                return {
                    icon: <PostIcon/>,
                    onClick: () => {
                        console.log('ADD POST');
                        let content = {
                            type: BlockContentTypes.POST,
                            value: "",
                        };
                        window.setTimeout(() => {
                            ModalAction.do(
                                OPEN_MODAL,
                                {content: <EmbedModal blockPosition={this.props.blockPosition}
                                                      content={content}/>}
                            );
                        }, 0);
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
                {this.state.extraContent ? this.state.extraContent : null}
            </div>
        )
    }
}
