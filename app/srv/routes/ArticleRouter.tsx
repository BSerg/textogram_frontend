import {Router, Request, Response, NextFunction} from 'express';
import {StaticRouter, Switch, Route} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import db from '../db';
import Base from '../../components/Base';
import Article from '../../components/Article';
import ArticleAmp from '../../components/shared/ArticleAmp';
import {Error404} from '../../components/Error';
import {Helmet} from 'react-helmet';
import * as moment from 'moment';
import {Amp} from "../../constants";

function getArticleEmbeds(article: any): any {
    try {
        let embeds: any = {};
        article.content.blocks.forEach((block: any) => {
            if (Amp.blockTypes.indexOf(block.type) == -1) {
                return;
            }
            if ( !block.__meta || !block.__meta.type || Amp.embedTypes.indexOf(block.__meta.type) == -1) {
                throw new Error("embed error");
            }
            embeds[block.__meta.type] = true;
        });
        return embeds;
    }
    catch (err) {
        throw new Error("embed error");
    }
}

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
                let embeds = getArticleEmbeds(article);
                let RenderedArticle: React.StatelessComponent<any> = (props: any) => {
                    return (<ArticleAmp article={article} {...props}/>);
                };
                let html = ReactDOMServer.renderToString(<RenderedArticle />);

                res.render('article_amp.ejs', {
                    article: article, 
                    date: moment(article.published_at).format('DD.MM.YYYY'),
                    siteName: process.env.SITE_NAME,
                    baseUrl: process.env.SITE_URL,
                    html: html,
                    embeds: embeds
                });
            }
            catch (error) {
                res.redirect(`/articles/${req.params.articleSlug}`);
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