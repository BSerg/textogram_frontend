import * as React from "react";
import {
    ContentBlockAction,
    ACTIVATE_CONTENT_BLOCK,
    DEACTIVATE_CONTENT_BLOCK
} from "../../actions/editor/ContentBlockAction";
import {
    ContentAction, DELETE_CONTENT_BLCK, MOVE_UP_CONTENT_BLCK,
    MOVE_DOWN_CONTENT_BLCK, SOFT_DELETE_CONTENT_BLCK
} from "../../actions/editor/ContentAction";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../../actions/shared/PopupPanelAction";
import ContentBlockPopup from "./ContentBlockPopup";
import "../../styles/editor/base_content_block.scss";
import {
    BlockHandlerAction,
    ACTIVATE_BLOCK_HANDLER,
    DEACTIVATE_BLOCK_HANDLER
} from "../../actions/editor/BlockHandlerAction";
import {MediaQuerySerice} from "../../services/MediaQueryService";
import {DesktopBlockToolsAction, UPDATE_TOOLS} from "../../actions/editor/DesktopBlockToolsAction";
import PopupPrompt from "../shared/PopupPrompt";
import {ContentEditableAction, RESET_FORMAT_TOOL} from "../../actions/shared/ContentEditableAction";

const DeleteButton = require('babel!svg-react!../../assets/images/editor_delete.svg?name=DeleteButton');
const UpIcon = require('babel!svg-react!../../assets/images/editor_up.svg?name=UpIcon');
const DownIcon = require('babel!svg-react!../../assets/images/editor_down.svg?name=DownIcon');
const BoldIcon = require('babel!svg-react!../../assets/images/desktop_editor_icon_bold.svg?name=BoldIcon');
const ItalicIcon = require('babel!svg-react!../../assets/images/desktop_editor_icon_italic.svg?name=ItalicIcon');
const URLIcon = require('babel!svg-react!../../assets/images/desktop_editor_icon_link.svg?name=URLIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close_small.svg?name=CloseIcon');


interface IBaseContnentBlockProps {
    className?: string
    id: number|string
    onActive?: () => any
    onBlur?: () => any
    onClick?: () => any
    popupContent?: JSX.Element
    disableDefaultPopup?: boolean
}

interface IBaseContnentBlockState {
    isActive?: boolean
    expandTop?: boolean
    expandBottom?: boolean
    isDesktop?: boolean
    desktopTools?: any | null;
    desktopFullTools?: any | null;
}


