import {Router, Request, Response, NextFunction} from 'express';
import {StaticRouter} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
// import Base from '../../components/Base';
import BaseNew from '../../components/BaseNew';
import Index from '../../components/Index';


let ReactApp = React.createFactory(BaseNew);


class BaseRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    getIndex(req: Request, res: Response, next: NextFunction) {
        let html = ReactDOMServer.renderToString(
            <StaticRouter><Index /></StaticRouter>

        );
        res.end(html)
    }
    init() {
        this.router.get('/', this.getIndex);
    }
}

export const baseRoutes = new BaseRouter().router;

