import {Router, Request, Response, NextFunction} from 'express';
import db from '../db';

class ApiRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    getArticle(req: Request, res: Response, next: NextFunction) {
        let articleSlug = req.params.articleSlug || '';

        db.getArticle(req, articleSlug, (data: any)  => {
            res.end(data);

        }, (error: any) => {
            res.status(404).send({
                msg: 'not found'
            });
        });
    }

    getArticles(req: Request, res: Response, next: NextFunction) {
        db.getArticles(req, (data: any) => {
            res.end(data);
        }, (error: any) => {
            res.status(404).send({msg: 'not found'});
        });

        // res.end(JSON.stringify({'results': []}));
    }

    getNotFound(req: Request, res: Response, next: NextFunction) {
        res.status(404).send({'msg': 'not found'});
    }

    init() {
        this.router.get('/articles/:articleSlug', this.getArticle);
        this.router.get('/articles/', this.getArticles);
        this.router.get('/*', this.getNotFound);
    }
}

export const apiRoutes = new ApiRouter().router;