export default class BaseContentBlock extends React.Component<IBaseContnentBlockProps, IBaseContnentBlockState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isActive: false,
            expandTop: false,
            expandBottom: false,
            isDesktop: MediaQuerySerice.getIsDesktop(),
            desktopTools: null,
            desktopFullTools: null
        };
        this.handleActivate = this.handleActivate.bind(this);
        this.handleBlockHandlerActivate = this.handleBlockHandlerActivate.bind(this);
        this.handleMediaQuery = this.handleMediaQuery.bind(this);
        this.handleUpdateTools = this.handleUpdateTools.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleFormatTool = this.handleFormatTool.bind(this);
    }

    static defaultProps = {
        disablePopup: false,
    };

    handleActivate() {
        let store: any = ContentBlockAction.getStore();
        if ((store.id == this.props.id) !== this.state.isActive) {
            console.log('ACTIVE', store.id, this.props.id, this.state.isActive)
            this.setState({isActive: store.id == this.props.id}, () => {
                if (this.state.isActive && this.props.onActive) {
                    this.props.onActive();
                } else if (!this.state.isActive && this.props.onBlur) {
                    this.props.onBlur();
                }
                if (this.state.isActive && !this.props.disableDefaultPopup) {
                    if (!this.state.isDesktop) {
                        let popupContent = <ContentBlockPopup onMoveUp={this.handleMoveUp.bind(this)}
                                                              onMoveDown={this.handleMoveDown.bind(this)}
                                                              onDelete={this.handleDeleteWithConfirm.bind(this)}/>;
                        PopupPanelAction.do(
                            OPEN_POPUP,
                            {
                                content: this.props.popupContent || popupContent
                            }
                        );
                    }
                }
            });
        }
    }

    getPosition() {
        let blocks = ContentAction.getStore().content.blocks;
        let position = -1;
        blocks.forEach((block: any, index: number) => {
            if (block.id == this.props.id) {
                position = index;
            }
        });
        return position;
    }

    handleBlockHandlerActivate() {
        let position = this.getPosition();
        if (position != -1) {
            let store = BlockHandlerAction.getStore();
            if (store.id == -1) {
                this.setState({expandTop: false, expandBottom: false});
            } else {
                if (this.state.expandTop != (store.id == position)) {
                    this.setState({expandTop: store.id == position})
                }
                if (this.state.expandBottom != ((store.id - 1) == position)) {
                    this.setState({expandBottom: (store.id - 1) == position})
                }
            }
        }
    }

    handleClick() {
        this.props.onClick && this.props.onClick();
    }

    handleDelete() {
        ContentAction.do(SOFT_DELETE_CONTENT_BLCK, {id: this.props.id});
        // ContentAction.do(DELETE_CONTENT_BLCK, {id: this.props.id});
        ContentBlockAction.do(DEACTIVATE_CONTENT_BLOCK, null);
        PopupPanelAction.do(CLOSE_POPUP, null);
    }

    handleDeleteWithConfirm() {
        if (this.state.isDesktop) {
            let result = confirm('Удалить?');
            if (result) {
                this.handleDelete();
            }
        } else {
            PopupPanelAction.do(
                OPEN_POPUP,
                {content: <PopupPrompt confirmLabel="Удалить"
                                       confirmClass="warning"
                                       onConfirm={this.handleDelete.bind(this)}/>}
            );
        }
    }

    handleMoveUp() {
        ContentAction.do(MOVE_UP_CONTENT_BLCK, {id: this.props.id});
    }

    handleMoveDown() {
        ContentAction.do(MOVE_DOWN_CONTENT_BLCK, {id: this.props.id});
    }

    handleMediaQuery(isDesktop: boolean) {
        if (this.state.isDesktop != isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    handleUpdateTools() {
        let store = DesktopBlockToolsAction.getStore();
        if (store.position == this.getPosition()) {
            this.setState({desktopTools: store.tools});
        }
    }

    handleKeyDown(e: KeyboardEvent) {}

    handleFormatTool() {
        let formatTool = ContentEditableAction.getStore().formatTool;
        if (this.state.isActive && formatTool) {
            this.setState({desktopFullTools: <FormatTool formatTool={formatTool}/>});
        }
        if (this.state.desktopFullTools != null && formatTool == null) {
            this.setState({desktopFullTools: null});
        }
    }

    componentDidMount() {
        ContentBlockAction.onChange([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleActivate);
        MediaQuerySerice.listen(this.handleMediaQuery);
        DesktopBlockToolsAction.onChange(UPDATE_TOOLS, this.handleUpdateTools);
        ContentEditableAction.onChange(RESET_FORMAT_TOOL, this.handleFormatTool);
        window.addEventListener('keydown', this.handleKeyDown);
        this.handleActivate();
    }

    componentWillUnmount() {
        ContentBlockAction.unbind([ACTIVATE_CONTENT_BLOCK, DEACTIVATE_CONTENT_BLOCK], this.handleActivate);
        MediaQuerySerice.unbind(this.handleMediaQuery);
        DesktopBlockToolsAction.unbind(UPDATE_TOOLS, this.handleUpdateTools);
        ContentEditableAction.unbind(RESET_FORMAT_TOOL, this.handleFormatTool);
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    render() {
        let className = 'base_content_block';
        if (this.state.isActive) className += ' active';
        if (this.props.className) className += ' ' + this.props.className;
        if (this.state.expandTop) className += ' expand_top';
        if (this.state.expandBottom) className += ' expand_bottom';
        return (
            <div id={this.props.id.toString()} className={className} onClick={this.handleClick.bind(this)}>
                <div className="base_content_block__content">
                    {this.props.children}
                </div>
                {this.state.isDesktop && this.state.isActive ?
                    <div className="base_content_block__tools">
                        <div className="base_content_block__tools_wrapper">
                            {this.state.desktopFullTools ?
                                this.state.desktopFullTools :
                                [
                                    <div key="tool_up" className="base_content_block__tools_button"
                                         placeholder="Вверх" onClick={this.handleMoveUp.bind(this)}>
                                        <UpIcon/>
                                    </div>,
                                    this.state.desktopTools,
                                    <div key="tool_del" className="base_content_block__tools_button"
                                         onClick={this.handleDelete.bind(this)}
                                         placeholder="Удалить">
                                        <DeleteButton/>
                                    </div>,
                                    <div key="tool_down" className="base_content_block__tools_button"
                                         placeholder="Вниз" onClick={this.handleMoveDown.bind(this)}>
                                        <DownIcon/>
                                    </div>
                                ]
                            }

                        </div>
                    </div> : null
                }
            </div>
        )
    }
}

class FormatTool extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            showURLInput: false
        };
    }

    refs: {
        urlInput: HTMLInputElement
    };

    onBold(e: any) {
        e.preventDefault();
        e.stopPropagation();
        this.props.formatTool.onBold();
    }

    onItalic(e: any) {
        e.preventDefault();
        e.stopPropagation();
        this.props.formatTool.onItalic();
    }

    onURL(e: any) {
        if (this.props.formatTool.isURL) {
            this.props.formatTool.onRemoveURL();
        } else {
            this.setState({showURLInput: true});
        }
    }

    updateURL(e: any) {
        e.preventDefault();
        if (this.refs.urlInput.value) {
            this.props.formatTool.onURL(this.refs.urlInput.value);
        }
        this.closeURLInput();
    }

    closeURLInput() {
        this.setState({showURLInput: false});
    }

    render() {
        return (
            <div>
                {!this.props.formatTool.disableBold ?
                    <div className={"base_content_block__tools_button" + (this.props.formatTool.isBold ? ' active' : '')}
                         onMouseDown={this.onBold.bind(this)}><BoldIcon/></div> : null
                }
                {!this.props.formatTool.disableItalic ?
                    <div className={"base_content_block__tools_button" + (this.props.formatTool.isItalic ? ' active' : '')}
                         onMouseDown={this.onItalic.bind(this)}><ItalicIcon/></div> : null
                }
                {!this.props.formatTool.disableURL ?
                    <div className={"base_content_block__tools_button base_content_block__url_button" + (this.props.formatTool.isURL ? ' active' : '')}
                         onMouseDown={this.onURL.bind(this)}>
                        <URLIcon/>
                        {this.state.showURLInput ?
                            <div className="base_content_block__url_input">
                                <form onSubmit={this.updateURL.bind(this)}>
                                    <input ref="urlInput" type="text" placeholder="Вставьте ссылку"/>
                                </form>
                                <div className="base_content_block__url_input_close" onClick={this.closeURLInput.bind(this)}><CloseIcon/></div>
                            </div> : null}
                    </div> : null
                }
            </div>
        )
    }
}