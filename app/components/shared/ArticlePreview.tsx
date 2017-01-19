import * as React from 'react';
import {withRouter, Link} from 'react-router';

import * as moment from 'moment';

import '../../styles/shared/article_preview.scss';
const ViewsIcon = require('babel!svg-react!../../assets/images/views_icon.svg?name=ViewsIcon');


interface IArticlePreviewPropsInterface {
    item: any
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

    render() {
        let date = this.getDateString(this.props.item.published_at || this.props.item.published_at);
        let views = this.getViewsString(this.props.item.views || 0);

        return (
            <div className="article_preview">
                <Link to={this.props.item.is_draft ? ("/articles/" + this.props.item.id + "/edit/") :
                            ("/articles/" + this.props.item.slug + "/")}>
                    <div className="title">{ this.props.item.title }</div>
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
                    { this.props.item.owner ?
                        <div className="owner">{this.props.item.owner.first_name + " " + this.props.item.owner.last_name}</div> : null
                    }
                    <div>{date}</div>
                    <div className="views"><ViewsIcon /> {views}</div>

                </div>


            </div>)
    }
}

let ArticlePreview = withRouter(ArticlePreviewClass);

export default ArticlePreview;