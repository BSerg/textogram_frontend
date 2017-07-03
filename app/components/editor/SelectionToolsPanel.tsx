import * as React from 'react';
import '../../styles/editor/selection_tools.scss';


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
    onURL?: (url: string) => any
    onClose?: () => any
}

interface IState {
    isBold?: boolean
    isItalic?: boolean
    isURL?: boolean
    editURL?: boolean
}

export default class SelectionToolsPanel extends React.Component<IProps, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            isBold: this.props.isBold,
            isItalic: this.props.isItalic,
            isURL: this.props.isURL,
            editURL: false
        }
    }

    refs: {
        urlInput: HTMLInputElement
    };

    onBold(e: Event) {
        e.stopPropagation();
        e.preventDefault();
        this.setState({isBold: !this.state.isBold}, () => {
            this.props.onBold && this.props.onBold();
        });
    }

    onItalic(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({isItalic: !this.state.isItalic}, () => {
            this.props.onItalic && this.props.onItalic();
        });
    }

    editURL(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({editURL: true}, () => {
            this.refs.urlInput.focus();
        });
    }

    closeEditURL(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({editURL: false});
    }

    onURL(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({isURL: !this.state.isURL}, () => {
            this.props.onURL && this.props.onURL(this.state.editURL ? this.refs.urlInput.value.trim() : '');
            if (this.state.editURL) {
                this.setState({editURL: false});
            }
        });
    }

    render() {
        return (
            <div className="selection_tools">
                {!this.state.editURL ?
                    [
                        <div key="bold"
                             className={"selection_tools__btn" + (this.state.isBold ? ' active' : '')}
                             onClick={this.onBold.bind(this)}>
                            <BoldIcon/>
                        </div>,
                        <div key="italic"
                             className={"selection_tools__btn" + (this.state.isItalic ? ' active' : '')}
                             onClick={this.onItalic.bind(this)}>
                            <ItalicIcon/>
                        </div>,
                        <div key="url"
                             className={"selection_tools__btn" + (this.state.isURL ? ' active' : '')}
                             onClick={this.state.isURL ? this.onURL.bind(this) : this.editURL.bind(this)}>
                            {this.state.isURL ? <UnLinkIcon/> : <LinkIcon/>}
                        </div>,
                    ] :
                    <div className="selection_tools__url">
                        <form onSubmit={this.onURL.bind(this, )}>
                            <input ref="urlInput" type="text" placeholder="Вставьте ссылку"/>
                        </form>
                        <div className="selection_tools__url_close" onClick={this.closeEditURL.bind(this)}><CloseIcon/></div>
                    </div>
                }
            </div>
        )
    }
}