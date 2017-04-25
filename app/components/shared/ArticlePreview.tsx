import * as React from 'react';
import {withRouter, Link} from 'react-router';
import {api} from '../../api';

import * as moment from 'moment';
import {MediaQuerySerice} from '../../services/MediaQueryService';

import {UserAction, UPDATE_USER_DRAFTS} from '../../actions/user/UserAction';

import {Captions} from '../../constants';

import '../../styles/shared/article_preview.scss';
import '../../styles/shared/article_preview_control.scss';

const ViewsIcon = require('babel!svg-react!../../assets/images/views_icon.svg?name=ViewsIcon');
const LockIcon = require('babel!svg-react!../../assets/images/lock.svg?name=LockIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');
const EditIcon = require('babel!svg-react!../../assets/images/edit.svg?name=EditIcon');
const MoreIcon = require('babel!svg-react!../../assets/images/more_vertical.svg?name=MoreIcon');

interface IControlProps {
    item: any,
    deleteCallback: () => void,
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
                    <div onClick={this.props.deleteCallback}>Удалить</div>
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
    removed?: boolean;
}



class ArticlePreviewClass extends React.Component<IArticlePreviewPropsInterface, IArticlePreviewStateInterface> {

    constructor() {
        super();
        this.state = {menuOpen: true, isDesktop: MediaQuerySerice.getIsDesktop(), isNew: false, removed: false};
        this.checkDesktop = this.checkDesktop.bind(this);
        this.setNotNew = this.setNotNew.bind(this);
    }

    deleteArticle() {
        api.delete('/articles/editor/' + this.props.item.id + '/').then((response) => {

            if (this.props.item.is_draft) {
                UserAction.do(UPDATE_USER_DRAFTS, -1);
            }

            this.setState({deleted: true});
        }).catch((error) => {});

        // this.setState({deleted: true});
    }

    restore() {
        console.log(this.props.item);

        if (!this.state.deleted) {
            return;
        }

        api.post('/articles/editor/' + this.props.item.id + ( this.props.item.is_draft ? '/restore_draft/' : '/restore_published/')).then(
            (response) => {
                if (this.props.item.is_draft) {
                    UserAction.do(UPDATE_USER_DRAFTS, 1);
                }
                this.setState({deleted: false});

            }).catch((error) => {  });



        // this.setState({deleted: false});
    }

    remove() {
        if (this.state.deleted) {
            this.setState({removed: true});
        }
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
        if (this.state.removed) {
            return null;
        }

        let date = this.getDateString(this.props.item.is_draft ? this.props.item.last_modified : this.props.item.published_at);
        let coverStyle = { backgroundImage: `url('${this.props.item.cover}')`};

        if (this.state.deleted) {
            return (<div className="article_preview_deleted">
                Текст удален. <span onClick={this.restore.bind(this)}>Восстановить</span>
                <div className="close" onClick={this.remove.bind(this)}><CloseIcon /></div></div>);
        }

        if (this.state.isDesktop) {
            return (
                <div className={"article_preview" + (this.state.isNew ? " new" : "")} >
                    {
                        !this.props.isOwner && !this.props.item.is_draft ? (
                            <div className="article_preview__avatar" key="avatar">
                                <Link to={"/profile/" + this.props.item.owner.id} >
                                    <img src={this.props.item.owner.avatar}/>
                                </Link>
                             </div>
                        ) : null
                    }

                    <div className={"article_preview__data" + (this.props.isOwner || this.props.item.is_draft ? " owned": "")}>


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

                            : (<div className="article_preview__text" key="date">
                                <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                    ("/articles/" + this.props.item.slug + "/")}>
                                        {date}
                                    </Link>
                                </div>)
                        }

                        </div>

                    </div>

                    {
                        this.props.item.cover ? (
                            <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                ("/articles/" + this.props.item.slug + "/")}>
                                <div className="article_preview__cover"  style={coverStyle}></div>
                            </Link>
                        ) : <div className="article_preview__cover"></div>
                    }

                    {
                        this.props.isOwner ? (<ControlMenu item={this.props.item } deleteCallback={this.deleteArticle.bind(this)} />) : null
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

                                     this.props.isOwner ? <ControlMenu item={this.props.item}
                                                                       deleteCallback={this.deleteArticle.bind(this)} key="control" /> : null

                                 ]

                            : (<div className="article_preview__text" key="date">

                                    <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                        ("/articles/" + this.props.item.slug + "/")}>
                                         {date}
                                    </Link>
                                 </div>)
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