import * as React from "react";
import {Captions, ArticleStatuses} from "../../constants";
import {ModalAction, CLOSE_MODAL} from "../../actions/shared/ModalAction";
import Switch from "../shared/Switch";
import "../../styles/editor/publishing_params_modal.scss";

const BackButton = require('babel!svg-react!../../assets/images/back.svg?name=BackButton');
const CloseButton = require('babel!svg-react!../../assets/images/close_small.svg?name=CloseButton');

interface IProps {
    article: any;
    onPublish: (article: any) => any;
    onCancel?: () => any;
}

interface IState {
    article?: any;
    adsEnabledCached?: boolean;
    blockPublish?: boolean
}

export default class ArticlePublishingParamsModal extends React.Component<IProps, IState> {
    refs: {
        paywallPriceInput: HTMLInputElement
    };

    constructor(props: any) {
        super(props);
        this.state = {
            article: this.props.article,
            adsEnabledCached: this.props.article.ads_enabled,
            blockPublish: false
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    back() {
        ModalAction.do(CLOSE_MODAL, null);
    }

    publish() {
        this.setState({blockPublish: true}, () => {
            this.props.onPublish(this.state.article);
        });
    }

    handleAdsEnabledChange(isActive: boolean) {
        if (this.state.article.paywall_enabled) return;
        this.state.article.ads_enabled = isActive;
        this.setState({
            article: this.state.article,
            adsEnabledCached: isActive
        });
    }

    handlePaywallEnabledChange(isActive: boolean) {
        this.state.article.paywall_enabled = isActive;
        if (isActive) {
            this.state.article.ads_enabled = false;
            window.setTimeout(() => {
                this.refs.paywallPriceInput && this.refs.paywallPriceInput.select();
            });
        } else {
            this.state.article.ads_enabled = this.state.adsEnabledCached;
        }
        this.setState({article: this.state.article});
    }

    handlePaywallPrice() {
        if (this.refs.paywallPriceInput.value) {
            this.state.article.paywall_price = parseInt(this.refs.paywallPriceInput.value);
            this.state.article.paywall_price = Math.min(this.state.article.paywall_price, 100000);
        } else {
            this.state.article.paywall_price = 0;
        }
        this.setState({article: this.state.article});
    }

    calcPaywallPrice(price: number) {
        try {
            return Math.floor(price * 1.1);
        } catch(err) {
            return 0;
        }
    }

    handleKeyDown(e: KeyboardEvent) {
        if (e.keyCode == 13) {
            this.publish();
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    render() {
        let adsHandlerClassName = "publishing_modal__param";
        if (this.state.article.ads_enabled) adsHandlerClassName += ' active';
        if (this.state.article.paywall_enabled) adsHandlerClassName += ' disabled';
        return (
            <div className="publishing_modal">
                <div className="publishing_modal__header">
                    <div className="publishing_modal__back" onClick={this.back.bind(this)}><BackButton/></div>
                    {Captions.editor.publishingParams}
                </div>
                <div className="publishing_modal__content">
                    <div onClick={this.handleAdsEnabledChange.bind(this, !this.state.article.ads_enabled)}
                         className={adsHandlerClassName}>
                        {Captions.editor.publishAds}
                        <Switch isActive={this.state.article.ads_enabled}
                                disabled={this.state.article.paywall_enabled}
                                onChange={this.handleAdsEnabledChange.bind(this)}/>
                    </div>

                    {process.env.PAYWALL_ENABLE ?
                        [
                            <div key="paywallSwitch" onClick={this.handlePaywallEnabledChange.bind(this, !this.state.article.paywall_enabled)}
                                 className={"publishing_modal__param" + (this.state.article.paywall_enabled ? ' active' : '')}>
                                {Captions.editor.publishPaywall}
                                <Switch isActive={this.state.article.paywall_enabled}
                                        onChange={this.handlePaywallEnabledChange.bind(this)}/>
                            </div>,
                            this.state.article.paywall_enabled ?
                                <div key="paywallPrice" className="publishing_modal__paywall_price">
                                    <div className="publishing_modal__paywall_value">
                                        {Captions.editor.paywall_price}
                                        <input ref="paywallPriceInput"
                                               type="number"
                                               placeholder={Captions.editor.enter_paywall_price}
                                               value={this.state.article.paywall_price}
                                               onChange={this.handlePaywallPrice.bind(this)}
                                               min="0" max="100000" step="1"/>
                                        {(Captions as any).shared.currency[this.state.article.paywall_currency]}
                                    </div>
                                    <div className="publishing_modal__paywall_help">
                                        {Captions.editor.paywall_price_tax_help} {this.calcPaywallPrice(this.state.article.paywall_price)}{(Captions as any).shared.currency[this.state.article.paywall_currency]}
                                    </div>
                                </div> : null
                            ] : null
                    }

                </div>
                <div className={"publishing_modal__publish" + (this.state.blockPublish ? ' disabled' : '')}
                     onClick={this.publish.bind(this)}>
                    {this.state.article.status == ArticleStatuses.DRAFT ? Captions.editor.publish : Captions.editor.publishUpdate}
                </div>
                <div className="publishing_modal__close" onClick={this.back.bind(this)}><CloseButton/></div>

            </div>
        )
    }
}