import * as React from 'react';
import {withRouter} from 'react-router';


interface IArticlePreviewPropsInterface {
    item: any
}

class ArticlePreviewClass extends React.Component<IArticlePreviewPropsInterface, any> {
    render() {
        return (
            <div className="article_preview">
                <div className="title">{ this.props.item.title }</div>
                <div className="lead">{ this.props.item.lead }</div>
                {
                    this.props.item.cover ? (
                        <div className="cover">
                            <img  src={this.props.item.cover} />
                        </div>
                    ) : null
                }
                <div className="bottom">

                </div>


            </div>)
    }
}

let ArticlePreview = withRouter(ArticlePreviewClass);

export default ArticlePreview;