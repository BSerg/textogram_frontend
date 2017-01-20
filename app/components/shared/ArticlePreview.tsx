import * as React from 'react';
import {withRouter, Link} from 'react-router';

import * as moment from 'moment';

import {Captions} from '../../constants';
import '../../styles/shared/article_preview.scss';
const ViewsIcon = require('babel!svg-react!../../assets/images/views_icon.svg?name=ViewsIcon');
const CloseIcon = require('babel!svg-react!../../assets/images/close.svg?name=CloseIcon');


interface IArticlePreviewPropsInterface {
    item: any,
    onDelete?: (id: number) => {}
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
            <div className="article_preview">
                <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                            ("/articles/" + this.props.item.slug + "/")}>

                    {
                        (!this.props.item.title && ! this.props.item.cover && !this.props.item.lead) ?
                        <div className="title">{ date }</div>: null
                    }
                    {
                        this.props.item.title ? (<div className="title">{ this.props.item.title }</div>) : null
                    }
                    {
                        this.props.item.lead ? (
                            <div className="lead">{ this.props.item.lead }</div>
                        ) : null
                    }
                    {
                        this.props.item.cover ? (
                            <div className="cover">
                                <img  src={this.props.item.cover} />
                            </div>
                        ) : null
                    }
                </Link>
                <div className="bottom">
                    { (this.props.item.owner && !this.props.item.is_draft) ?
                        <div className="owner">{this.props.item.owner.first_name + " " + this.props.item.owner.last_name}</div> : null
                    }
                    <div>{date}</div>
                    <div className="views"><ViewsIcon /> {views}</div>
                    {
                        this.props.item.is_draft ? (
                        <div className="delete" onClick={this.deleteArticle.bind(this)}><span>{Captions.management.draftDelete}</span> <CloseIcon /></div>) :
                        null
                    }

                </div>


            </div>)
    }
}

let ArticlePreview = withRouter(ArticlePreviewClass);

export default ArticlePreview;