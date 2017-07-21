import {Router, Request, Response, NextFunction} from 'express';
import {StaticRouter, Switch, Route} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Base from '../../components/Base';
import Index from '../../components/Index';
import Profile from '../../components/profile/Profile';
import db from '../db';
import {Helmet} from 'react-helmet';

import {getUserFromRequest} from '../utils';

import * as path from 'path';


class BaseRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    getIndex(req: Request, res: Response, next: NextFunction) {
        let user: string = getUserFromRequest(req);
        if (user) {
            return res.redirect((process.env.IS_LENTACH && process.env.LENTACH_NICKNAME) ? `/${process.env.LENTACH_NICKNAME}` : '/feed');
        }
        let html = ReactDOMServer.renderToString(
            <StaticRouter context={{}}>
                <Base>
                    <Route path="/" component={Index} />
                </Base>
            </StaticRouter>
        );
        let helmet = Helmet.renderStatic();
        res.render('index.ejs', {reactData: html, helmet: helmet});
    }

    getProfile(req: Request, res: Response, next: NextFunction) {
        db.get(`${process.env.CACHE_KEY_PREFIX}:user:${req.params.profileSlug}`).then((data: any) => {
            try {
                let user = JSON.parse(data);
                let RenderedProfile: React.StatelessComponent<any> = (props: any) => {
                    return (<Profile renderedUser={user} {...props}/>);
                };
                let html = ReactDOMServer.renderToString(
                    <StaticRouter context={{}}><Base><RenderedProfile /></Base></StaticRouter>
                );
                let helmet = Helmet.renderStatic();
                res.render('index.ejs', {reactData: html, helmet: helmet});
            }
            catch(error) {
                next();
            }
        }).catch(() => {
            next();
        });
    }

    getShortUrl(req: Request, res: Response, next: NextFunction) {
        db.get(`${process.env.CACHE_KEY_PREFIX}:s:${req.params.urlCode}`).then(url => {
            res.redirect(url);
        }).catch((error) => {next();});
    }

    getDefault(req: Request, res: Response, next: NextFunction) {
        let html = ReactDOMServer.renderToString(
            <StaticRouter context={{}}>
                <Base></Base>
            </StaticRouter>
        );
        let helmet = Helmet.renderStatic();
        res.render('index.ejs', {reactData: html, helmet: helmet});
    }

    init() {
        this.router.get('/', this.getIndex);
        this.router.get(/\/(manage|feed).*/, this.getDefault);
        this.router.get('/:urlCode', this.getShortUrl);
        this.router.get('/:profileSlug/*', this.getProfile);
        this.router.get('/:profileSlug', this.getProfile);
        this.router.get('/*', this.getDefault);
    }
}

export const baseRoutes = new BaseRouter().router;

