import * as React from 'react';
import {Link} from 'react-router';
import {GET_ME, LOGIN, LOGOUT, UserAction} from '../actions/user/UserAction';
import {Error404} from './Error';
import {api} from '../api';
import { NotificationAction, SHOW_NOTIFICATION } from '../actions/shared/NotificationAction';
import '../styles/url_shortener.scss';


interface IShortenerState {
    shortenedUrl?: string;
    shortenedUrlInitial?: string;
    available?: boolean;
    urlError?: boolean;
    isNew?: boolean;
    appearTimeout?: number;
}

export default class UrlShortener extends React.Component<any, IShortenerState> {

    refs: {
        inputUrl: HTMLInputElement;
        inputShort: HTMLInputElement;
    };

    constructor() {
        super();
        this.state = { shortenedUrl: '', shortenedUrlInitial: '', available: false, urlError: false };
        this.setAvailability = this.setAvailability.bind(this);
    }

    setAvailability() {
        this.setState({available: Boolean(UserAction.getStore().user)});
    }

    shortenUrl() {

        let url = this.refs.inputUrl.value;

        if ((url == this.state.shortenedUrlInitial) && this.state.shortenedUrl) {
            return;
        }

        api.post('/url_short/', {url: url}).then((response: any) => {
            this.setState({
                shortenedUrl: response.data.shortened_url,
                shortenedUrlInitial: response.data.url,
                urlError: false,
            }, () => {
                this.refs.inputShort.select();
            });
        }).catch((error) => {
            this.setState({urlError: true});
        })
    }

    formSubmit(e: any) {
        e.preventDefault();
        this.shortenUrl();
    }

    copyToClipboard() {
        this.refs.inputShort.select();
        try {
            document.execCommand('copy');
            this.refs.inputShort.blur();
            NotificationAction.do(SHOW_NOTIFICATION, {content: 'Ссылка скопирована в буфер обмена'});
        }
        catch (error) {
            NotificationAction.do(SHOW_NOTIFICATION, {content: 'Невозможно скопировать ссылку в буфер обмена'});
        }
    }

    componentDidMount() {
        this.setAvailability();
        UserAction.onChange([GET_ME, LOGIN, LOGOUT], this.setAvailability);
    }

    componentWillUnmount() {
        UserAction.unbind([GET_ME, LOGIN, LOGOUT], this.setAvailability);
        if (this.state.appearTimeout) {
            window.clearTimeout(this.state.appearTimeout);
        }
    }

    render() {
        if (!this.state.available) {
            return (<Error404/>);
        }
        return (
            <div className="url_shortener">
                <h1>Сокращалка</h1>
                <form method="post" onSubmit={this.formSubmit.bind(this)}>
                    <input type="text" ref="inputUrl" name="url"
                           placeholder="Вставьте ссылку"
                           className={this.state.urlError ? "error": ""}/>
                </form>

                <div className={"shortened" + (this.state.isNew ? " new" : "")}>
                    {
                        this.state.shortenedUrl ? (
                            [
                                <h2 key="header">ВАША КОРОТКАЯ ССЫЛКА</h2>,
                                <div key={'url'} className="shortened_url">
                                    <input type="text" ref="inputShort" value={this.state.shortenedUrl} readOnly={true} />
                                    <button onClick={ this.copyToClipboard.bind(this) }>Скопировать</button>
                                </div>,
                                <div key={'hint'} className="shortened_hint">
                                    Для ссылки <Link to={this.state.shortenedUrlInitial} target="_blank">{this.state.shortenedUrlInitial}</Link>
                                </div>]
                        ) : null
                    }
                </div>


            </div>)
    }
}