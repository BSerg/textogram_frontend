import * as redis from 'redis';
import {Request} from 'express'

class DataClient {
    client: redis.RedisClient;
    ARTICLE_PAGE_SIZE: number = 20;

    constructor() {
        this.client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {db: process.env.REDIS_DB});
        this.init();
    }

    init() {
        this.client.on('error', (error: any) => {

        });
    }

    get(req: Request, key: string, success: (data: any) => any, error: any) {

        this.client.get(key, (err, data) => {
            if (data) {
                success(data);
            }
            else {
                error();
            }
        })
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

        let key = req.query.user ? `user:${req.query.user}:articles` : 'none';
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
                            next: this._getNextUrl(req, count, page, pageSize, req.query.user ? {'user': req.query.user} : {'feed': 'true'}),
                            results: list}));
                });
            });
        });
    }

    _getNextUrl(req: Request, count: number, currentPage: number, pageSize: number, params: any): string|null {
        if (count <= currentPage * pageSize) {
            return null;
        }
        let url: string = `${req.protocol}://${req.get('host')}${req.originalUrl}`.split('?')[0] || '';
        if (url) {
            params.count = count;
            params.page_size = pageSize;
            params.page = currentPage + 1;
            let urlParams: string = Object.keys(params).map(k => {return `${k}=${params[k]}`;}).join('&');
            return `${url}?${urlParams}`;

        }
        return null;
    }

}

let db: DataClient = new DataClient();
export default db;