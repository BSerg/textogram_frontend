import {Router, Request, Response, NextFunction} from 'express';
import {StaticRouter, Switch, Route} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import db from '../db';
// import Base from '../../components/Base';
import Article from '../../components/Article';
import ArticleAmp from '../../components/shared/ArticleAmp';
import {Error404} from '../../components/Error';
import {Helmet} from 'react-helmet';
// import * as moment from 'moment';
import {Amp, BlockContentTypes} from "../../constants";
import * as fs from 'fs';
import {RenderComponent} from './RenderComponent';

let manifest: any = null;

try {
    manifest = JSON.parse(fs.readFileSync(process.env.MANIFEST_PATH, 'utf8'));
} catch(err) {}

function getArticleEmbeds(article: any): any {
    try {
        let embeds: any = {};
        article.content.blocks.forEach((block: any) => {
            if (block.type == BlockContentTypes.PHOTO) {
                embeds['gallery'] = true;
                return;
            }
            if (Amp.blockTypes.indexOf(block.type) == -1) {
                return;
            }
            if ( !block.__meta || !block.__meta.type || Amp.embedTypes.indexOf(block.__meta.type) == -1) {
                throw new Error("");
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

    getArticleAmpNew(req: Request, res: Response, next: NextFunction) {
        db.get(`${process.env.CACHE_KEY_PREFIX}:article:${req.params.articleSlug || ''}:amp`).then((data: any) => {
            res.end(data);
        }).catch((err) => { 
            console.log(err);
            res.redirect(`/articles/${req.params.articleSlug}`); 
        });
    }

    getArticleAmp(req: Request, res: Response, next: NextFunction) {       
        db.getArticle(req).then((data: any) => {
            try {

                let article = JSON.parse(data);
                let embeds = getArticleEmbeds(article);
                db.getBanners().then((bannerData) => {
                    let RenderedArticle: React.StatelessComponent<any> = (props: any) => {
                        return (<ArticleAmp article={article} bannerData={bannerData} {...props}/>);
                    };
                    let html = ReactDOMServer.renderToString(<RenderedArticle />);
                    let css: string = '';
                    try {
                        css = fs.readFileSync(`${process.env.VIEWS_DIR}/article_amp.css`).toString().replace(/(\r\n|\n|\r)/gm, '');
                    }
                    catch (cssErr) {
                        css = ''
                    }
                    let articleData: any = {
                        article: article,
                        css: css,
                        siteName: process.env.SITE_NAME,
                        baseUrl: process.env.SITE_URL,
                        html: html,
                        embeds: embeds,
                    };
                    res.render('article_amp.ejs', articleData);
                }).catch((err) => {
                    res.redirect(`/articles/${req.params.articleSlug}`);
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

                    return (<Article renderedArticle={article} match={{params: {galleryBlockId: req.params.galleryUid || null}}} {...props}/>);
                };
                let html = ReactDOMServer.renderToString(<RenderComponent><RenderedArticle /></RenderComponent>);
                const helmet = Helmet.renderStatic();
                res.render('index.ejs', {reactData: html, helmet: helmet, rev: process.env.REVISION || false, manifest: manifest});
            }
            catch (error) {
                next();
            }
        }).catch(() => {
            let html = ReactDOMServer.renderToString(<RenderComponent><Error404/></RenderComponent>);
            res.status(404).render('index.ejs', {reactData: html, helmet: null, rev: process.env.REVISION || false, manifest: manifest});
        });
    }
    init() {
        this.router.get('/:articleSlug/amp', this.getArticleAmpNew);
        this.router.get('/:articleSlug', this.getArticle);
        this.router.get('/:articleSlug/gallery/:galleryUid', this.getArticle);
    }
}

export const articleRoutes = new ArticleRouter().router;