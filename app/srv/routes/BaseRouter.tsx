import {Router, Request, Response, NextFunction} from 'express';
import {StaticRouter, Switch, Route} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Base from '../../components/Base';
// import BaseNew from '../../components/BaseNew';
import Index from '../../components/Index';
import Article from '../../components/Article';
import db from '../db';

import * as path from 'path';

// let ReactApp = React.createFactory(BaseNew);


class BaseRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    getIndex(req: Request, res: Response, next: NextFunction) {
        let html = ReactDOMServer.renderToString(
            <StaticRouter context={{}}>
                <Base>
                    <Route path="/" component={Index} />
                </Base>
            </StaticRouter>
        );

        // res.end(html);
        res.render('index.ejs', {reactData: html});
    }

    getDefault(req: Request, res: Response, next: NextFunction) {
        res.render('index.ejs', {reactData: ''});
    }

    /*getArticle(req: Request, res: Response, next: NextFunction) {

        let articleSlug = req.params.articleSlug || '';

        db.get('article:' + articleSlug, (data: string) => {

            try {
                let article = JSON.parse(data);

                let RenderedArticle: React.StatelessComponent<any> = (props: any) => {
                    return (<Article renderedArticle={article} {...props}/>);
                };
                let html = ReactDOMServer.renderToString(<StaticRouter context={{}}><Base><RenderedArticle /></Base></StaticRouter>);
                res.render('index.ejs', {reactData: html});
            }
            catch (error) {
                res.render('index.ejs', {reactData: ''});
            }
            // res.end(JSON.parse(data).html);

        }, (error: any) => {
            res.status(404).send({
                msg: 'not found'
            });
        });
    }*/

    init() {
        this.router.get('/', this.getIndex);
        this.router.get('/:anySlug', this.getDefault);

    }
}

export const baseRoutes = new BaseRouter().router;

