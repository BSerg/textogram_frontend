import * as React from 'react';
import {Captions} from '../../constants';
import '../../styles/editor/editor_publish_modal.scss';
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import {api} from "../../api";
import Switch from "../shared/Switch";

const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');

interface IProps {
    articleId: number
    updateMode?: boolean
}

interface IState {
    adsEnabled?: boolean
    linkEnabled?: boolean
}

export default class PublishingParamsModal extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            adsEnabled: true,
            linkEnabled: false
        }
    }

    static defaultProps = {
        updateMode: false
    };

    back() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    publish() {
        api.post(`/articles/editor/${this.props.articleId}/publish/`).then((response: any) => {
            console.log(response);
            alert('Поздравляем, статья опубликована');
        });
    }

    handleAdsEnabledChange(isActive: boolean) {
        this.setState({adsEnabled: isActive});
    }

    handleLinkEnabledChange(isActive: boolean) {
        this.setState({linkEnabled: isActive});
    }

    render() {
        return (
            <div className="editor_modal">
                <div className="editor_modal__header">
                    <BackButton className="editor_modal__back" onClick={this.back.bind(this)}/>
                    {Captions.editor.publishingParams}
                </div>
                <div className="editor_modal__content">
                    <div onClick={this.handleAdsEnabledChange.bind(this, !this.state.adsEnabled)} className={"editor_modal__param" + (this.state.adsEnabled ? ' active' : '')}>
                        {Captions.editor.publishAds}
                        <Switch isActive={this.state.adsEnabled} onChange={this.handleAdsEnabledChange.bind(this)}/>
                    </div>
                    <div onClick={this.handleLinkEnabledChange.bind(this, !this.state.linkEnabled)} className={"editor_modal__param" + (this.state.linkEnabled ? ' active' : '')}>
                        {Captions.editor.publishLink}
                        <Switch isActive={this.state.linkEnabled} onChange={this.handleLinkEnabledChange.bind(this)}/>
                    </div>
                </div>
                <div className="editor_modal__publish" onClick={this.publish.bind(this)}>{Captions.editor.publish}</div>
            </div>
        )
    }
}