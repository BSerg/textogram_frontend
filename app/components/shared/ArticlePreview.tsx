import * as React from 'react';
import {withRouter, Link} from 'react-router';

import * as moment from 'moment';

import {Captions} from '../../constants';
import '../../styles/shared/article_preview.scss';
const ViewsIcon = require('babel!svg-react!../../assets/images/views_icon.svg?name=ViewsIcon');
const LockIcon = require('babel!svg-react!../../assets/images/lock.svg?name=LockIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');
const EditIcon = require('babel!svg-react!../../assets/images/edit.svg?name=EditIcon');
const MoreIcon = require('babel!svg-react!../../assets/images/more_vertical.svg?name=MoreIcon');

import {MediaQuerySerice} from '../../services/MediaQueryService';


interface IArticlePreviewPropsInterface {
    item: any;
    index?: number;
    onClickDelete?: (id: number, index?: number) => {};
    onClick?: (id: number|null) => {};
    isFeed?: boolean;
    isOwner?: boolean;
}

interface IArticlePreviewStateInterface {
    menuOpen?: boolean;
    deleted?: boolean;
    isDesktop?: boolean;
    isNew?: boolean;
    timeout?: number;
}



class ArticlePreviewClass extends React.Component<IArticlePreviewPropsInterface, IArticlePreviewStateInterface> {

    constructor() {
        super();
        this.state = {menuOpen: true, isDesktop: MediaQuerySerice.getIsDesktop(), isNew: false};
        this.checkDesktop = this.checkDesktop.bind(this);
        this.setNotNew = this.setNotNew.bind(this);
    }

    toggleMenu(open: boolean) {
        // this.setState({menuOpen: open});
    }

    checkDesktop(isDesktop: boolean) {
        if (isDesktop != this.state.isDesktop) {
            this.setState({isDesktop: isDesktop});
        }
    }

    getDateString(dt: string): string {
        if (!dt) return '';
        let dateString = moment(dt).format('DD.MM.YYYY  HH:mm');
        return dateString;
    }

    getViewsString(views: number): string {
        if (views < 1000) return views.toString();
        else if (views >= 1000 && views < 100000) {
            return (Math.floor(views * 10 / 1000) / 10).toString() + 'K';
        }
        else if (views >= 100000 && views < 1000000) {
            return (Math.floor(views/1000)).toString() + 'K';
        }
        else if (views >= 1000000 && views < 100000000) {
            return (Math.floor(views * 10/1000000)/10).toString() + 'M';
        }
        else if (views >= 100000000) {
            return (Math.floor(views/1000000)).toString() + 'M';
        }
        return '';
    }

    deleteArticle() {

        if (this.props.onClickDelete) {

            if (confirm()) {
                this.props.onClickDelete(this.props.item.id, this.props.index);
            }
        }
    }

    setNotNew() {
        this.setState({isNew: false})
    }

    componentDidMount() {
        MediaQuerySerice.listen(this.checkDesktop);
        this.setState({isNew: Boolean(this.props.item.isNew)});
        this.state.timeout = window.setTimeout(this.setNotNew, 0);
    }

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.checkDesktop);
        window.clearTimeout(this.state.timeout);
    }

    render() {

        let date = this.getDateString(this.props.item.is_draft ? this.props.item.last_modified : this.props.item.published_at);
        // let views = this.getViewsString(this.props.item.views || 0);

        // console.log(this.props.item.id);
        console.log(this.props.item.cover);
        // let coverStyle = { background: `url('${this.props.item.cover}') no-repeat center center` };
        let coverStyle = { backgroundImage: `url('${this.props.item.cover}')`};

        if (this.state.isDesktop) {
            return (
                <div className={"article_preview" + (this.state.isNew ? " new" : "")} onMouseLeave={this.toggleMenu.bind(this, false)}>

                </div>);
        }


        else {
            return (
                <div className={"article_preview" + (this.state.isNew ? " new" : "")}>

                    <div className="article_preview__mobile_head">
                        {
                            !this.props.item.is_draft ? (
                                <div className="article_preview__avatar">
                                    <Link to={"/profile/" + this.props.item.owner.id} >
                                        <div className="title__avatar"><img src={this.props.item.owner.avatar}/></div>
                                    </Link>
                                </div>
                            ) : null
                        }



                    </div>

                    <div className="article_preview__title">
                        <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                            ("/articles/" + this.props.item.slug + "/")}><div>{ this.props.item.title || date }</div>
                        </Link>
                    </div>

                    {
                        this.props.item.cover ? (<div className="article_preview__cover"  style={coverStyle}></div>) : null
                    }

                </div>);
        }
    }
}

let ArticlePreview = withRouter(ArticlePreviewClass);

export default ArticlePreview;