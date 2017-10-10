import * as React from 'react';
import ItemList from '../ItemList/ItemList';
import {ArticleStatisticsPreview} from './ArticleStatistics';

export function ProfileStatistics() {
    return <div>

        <ItemList ItemComponent={ArticleStatisticsPreview} />
    </div>
}

export default ProfileStatistics;