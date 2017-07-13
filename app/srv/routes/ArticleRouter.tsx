import {Router, Request, Response, NextFunction} from 'express';
import {StaticRouter, Switch, Route} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import db from '../db';
import Base from '../../components/Base';
import Article from '../../components/Article';
import {Error404} from '../../components/Error';
import {Helmet} from 'react-helmet';
import * as moment from 'moment';


class ArticleRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    getArticleAmp(req: Request, res: Response, next: NextFunction) {       
        db.getArticle(req).then((data: any) => {
            try {
                let article = JSON.parse(data);
                res.render('article_amp.ejs', {
                    article: article, 
                    date: moment(article.published_at).format('DD.MM.YYYY'),
                    siteName: process.env.SITE_NAME,
                });
            }
            catch (error) {
                res.status(404).render('404.ejs');
            }
        }).catch((error: any) => {
            res.status(404).render('404.ejs');
        })
    }

    getArticle(req: Request, res: Response, next: NextFunction) {
        db.getArticle(req).then((data: any) => {
            try {
                let article = JSON.parse(data);

                let RenderedArticle: React.StatelessComponent<any> = (props: any) => {
                    return (<Article renderedArticle={article} {...props}/>);
                };
                let html = ReactDOMServer.renderToString(<StaticRouter context={{}}><Base><RenderedArticle /></Base></StaticRouter>);
                const helmet = Helmet.renderStatic();
                res.render('index.ejs', {reactData: html, helmet: helmet});
            }
            catch (error) {
                next();
            }
        }).catch(() => {
            let html = ReactDOMServer.renderToString(<StaticRouter context={{}}><Base><Error404/></Base></StaticRouter>);
            res.status(404).render('index.ejs', {reactData: html, helmet: null});
        });
    }
    init() {
        this.router.get('/:articleSlug/amp', this.getArticleAmp);
        this.router.get('/:articleSlug', this.getArticle);
        this.router.get('/:articleSlug/gallery/:galleryUid', this.getArticle);
    }
}

export const articleRoutes = new ArticleRouter().router;