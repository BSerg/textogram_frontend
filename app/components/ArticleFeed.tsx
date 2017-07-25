import * as React from "react";
import {Link} from "react-router-dom";
import {IContentData} from "../actions/editor/ContentAction";
import {api} from "../api";
import Error, {Error404, Error500, Error403} from "./Error";
import { UserAction, LOGIN, LOGOUT, UPDATE_USER, SAVE_USER, USER_REJECT, GET_ME } from "../actions/user/UserAction";
import {ModalAction, OPEN_MODAL, CLOSE_MODAL} from "../actions/shared/ModalAction";
import * as moment from "moment";
import SocialIcon from "./shared/SocialIcon";
import {MediaQuerySerice} from "../services/MediaQueryService";
import {PopupPanelAction, OPEN_POPUP, CLOSE_POPUP} from "../actions/shared/PopupPanelAction";
import * as Swapeable from "react-swipeable";
import PopupPrompt from "./shared/PopupPrompt";
import {NotificationAction, SHOW_NOTIFICATION} from "../actions/shared/NotificationAction";
import Loading from "./shared/Loading";
import LoginBlock from "./shared/LoginBlock";
import "../styles/article.scss";
import "../styles/banners.scss";
import {BannerID, Captions, BlockContentTypes} from "../constants";
import LeftSideButton from "./shared/LeftSideButton";
import AwesomeGallery from "./shared/AwesomeGallery";
import * as marked from 'marked';
import {Helmet} from 'react-helmet';
import Article from './Article';


export default class ArticleFeed extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        let props = this.props;
        return (
            <div className="article_feed">
                <Article {...props}/>
            </div>
        )
    }
}