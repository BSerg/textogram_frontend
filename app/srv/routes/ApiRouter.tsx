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

        db.get('article:' + articleSlug, (data: string) => {
            res.end(data);

        }, (error: any) => {
            res.status(404).send({
                msg: 'not found'
            });
        });
    }

    init() {
        this.router.get('/articles/:articleSlug', this.getArticle);
    }
}

export const apiRoutes = new ApiRouter().router;