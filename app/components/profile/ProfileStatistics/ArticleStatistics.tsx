import * as React from 'react';
import {Link} from 'react-router-dom';
import {Captions} from '../../../constants';

import '../../../styles/shared/article_preview_statistics.scss';

export function ArticleStatisticsPreview(props: {item: any})  {
    let {item} = props;
    return <div className="article_preview_statistics">
        <div className="article_preview_statistics__title">
            <Link to={`/articles/${item.slug}`}>{item.title}</Link>
        </div>

        <div className="article_preview_statistics__info">
            {
                ['views_today', 'views_month', 'views_last_month'].map((key: string) => {
                    return <div key={key}>
                        {(Captions.management[key].toString() || '') + ':'} 
                        <span>{item[key] || 0}</span>
                    </div>
                })
            }
        </div>
    </div>
}