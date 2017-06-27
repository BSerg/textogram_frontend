import * as React from 'react';
import '../../styles/editor/text_format_popup.scss';
import {PopupPanelAction, BACK_POPUP, CLOSE_POPUP} from "../../actions/shared/PopupPanelAction";

const BoldIcon = require('-!babel-loader!svg-react-loader!../../assets/images/select_bold.svg?name=BoldIcon');
const ItalicIcon = require('-!babel-loader!svg-react-loader!../../assets/images/select_italic.svg?name=ItalicIcon');
const LinkIcon = require('-!babel-loader!svg-react-loader!../../assets/images/select_link.svg?name=LinkIcon');
const UnLinkIcon = require('-!babel-loader!svg-react-loader!../../assets/images/select_unlink.svg?name=UnLinkIcon');
const CloseIcon = require('-!babel-loader!svg-react-loader!../../assets/images/close.svg?name=CloseIcon');


interface IProps {
    isBold?: boolean
    isItalic?: boolean
    isURL?: boolean
    onBold?: () => any
    onItalic?: () => any
    onURL?: () => any
    disableBold?: boolean
    disableItalic?: boolean
    disableURL?: boolean
    onClose?: () => any
}

export default class TextFormatPopup extends React.Component<IProps, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            isBold: this.props.isBold,
            isItalic: this.props.isItalic,
            isURL: this.props.isURL,
        }
    }

    static defaultProps = {
        isBold: false,
        isItalics: false,
        isURL: false,
        disableBold: false,
        disableItalic: false,
        disableURL: false
    };

    onBold(e: Event) {
        this.setState({isBold: !this.state.isBold}, () => {
            this.props.onBold && this.props.onBold();
        });
    }

    onItalics() {
        this.setState({isItalic: !this.state.isItalic}, () => {
            this.props.onItalic && this.props.onItalic();
        });
    }

    onURL() {
        this.setState({isURL: !this.state.isURL}, () => {
            this.props.onURL && this.props.onURL();
        });
    }

    onClose() {
        this.props.onClose && this.props.onClose();
    }

    render() {
        return (
            <div className="text_format_popup">
                {!this.props.disableBold ?
                    <BoldIcon className={this.state.isBold ? 'active' : ''} onClick={this.onBold.bind(this)}/> : null
                }
                {!this.props.disableItalic ?
                    <ItalicIcon className={this.state.isItalic ? 'active' : ''} onClick={this.onItalics.bind(this)}/> : null
                }
                {!this.props.disableURL ?
                    this.state.isURL ?
                        <UnLinkIcon className="active" onClick={this.onURL.bind(this)}/> :
                        <LinkIcon onClick={this.onURL.bind(this)}/> : null
                }
                <CloseIcon className="close" onClick={this.onClose.bind(this)}/>
            </div>
        )
    }
}