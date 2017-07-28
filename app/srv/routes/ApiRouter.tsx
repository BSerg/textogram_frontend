import {Router, Request, Response, NextFunction} from 'express';
import db from '../db';
import {saveArticleViews} from '../tasks';

class ApiRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    getArticle(req: Request, res: Response, next: NextFunction) {
        let articleSlug = req.params.articleSlug || '';

        db.getArticle(req).then((data: any) => {
            try {
                let d = JSON.parse(data);
                db.get(`${process.env.CACHE_KEY_PREFIX}:article:${req.params.articleSlug || ''}:views_count`).then((count: string) => {   
                    try {
                        d.views = parseInt(count);
                    }
                    catch(error) {}
                    finally { res.send(d); }
                }).catch(() => { res.send(d); })
                saveArticleViews(req, d);
            }
            catch(error) {
                res.status(500).send({msg: 'article error'});
            }
        }).catch(() => {
            res.status(404).send({msg: 'not found'});
        });
    }

    getArticles(req: Request, res: Response, next: NextFunction) {
        db.getArticles(req).then((data) => {
            res.end(data);
        }).catch(() => {
            res.status(404).send({msg: 'not found'});
        })

        // res.end(JSON.stringify({'results': []}));
    }

    getBanners(req: Request, res: Response, next: NextFunction) {
        db.getBanners().then((data) => {
            res.end(data);
        }).catch(() => {
            res.status(404).send({msg: 'not found'});
        });
    }

    getRecommendations(req: Request, res: Response, next: NextFunction) {
        db.getRecommendations(req).then(data => {
            res.json(data);
        }).catch(() => {
            res.status(404).send({msg: 'not found'});
        });
    }

    getNotFound(req: Request, res: Response, next: NextFunction) {
        res.status(404).send({'msg': 'not found'});
    }

    init() {
        this.router.get('/articles/search/', this.getArticles);
        this.router.get('/articles/', this.getArticles);
        this.router.get('/articles/:articleSlug', this.getArticle);
        this.router.get('/articles/:articleSlug/recommendations', this.getRecommendations);
        this.router.get('/advertisements/banners', this.getBanners);
        this.router.get('/*', this.getNotFound);
    }
}

export const apiRoutes = new ApiRouter().router;