import {Router, Request, Response, NextFunction} from 'express';
import {StaticRouter, Switch, Route} from 'react-router-dom';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Base from '../../components/Base';
// import BaseNew from '../../components/BaseNew';
import Index from '../../components/Index';
import Profile from '../../components/profile/Profile';
import db from '../db';

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
            return res.redirect('/feed');
        }
        let html = ReactDOMServer.renderToString(
            <StaticRouter context={{}}>
                <Base>
                    <Route path="/" component={Index} />
                </Base>
            </StaticRouter>
        );
        res.render('index.ejs', {reactData: html});
    }

    getProfile(req: Request, res: Response, next: NextFunction) {
        db.get(req, `user:${req.params.profileSlug}`, (data) => {
            try {
                let user = JSON.parse(data);
                let RenderedProfile: React.StatelessComponent<any> = (props: any) => {
                    return (<Profile renderedUser={user} {...props}/>);
                };
                let html = ReactDOMServer.renderToString(
                    <StaticRouter context={{}}><Base><RenderedProfile /></Base></StaticRouter>
                );
                res.render('index.ejs', {reactData: html});
            }
            catch(error) {
                res.render('index.ejs', {reactData: ''});
            }
        }, () => {
            res.render('index.ejs', {reactData: ''});
        })
        
    }

    getDefault(req: Request, res: Response, next: NextFunction) {
        res.render('index.ejs', {reactData: ''});
    }

    init() {
        this.router.get('/', this.getIndex);
        this.router.get(/\/(manage|feed).*/, this.getDefault);
        this.router.get('/:profileSlug/*', this.getProfile);
        this.router.get('/:profileSlug', this.getProfile);
        this.router.get('/*', this.getDefault);
    }
}

export const baseRoutes = new BaseRouter().router;

