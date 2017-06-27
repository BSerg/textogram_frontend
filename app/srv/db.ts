import * as redis from 'redis';
import {Request} from 'express'
import {getUserFromRequest} from './utils';
import * as uuid from 'uuid';

class DataClient {
    client: redis.RedisClient;
    ARTICLE_PAGE_SIZE: number = 20;
    MIN_SEARCH_QUERY_LENGTH = 3;
    MAX_SEARCH_QUERY_LENGTH = 20;

    constructor() {
        this.client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {db: process.env.REDIS_DB});
        this.init();
    }

    init() {
        this.client.on('error', (error: any) => {});
    }

    get(req: Request, key: string, success: (data: any) => any, error: any) {
        this.client.get(key, (err, data) => {
            if (data) {
                return success(data);
            }
            else {
                return error();
            }
        });
    }

    getArticle(req: Request, slug: string, success: (data: any) => any, error: any) {
        this.client.get('article:' + slug + ':default', (err, data) => {
            if (data) {
                return success(data);
            }
            else {
                return error();
            }
        })
    }

    getArticles(req: Request, success: (data: any) => any, error: any) {
        if (!req.query.user && !req.query.feed ) {
            return error();
        }
        let key = this.getKey(req);
        let searchKeys = this.getSearchKeys(req.query);
        if (searchKeys && searchKeys.length && !req.query.searchuid) {
            let searchUid = uuid.v4();
            req.query.searchuid = searchUid;
            return this.client.zinterstore(`srch:${searchUid}`, 1 + searchKeys.length, key, ...searchKeys, (zErr: any, zData: any ) => {
                return this.getArticleDataArr(`srch:${searchUid}`, req, success, error);
            });
        }
        else {
            return this.getArticleDataArr(key, req, success, error);
        }
    }

    private getSearchKeys(query: any): string[]|null {
        if (!query || !query.q || query.q.length < this.MIN_SEARCH_QUERY_LENGTH) {
            return null;
        }
        let keys: string[] = [];
        query.q.split(' ').forEach( (k: string) => {
            if (k.length >= this.MIN_SEARCH_QUERY_LENGTH) {
                keys.push(`q:${k}`);
            }
        });
        return keys.length ? keys : null;
    }

    private getKey(req: Request): string {
        let key: string;
        if (req.query.searchuid) {
            key = `srch:${req.query.searchuid}`;
        }
        else if (req.query.user) {
            key = `user:${req.query.user}:articles`;
        }
        else if (req.query.feed) {
            let user: string = getUserFromRequest(req);
            key = user ? `user:${user}:feed` : 'none';
        }
        else {
            key = 'none';
        }
        return key;
    }

    private getArticleDataArr(key: string, req: Request, success: (data: any) => any, error: any) {
        this.client.zcard(key, (cardErr: any, cardData: any) => {
            if (!cardData) {
                return error();
            }
            let count = parseInt(cardData) || 0;
            let pageSize = parseInt(req.query.page_size) || this.ARTICLE_PAGE_SIZE;
            let page = req.query.page ? parseInt(req.query.page) || 0 : 1;
            let rangeStart  = (page - 1) * pageSize;
            if (!(page && count && (count > rangeStart))) {
                return error();
            }
            let args = [key, '+inf', 0, 'LIMIT', rangeStart, pageSize ];
            this.client.zrevrangebyscore(args, (rangeErr: any, rangeData: any) => {
                rangeData = rangeData || [];
                this.client.mget(rangeData.map((slug: string) => {return `article:${slug}:preview`}),
                    (listErr: any, list: any) => {
                        if (!list || !list.length) {
                            return error();
                        }
                        success(JSON.stringify({count: count,
                            next: this.getNextUrl(req, count, page, pageSize, req.query.user ? {'user': req.query.user} : {'feed': 'true'}),
                            results: list}));
                });
            });
        });
    }

    private getNextUrl(req: Request, count: number, currentPage: number, pageSize: number, params: any): string|null {
        if (count <= currentPage * pageSize) {
            return null;
        }
        let url: string = `${req.protocol}://${req.get('host')}${req.originalUrl}`.split('?')[0] || '';
        if (url) {
            params.count = count;
            params.page_size = pageSize;
            params.page = currentPage + 1;
            if (req.query.searchuid) {
                params.searchuid = req.query.searchuid;
            }
            let urlParams: string = Object.keys(params).map(k => {return `${k}=${params[k]}`;}).join('&');
            return `${url}?${urlParams}`;

        }
        return null;
    }
}

let db: DataClient = new DataClient();
export default db;