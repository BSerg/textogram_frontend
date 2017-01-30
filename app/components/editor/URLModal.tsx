import * as React from "react";
import {Captions} from "../../constants";
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import "../../styles/editor/url_modal.scss";

const ConfirmButton = require('babel!svg-react!../../assets/images/redactor_icon_confirm.svg?name=ConfirmButton');
const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');


export default class URLModal extends React.Component<{onURL?: (url: string) => any}, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            url: '',
            isError: false
        }
    }

    refs: {
        urlInput: HTMLInputElement
    };

    back() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    handleChangeUrl() {
        let url = this.refs.urlInput.value;
        this.setState({url: url, isError: !this.validate(url)});
    }

    handleURL(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        !this.state.isError && this.props.onURL && this.props.onURL(this.state.url);
    }

    validate(url: string): boolean {
        const regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regex.test(url);
    }

    componentDidMount() {
        this.refs.urlInput.focus();
    }

    render() {
        return (
            <div className='url_modal'>
                <div className="url_modal__header">
                    <BackButton className="url_modal__back" onClick={this.back.bind(this)}/>
                </div>
                <div className={"url_modal__content" + (this.state.isError ? ' error' : '')}>
                    <form onSubmit={this.handleURL.bind(this)}>
                        <input className="url_modal__input"
                               ref="urlInput"
                               type="text"
                               value={this.state.url}
                               placeholder={Captions.editor.enter_embed_url} onChange={this.handleChangeUrl.bind(this)}/>
                    </form>
                    {this.state.isError ?
                    <div className="url_modal__error">{Captions.editor.error_embed_url}</div>:
                    <div className="url_modal__help">URL</div>
                    }
                </div>
                <div className="url_modal__tools">
                    <ConfirmButton className={!this.state.url.length || this.state.isError ? "disabled" : ""}
                                   onClick={this.handleURL.bind(this)}/>
                </div>
            </div>
        )
    }
}