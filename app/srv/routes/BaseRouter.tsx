import {Router, Request, Response, NextFunction} from 'express';
import {Switch, Route} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Index from '../../components/Index';
import Profile from '../../components/profile/Profile';
import db from '../db';
import {Helmet} from 'react-helmet';
import {getUserFromRequest} from '../utils';
import {RenderComponent} from './RenderComponent';

import * as path from 'path';
import * as fs from 'fs';

let manifest: any = null;

try {
    manifest = JSON.parse(fs.readFileSync(process.env.MANIFEST_PATH, 'utf8'));
} catch(err) {}

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
            
            <RenderComponent>
                    <Route path="/" component={Index} />
            </RenderComponent>
        );
        let helmet = Helmet.renderStatic();
        res.render('index.ejs', {reactData: html, helmet: helmet, rev: process.env.REVISION || false, manifest: manifest});
    }

    getProfile(req: Request, res: Response, next: NextFunction) {
        db.get(`${process.env.CACHE_KEY_PREFIX}:user:${req.params.profileSlug}`).then((data: any) => {
            try {
                let user = JSON.parse(data);
                let RenderedProfile: React.StatelessComponent<any> = (props: any) => {
                    return (<Profile renderedUser={user} {...props}/>);
                };
                let html = ReactDOMServer.renderToString(
                    <RenderComponent><RenderedProfile /></RenderComponent>
                );
                let helmet = Helmet.renderStatic();
                res.render('index.ejs', {reactData: html, helmet: helmet, rev: process.env.REVISION || false, manifest: manifest});
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
            <RenderComponent />
        );
        let helmet = Helmet.renderStatic();
        res.render('index.ejs', {reactData: html, helmet: helmet, rev: process.env.REVISION || false, manifest: manifest});
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

