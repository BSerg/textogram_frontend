import * as React from 'react';
import {withRouter, Link} from 'react-router';

import * as moment from 'moment';

import {Captions} from '../../constants';
import '../../styles/shared/article_preview.scss';
const ViewsIcon = require('babel!svg-react!../../assets/images/views_icon.svg?name=ViewsIcon');
const LockIcon = require('babel!svg-react!../../assets/images/lock.svg?name=LockIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');
const EditIcon = require('babel!svg-react!../../assets/images/edit.svg?name=EditIcon');


interface IArticlePreviewPropsInterface {
    item: any,
    onDelete?: (id: number) => {},
    onClick?: (id: number|null) => {},
    isFeed?: boolean,
    isOwner?: boolean,
}



class ArticlePreviewClass extends React.Component<IArticlePreviewPropsInterface, any> {

    getDateString(dt: string): string {
        if (!dt) return '';
        let dateString = moment(dt).format('DD.MM.YYYY, HH:mm');
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
        if (this.props.onDelete) this.props.onDelete(this.props.item.id);
    }

    render() {
        let date = this.getDateString(this.props.item.is_draft ? this.props.item.last_modified : this.props.item.published_at);
        let views = this.getViewsString(this.props.item.views || 0);

        return (
            <div className={"article_preview" + (this.props.isOwner ? " article_preview_owner" : "") } onClick={this.props.onClick.bind(this.props.item.id)}>
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
                    { (this.props.item.owner && !this.props.item.is_draft) ?
                        <Link to={ "/profile/" + this.props.item.owner.id }><div className="owner">
                            {this.props.item.owner.first_name + " " + this.props.item.owner.last_name}
                        </div></Link> : null
                    }
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
                            <div>{Captions.profile.articlePreviewEdit}</div>
                            <div>{Captions.profile.articlePreviewSettings}</div>
                            <div>{Captions.profile.articlePreviewCopy}</div>
                            <div className="delete">{Captions.profile.articlePreviewDelete}</div>
                        </div>) : null
                }


            </div>)
    }
}

let ArticlePreview = withRouter(ArticlePreviewClass);

export default ArticlePreview;