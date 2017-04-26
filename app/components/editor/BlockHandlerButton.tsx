import * as React from "react";
import {BlockContentTypes, ListBlockContentTypes} from "../../constants";
import {BlockHandlerAction, OPEN_BLOCK_HANDLER_MODAL} from "../../actions/editor/BlockHandlerAction";
import "../../styles/editor/block_handler_button.scss";
import {ContentAction, CREATE_CONTENT_BLCK, SWAP_CONTENT_BLCK, IContentData} from "../../actions/editor/ContentAction";
import {ModalAction, OPEN_MODAL} from "../../actions/shared/ModalAction";
import EmbedModal from "./EmbedModal";
import {IParticipant} from "./DialogContentBlock";
import {MediaQuerySerice} from "../../services/MediaQueryService";
import {InlineBlockAction, OPEN_INLINE_BLOCK} from "../../actions/editor/InlineBlockAction";
import {BlockHandlerInline} from "./BlockHandlerInline";
import EmbedInline from "./EmbedInline";

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
        this.state = Object.assign({}, this.getButtonProps(), {isDesktop: MediaQuerySerice.getIsDesktop()});
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
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
                        if (this.state.isDesktop) {
                            InlineBlockAction.do(
                                OPEN_INLINE_BLOCK,
                                {
                                    position: this.props.blockPosition,
                                    content: <BlockHandlerInline articleId={this.props.articleId}
                                                              blockPosition={this.props.blockPosition}/>}
                            )
                        } else {
                            BlockHandlerAction.do(
                                OPEN_BLOCK_HANDLER_MODAL,
                                {articleId: this.props.articleId, blockPosition: this.props.blockPosition}
                            )
                        }
                    }
                };
            case BlockContentTypes.SWAP_BLOCKS:
                return {
                    icon: <SwapIcon/>,
                    onClick: () => {
                        ContentAction.do(
                            SWAP_CONTENT_BLCK,
                            {position: this.props.blockPosition}
                        );
                    }
                };
            case BlockContentTypes.TEXT:
                return {
                    icon: <TextIcon/>,
                    onClick: () => {
                        let data= {
                            contentBlock: {
                                type: BlockContentTypes.TEXT,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT_BLCK, data);
                    }
                };
            case BlockContentTypes.HEADER:
                return {
                    icon: <HeaderIcon/>,
                    onClick: () => {
                        let data= {
                            contentBlock: {
                                type: BlockContentTypes.HEADER,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT_BLCK, data);

                    }
                };
            case BlockContentTypes.LEAD:
                return {
                    icon: <LeadIcon/>,
                    onClick: () => {
                        let data= {
                            contentBlock: {
                                type: BlockContentTypes.LEAD,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT_BLCK, data);
                    }
                };
            case BlockContentTypes.VIDEO:
                return {
                    icon: <VideoIcon/>,
                    onClick: () => {
                        let content = {
                            type: BlockContentTypes.VIDEO,
                            value: "",
                        };
                        window.setTimeout(() => {
                            if (this.state.isDesktop) {
                                InlineBlockAction.do(
                                    OPEN_INLINE_BLOCK,
                                    {
                                        position: this.props.blockPosition,
                                        content: <EmbedInline blockPosition={this.props.blockPosition}
                                                              content={content}/>
                                    }
                                )

                            } else {
                                ModalAction.do(
                                    OPEN_MODAL,
                                    {content: <EmbedModal blockPosition={this.props.blockPosition}
                                                          content={content}/>}
                                );
                            }
                        }, 0);
                    }
                };
            case BlockContentTypes.PHOTO:
                return {
                    icon: <PhotoIcon/>,
                    onClick: () => {
                        let data: IContentData = {
                            type: BlockContentTypes.PHOTO,
                            photos: []
                        };
                        ContentAction.do(CREATE_CONTENT_BLCK, {contentBlock: data, position: this.props.blockPosition});
                    }
                };
            case BlockContentTypes.AUDIO:
                return {
                    icon: <AudioIcon/>,
                    onClick: () => {
                        let content = {
                            type: BlockContentTypes.AUDIO,
                            value: "",
                        };
                        window.setTimeout(() => {
                            if (this.state.isDesktop) {
                                InlineBlockAction.do(
                                    OPEN_INLINE_BLOCK,
                                    {
                                        position: this.props.blockPosition,
                                        content: <EmbedInline blockPosition={this.props.blockPosition}
                                                              content={content}/>
                                    }
                                )

                            } else {
                                ModalAction.do(
                                    OPEN_MODAL,
                                    {content: <EmbedModal blockPosition={this.props.blockPosition}
                                                          content={content}/>}
                                );
                            }
                        }, 0);
                    }
                };
            case BlockContentTypes.QUOTE:
                return {
                    icon: <QuoteIcon/>,
                    onClick: () => {
                        let data: {contentBlock: IContentData, position: number} = {
                            contentBlock: {
                                type: BlockContentTypes.QUOTE,
                                image: null,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT_BLCK, data);
                    }
                };
            case BlockContentTypes.COLUMNS:
                return {
                    icon: <ColumnsIcon/>,
                    onClick: () => {
                        let data: {contentBlock: IContentData, position: number} = {
                            contentBlock: {
                                type: BlockContentTypes.COLUMNS,
                                image: null,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT_BLCK, data);
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
                        ContentAction.do(CREATE_CONTENT_BLCK, data);
                    }
                };
            case BlockContentTypes.LIST:
                return {
                    icon: <ListIcon/>,
                    onClick: () => {
                        let data= {
                            contentBlock: {
                                type: BlockContentTypes.LIST,
                                subtype: ListBlockContentTypes.UNORDERED,
                                value: ''
                            },
                            position: this.props.blockPosition

                        };
                        ContentAction.do(CREATE_CONTENT_BLCK, data);
                    }
                };
            case BlockContentTypes.DIALOG:
                return {
                    icon: <DialogIcon/>,
                    onClick: () => {
                        let questioner: IParticipant = {
                            id: 1,
                            avatar: null,
                            name: 'Q',
                            is_interviewer: true
                        };
                        let answerer: IParticipant = {
                            id: 2,
                            avatar: null,
                            name: 'A'
                        };
                        let data: any = {
                            contentBlock: {
                                type: BlockContentTypes.DIALOG,
                                participants: [questioner, answerer],
                                remarks: [
                                    {participant_id: questioner.id, value: ""},
                                    {participant_id: answerer.id, value: ""}
                                ],
                            },
                            position: this.props.blockPosition
                        };
                        ContentAction.do(CREATE_CONTENT_BLCK, data);
                    }
                };
            case BlockContentTypes.POST:
                return {
                    icon: <PostIcon/>,
                    onClick: () => {
                        let content = {
                            type: BlockContentTypes.POST,
                            value: "",
                        };
                        window.setTimeout(() => {
                            if (this.state.isDesktop) {
                                InlineBlockAction.do(
                                    OPEN_INLINE_BLOCK,
                                    {
                                        position: this.props.blockPosition,
                                        content: <EmbedInline blockPosition={this.props.blockPosition}
                                                              content={content}/>
                                    }
                                )

                            } else {
                                ModalAction.do(
                                    OPEN_MODAL,
                                    {content: <EmbedModal blockPosition={this.props.blockPosition}
                                                          content={content}/>}
                                );
                            }
                        }, 0);
                    }
                };
        }
    }

    handleClick() {
        this.state.onClick();
        if (this.props.onClick) this.props.onClick();
    }

    handleMediaQuery(isDesktop: boolean) {
        if (this.state.isDesktop != isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.handleMediaQuery);
    }

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.handleMediaQuery);
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
