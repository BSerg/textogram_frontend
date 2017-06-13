import {Router, Request, Response, NextFunction} from 'express';
import {StaticRouter, Switch, Route} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import db from '../db';
import Base from '../../components/Base';
import Article from '../../components/Article';


class ArticleRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    getArticle(req: Request, res: Response, next: NextFunction) {

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
    }
    init() {
        this.router.get('/:articleSlug', this.getArticle);
        this.router.get('/:articleSlug/gallery/:galleryUid', this.getArticle);
    }
}

export const articleRoutes = new ArticleRouter().router;