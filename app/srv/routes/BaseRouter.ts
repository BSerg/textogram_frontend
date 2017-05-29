import {Router, Request, Response, NextFunction} from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Base from '../../components/Base';
import BaseNew from '../../components/BaseNew';
import Index from '../../components/DefaultIndex';
import DefaultIndex from "../../components/DefaultIndex";


let ReactApp = React.createFactory(DefaultIndex);

class BaseRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    getIndex(req: Request, res: Response, next: NextFunction) {
        let html = ReactDOMServer.renderToString(ReactApp({props: {params: {}}}));
        res.end(html)
    }
    init() {
        this.router.get('/', this.getIndex);
    }
}

export const baseRoutes = new BaseRouter().router;

