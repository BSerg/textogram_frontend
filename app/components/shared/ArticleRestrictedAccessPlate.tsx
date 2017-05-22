import * as React from 'react';

import {Captions} from '../../constants';


interface IProps {
    article: any;
}

export default class ArticleRestrictedAccessPlate extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="article_restricted_access_plate">
                <div className="article_restricted_access_plate__head">
                    {Captions.shared.articleRestrictedHeader}
                </div>
                <div className="article_restricted_access_plate__content">
                    <div className="article_restricted_access_plate__price">
                        {this.props.article.paywall_price} {(Captions as any).shared.currency[this.props.article.paywall_currency]}
                    </div>
                    <div className="article_restricted_access_plate__buy">{Captions.shared.toBuyAccessToArticle}</div>
                </div>
            </div>
        )
    }
}