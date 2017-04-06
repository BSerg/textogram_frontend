import * as React from 'react';
import {withRouter, Link} from 'react-router';

import * as moment from 'moment';

import {Captions} from '../../constants';

import '../../styles/shared/article_preview.scss';
import '../../styles/shared/article_preview_control.scss';

const ViewsIcon = require('babel!svg-react!../../assets/images/views_icon.svg?name=ViewsIcon');
const LockIcon = require('babel!svg-react!../../assets/images/lock.svg?name=LockIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');
const EditIcon = require('babel!svg-react!../../assets/images/edit.svg?name=EditIcon');
const MoreIcon = require('babel!svg-react!../../assets/images/more_vertical.svg?name=MoreIcon');

import {MediaQuerySerice} from '../../services/MediaQueryService';

interface IControlProps {
    item: any,
}

class ControlMenu extends React.Component<IControlProps, any> {


    componentDidMount() {

    }

    render() {
        return (
            <div className="article_preview_control">
                <div className="control_button"><div></div><div></div><div></div></div>

                <div className="control_controls">
                    <div><Link to={ '/articles/' + this.props.item.id + '/edit/'} >Редактировать</Link></div>
                    <div>Удалить</div>
                </div>
            </div>)
    }
}


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
        // let coverStyle = { background: `url('${this.props.item.cover}') no-repeat center center` };
        let coverStyle = { backgroundImage: `url('${this.props.item.cover}')`};

        if (this.state.isDesktop) {
            return (
                <div className={"article_preview" + (this.state.isNew ? " new" : "")} onMouseLeave={this.toggleMenu.bind(this, false)}>
                    {
                        !this.props.isOwner ? (
                            <div className="article_preview__avatar" key="avatar">
                                <Link to={"/profile/" + this.props.item.owner.id} >
                                    <img src={this.props.item.owner.avatar}/>
                                </Link>
                             </div>
                        ) : null
                    }

                    <div className="article_preview__data">


                        <div className="article_preview__title">
                            <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                ("/articles/" + this.props.item.slug + "/")}>{ this.props.item.title || date }
                            </Link>
                        </div>
                        {
                            this.props.item.lead ? (
                                <div className="article_preview__lead">
                                    <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                        ("/articles/" + this.props.item.slug + "/")}>{ this.props.item.lead}
                                    </Link>
                                </div>
                            ) : null
                        }


                        <div className="article_preview__info">
                        {
                            !this.props.item.is_draft ?

                                 [
                                     !this.props.isOwner ?
                                         <div className="article_preview__text" key="name">
                                             <Link to={"/profile/" + this.props.item.owner.id} >
                                                {
                                                    this.props.item.owner.first_name + ' ' + this.props.item.owner.last_name
                                                }
                                            </Link>

                                        </div> : null,
                                     <div className="article_preview__text" key="date">

                                         <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                            ("/articles/" + this.props.item.slug + "/")}>
                                             {date}
                                        </Link>
                                     </div>
                                 ]

                            : null
                        }

                        </div>

                    </div>

                    {
                        this.props.item.cover ? (
                            <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                ("/articles/" + this.props.item.slug + "/")}>
                                <div className="article_preview__cover"  style={coverStyle}></div>
                            </Link>
                        ) : null
                    }

                    {
                        this.props.isOwner ? (<ControlMenu item={this.props.item} />) : null
                    }
                </div>);
        }

        else {
            return (
                <div className={"article_preview" + (this.state.isNew ? " new" : "")}>

                    <div className="article_preview__info">
                        {
                            !this.props.item.is_draft ?

                                 [
                                     <div className="article_preview__avatar" key="avatar">
                                        <Link to={"/profile/" + this.props.item.owner.id} >
                                            <img src={this.props.item.owner.avatar}/>
                                        </Link>
                                     </div>,

                                     <div className="article_preview__text" key="name">
                                         <Link to={"/profile/" + this.props.item.owner.id} >
                                            {
                                                this.props.item.owner.first_name + ' ' + this.props.item.owner.last_name
                                            }
                                        </Link>
                                     </div>,

                                     <div className="article_preview__text" key="date">

                                         <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                            ("/articles/" + this.props.item.slug + "/")}>
                                             {date}
                                        </Link>
                                     </div>,

                                     <div className="filler" key="filler"></div>,

                                     this.props.isOwner ? <ControlMenu item={this.props.item} key="control" /> : null

                                 ]

                            : null
                        }

                    </div>

                    <div className="article_preview__title">
                        <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                            ("/articles/" + this.props.item.slug + "/")}>{ this.props.item.title || date }
                        </Link>
                    </div>
                    {
                        this.props.item.lead ? (
                            <div className="article_preview__lead">
                                <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                    ("/articles/" + this.props.item.slug + "/")}><div>{ this.props.item.lead}</div>
                                </Link>
                            </div>
                        ) : null
                    }


                    {
                        this.props.item.cover ? (
                            <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                ("/articles/" + this.props.item.slug + "/")}>
                                <div className="article_preview__cover"  style={coverStyle}></div>
                            </Link>
                        ) : null
                    }

                </div>);
        }
    }
}

let ArticlePreview = withRouter(ArticlePreviewClass);

export default ArticlePreview;