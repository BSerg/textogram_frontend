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

    get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, data) => {
                if (data) {
                    resolve(data);
                }
                else {
                    reject(err);
                }
            });

        });            
    }

    getArticle(req: Request): Promise<any> {
        return new Promise((resolve, reject) => {
            const username = getUserFromRequest(req);
            this.client.get(`${process.env.CACHE_KEY_PREFIX}:article:${req.params.articleSlug || ''}:default`, (err, data: any) => {
                if (data) {
                    let jsonData = JSON.parse(data);
                    if (jsonData.paywall_enabled) {
                        this.client.sismember(`${process.env.CACHE_KEY_PREFIX}:article:${req.params.articleSlug}:access`, username, (err: any, isMember: boolean) => {
                            if (err) reject();
                            if (isMember) {
                                this.client.get(`${process.env.CACHE_KEY_PREFIX}:article:${req.params.articleSlug}:full`, (err, fullData: any) => {
                                    if (err) reject();
                                    resolve(fullData);
                                })
                            } else {
                                resolve(data);
                            }
                        })
                    } else {
                        resolve(data);
                    }
                }
                else {
                    reject();
                }
            });
        })
    }

    getArticles(req: Request): Promise<any> {

        return new Promise((resolve, reject) => {
            if (!req.query.user && !req.query.feed ) {
                return reject();
            }
            let key = this.getDBKey(req);
            let searchKeys = this.getSearchKeys(req.query);
            if (searchKeys && searchKeys.length && !req.query.searchuid) {
                let searchUid = uuid.v4();
                req.query.searchuid = searchUid;
                return this.client.zinterstore(`${process.env.CACHE_KEY_PREFIX}:srch:${searchUid}`, 1 + searchKeys.length, key, ...searchKeys, (zErr: any, zData: any ) => {
                    this.getArticleDataArr(`${process.env.CACHE_KEY_PREFIX}:srch:${searchUid}`, req).then((data) => {
                        resolve(data);
                    }).catch(() => { reject() });
                });
            }
            else {
                this.getArticleDataArr(key, req).then((data: any) => {
                    resolve(data);
                }).catch(() => { reject(); });
            }
        })
    }

    getBanners(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.get(`${process.env.CACHE_KEY_PREFIX}:advertisements:banners`, (err: any, data: any) => {
                // console.log(err, data)
                if (err) {
                    reject();
                } else {
                    resolve(data);
                }
            });
        });
    }

    getBanners2(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.get(`${process.env.CACHE_KEY_PREFIX}:advertisements:banners2`, (err: any, data: any) => {
                // console.log(err, data)
                if (err) {
                    reject();
                } else {
                    resolve(data);
                }
            });
        });
    }

    getRecommendations(req: Request): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.lrange(`${process.env.CACHE_KEY_PREFIX}:article:${req.params.articleSlug}:recommendations`, 0, -1, (err: any, data: any) => {
                if (err) {
                    reject();
                } else {
                    resolve(data);
                }
            });
        });
    }

    private getSearchKeys(query: any): string[]|null {
        if (!query || !query.q || query.q.length < this.MIN_SEARCH_QUERY_LENGTH) {
            return null;
        }
        let keys: string[] = [];
        query.q.split(' ').forEach( (k: string) => {
            if (k.length >= this.MIN_SEARCH_QUERY_LENGTH) {
                keys.push(`${process.env.CACHE_KEY_PREFIX}:q:${k.toLowerCase()}`);
            }
        });
        return keys.length ? keys : null;
    }

    private getDBKey(req: Request): string {
        let key: string;
        if (req.query.searchuid) {
            key = `${process.env.CACHE_KEY_PREFIX}:srch:${req.query.searchuid}`;
        }
        else if (req.query.user) {
            key = `${process.env.CACHE_KEY_PREFIX}:user:${req.query.user}:articles`;
        }
        else if (req.query.feed) {
            let user: string = getUserFromRequest(req);
            key = user ? `${process.env.CACHE_KEY_PREFIX}:user:${user}:feed` : 'none';
        }
        else {
            key = 'none';
        }
        return key;
    }

    private getArticleDataArr(key: string, req: Request): Promise<any> {

        return new Promise((resolve, reject) => {
            this.client.zcard(key, (cardErr: any, cardData: any) => {
                if (!cardData) {
                    return reject();
                }
                let count = parseInt(cardData) || 0;
                let pageSize = parseInt(req.query.page_size) || this.ARTICLE_PAGE_SIZE;
                let page = req.query.page ? parseInt(req.query.page) || 0 : 1;
                let rangeStart  = (page - 1) * pageSize;
                if (!(page && count && (count > rangeStart))) {
                    return reject();
                }
                let args = [key, '+inf', 0, 'LIMIT', rangeStart, pageSize ];
                this.client.zrevrangebyscore(args, (rangeErr: any, rangeData: any) => {
                    rangeData = rangeData || [];
                    this.client.mget(rangeData.map((slug: string) => {return `${process.env.CACHE_KEY_PREFIX}:article:${slug}:preview`}),
                        (listErr: any, list: any) => {
                            if (!list || !list.length) {
                                return reject();
                            }
                            resolve(JSON.stringify({count: count,
                                next: this.getNextUrl(req, count, page, pageSize, req.query.user ? {'user': req.query.user} : {'feed': 'true'}),
                                results: list}));
                    });
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