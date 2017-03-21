import * as React from 'react';
import {withRouter, Link} from 'react-router';

import * as moment from 'moment';

import {Captions} from '../../constants';
import '../../styles/shared/article_preview_new.scss';
const ViewsIcon = require('babel!svg-react!../../assets/images/views_icon.svg?name=ViewsIcon');
const LockIcon = require('babel!svg-react!../../assets/images/lock.svg?name=LockIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');
const EditIcon = require('babel!svg-react!../../assets/images/edit.svg?name=EditIcon');

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
}



class ArticlePreviewClass extends React.Component<IArticlePreviewPropsInterface, IArticlePreviewStateInterface> {

    constructor() {
        super();
        this.state = {menuOpen: false, isDesktop: MediaQuerySerice.getIsDesktop()};
        this.toggleMenu = this.toggleMenu.bind(this);
        this.checkDesktop = this.checkDesktop.bind(this);
    }

    toggleMenu() {
        this.setState({menuOpen: !this.state.menuOpen});
    }

    checkDesktop(isDesktop: boolean) {
        console.log(isDesktop);
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

    componentDidMount() {
        MediaQuerySerice.listen(this.checkDesktop);
    }

    componentWillUnmount() {
        MediaQuerySerice.unbind(this.checkDesktop);
    }

    render() {
        let date = this.getDateString(this.props.item.is_draft ? this.props.item.last_modified : this.props.item.published_at);
        let views = this.getViewsString(this.props.item.views || 0);

        return (
            <div className="article_preview">

                <div className="content">
                    {this.props.isFeed ? (
                        <div className="avatar">
                            <Link to={"/profile/" + this.props.item.owner.id} >
                                <div className="title__avatar"><img src={this.props.item.owner.avatar}/></div>
                            </Link>
                    </div>) : null}

                    <div className="text">
                        <div className="title">

                            <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                ("/articles/" + this.props.item.slug + "/")}><div>{ this.props.item.title || date }</div>
                            </Link>
                        </div>

                        {
                            this.state.isDesktop ? (
                                <div className="lead">

                                    {
                                        this.props.item.lead ? (
                                            <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                                ("/articles/" + this.props.item.slug + "/")}>
                                                <div className="lead">{ this.props.item.lead }</div>
                                            </Link>
                                        ) : null
                                    }
                                </div>
                            ) : null
                        }

                    </div>

                    {
                        this.state.isDesktop? (
                            <div className="image">

                                {
                                    this.props.item.cover ? (
                                        <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                            ("/articles/" + this.props.item.slug + "/")}>
                                            <img  src={this.props.item.cover} />
                                        </Link>
                                    ) : null
                                }
                            </div>
                        ) : null
                    }




                    { this.props.isOwner ? (
                        <div className="controls">
                            <div className="more_button" onClick={this.toggleMenu}>
                                btn
                            </div>

                            {
                                this.state.menuOpen ? (
                                    <div className="buttons">
                                        <div>
                                            <Link to={"/articles/" + this.props.item.id + "/edit/"}>
                                                {Captions.profile.articlePreviewEdit}
                                            </Link>
                                        </div>
                                        {
                                            !this.props.item.is_draft ? (<div>{Captions.profile.articlePreviewSettings}</div>) : null
                                        }
                                        <div>{ this.props.item.is_draft ? Captions.profile.articlePreviewCopy : Captions.profile.articlePreviewCopyToDrafts}</div>
                                        <div onClick={this.deleteArticle.bind(this)}>{Captions.profile.articlePreviewDelete}</div>
                                    </div>
                                ) : null
                            }
                        </div>) : null }

                    <div>

                    </div>
                </div>

                {
                    !this.state.isDesktop ? (
                        <div className="lead_mobile">
                            {
                                this.props.item.lead ? (
                                    <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                        ("/articles/" + this.props.item.slug + "/")}>
                                        <div className="lead">{ this.props.item.lead }</div>
                                    </Link>
                                ) : null
                            }
                        </div>
                    ) : null
                }

                {
                    (!this.state.isDesktop && this.props.item.cover) ? (
                        <div className="image_mobile">

                            {
                                this.props.item.cover ? (
                                    <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                        ("/articles/" + this.props.item.slug + "/")}>
                                        <img  src={this.props.item.cover} />
                                    </Link>
                                ) : null
                            }
                        </div>
                    ) : null
                }

                <div className="bottom">
                    <div>{date}</div>
                    <div>
                        {
                            this.props.item.is_draft ? null : (<div className="views">{ this.props.item.link_access ? <LockIcon/> : <ViewsIcon />} {views}</div>)
                        }
                    </div>
                </div>
            </div>)
    }

    _render() {
        let date = this.getDateString(this.props.item.is_draft ? this.props.item.last_modified : this.props.item.published_at);
        let views = this.getViewsString(this.props.item.views || 0);

        return (
            <div className={"article_preview" + (this.props.isOwner ? " article_preview_owner" : "") }>
                    <div className="title">
                        <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                            ("/articles/" + this.props.item.slug + "/")}><div>{ this.props.item.title || date }</div></Link>

                        { this.props.isFeed ? (
                            <Link to={"/profile/" + this.props.item.owner.id} ><div className="title__avatar">
                                <img src={this.props.item.owner.avatar}/>
                            </div></Link>) : (this.props.isOwner ? (
                                <Link to={"/articles/" + this.props.item.id + "/edit/"}>
                                    <div className="title__edit"><EditIcon /></div>
                                </Link>) : null) }
                    </div>

                    {
                        this.props.item.lead ? (
                            <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                ("/articles/" + this.props.item.slug + "/")}>
                                <div className="lead">{ this.props.item.lead }</div>
                            </Link>
                        ) : null
                    }
                    {
                        this.props.item.cover ? (
                            <div className="cover">
                                <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                                    ("/articles/" + this.props.item.slug + "/")}>
                                    <img  src={this.props.item.cover} />
                                </Link>
                            </div>
                        ) : null
                    }

                <div className="bottom">

                    { (this.props.item.owner && this.props.isFeed) ?
                        <Link to={ "/profile/" + this.props.item.owner.id }><div className="owner">
                            {this.props.item.owner.first_name + " " + this.props.item.owner.last_name}
                        </div></Link> : null
                    }
                    { (this.props.item.owner && this.props.isFeed) ? (<div className="fill"></div>) : null}


                    <div>{date}</div>
                    {
                        this.props.item.is_draft ? null : (<div className="views">{ this.props.item.link_access ? <LockIcon/> : <ViewsIcon />} {views}</div>)
                    }

                    {
                        this.props.item.is_draft ? (
                        <div className="delete" onClick={this.deleteArticle.bind(this)}><span>{Captions.management.draftDelete}</span> <CloseIcon /></div>) :
                        null
                    }

                </div>

                {
                    this.props.isOwner ? (
                        <div className="bottom_controls">
                            <Link to={"/articles/" + this.props.item.id + "/edit/"}>
                                <div>{Captions.profile.articlePreviewEdit}</div>
                            </Link>
                            <div>{Captions.profile.articlePreviewSettings}</div>
                            <div>{Captions.profile.articlePreviewCopy}</div>
                            <div className="delete" onClick={this.deleteArticle.bind(this)}>{Captions.profile.articlePreviewDelete}</div>
                        </div>) : null
                }


            </div>)
    }
}

let ArticlePreview = withRouter(ArticlePreviewClass);

export default ArticlePreview;