import * as React from 'react';
import {Captions} from '../../constants';
import '../../styles/editor/editor_publish_modal.scss';
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import {api} from "../../api";
import Switch from "../shared/Switch";

const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');

interface IProps {
    article: any
    updateMode?: boolean
    onPublish?: (article: any) => any
}

interface IState {
    article?: any
    adsEnabled?: boolean
    linkEnabled?: boolean
}

export default class PublishingParamsModal extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            article: this.props.article,
        }
    }

    static defaultProps = {
        updateMode: false
    };

    back() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    update() {
        return new Promise((resolve, reject) => {
            api.patch(`/articles/editor/${this.props.article.id}/`, this.state.article).then((response: any) => {
                resolve(response.data);
            });
        });
    }

    private _publish() {
        api.post(`/articles/editor/${this.props.article.id}/publish/`).then((response: any) => {
            console.log(response);
            this.back();
            alert('Поздравляем, статья опубликована');
            this.props.onPublish && this.props.onPublish(response.data);
        });
    }

    publish() {
        if (this.state.article != this.props.article) {
            this.update().then(() => {
                this._publish();
            })
        } else {
            this._publish();
        }
    }

    handleAdsEnabledChange(isActive: boolean) {
        this.setState({article: Object.assign({}, this.state.article, {ads_enabled: isActive})}, () => {

        });
    }

    handleLinkEnabledChange(isActive: boolean) {
        this.setState({article: Object.assign({}, this.state.article, {link_access: isActive})}, () => {

        });
    }

    render() {
        return (
            <div className="editor_modal">
                <div className="editor_modal__header">
                    <BackButton className="editor_modal__back" onClick={this.back.bind(this)}/>
                    {Captions.editor.publishingParams}
                </div>
                <div className="editor_modal__content">
                    <div onClick={this.handleAdsEnabledChange.bind(this, !this.state.article.ads_enabled)}
                         className={"editor_modal__param" + (this.state.article.ads_enabled ? ' active' : '')}>
                        {Captions.editor.publishAds}
                        <Switch isActive={this.state.article.ads_enabled} onChange={this.handleAdsEnabledChange.bind(this)}/>
                    </div>
                    <div onClick={this.handleLinkEnabledChange.bind(this, !this.state.article.link_access)}
                         className={"editor_modal__param" + (this.state.article.link_access ? ' active' : '')}>
                        {Captions.editor.publishLink}
                        <Switch isActive={this.state.article.link_access} onChange={this.handleLinkEnabledChange.bind(this)}/>
                    </div>
                </div>
                <div className="editor_modal__publish" onClick={this.publish.bind(this)}>{Captions.editor.publish}</div>
            </div>
        )
    }
}