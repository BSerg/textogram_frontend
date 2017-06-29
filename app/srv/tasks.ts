import db from './db';
import {Request} from 'express';
import {getUserFromRequest} from './utils';

export function saveArticleViews(req: Request, articleData: any) {
        try {
            let time = (new Date()).getTime();
            db.client.zadd(`${process.env.CACHE_KEY_PREFIX}:article:${req.params.articleSlug || ''}:views`, 
                time, 
                `ts:${time}:user:${getUserFromRequest(req) || ''}:fp:${req.headers['x-fingerprint']||''}:ads:${articleData.ads_enabled ? 1 : 0}`);
            db.client.incr(`${process.env.CACHE_KEY_PREFIX}:article:${req.params.articleSlug || ''}:views_count`);
        }
        catch(error) {};
}
