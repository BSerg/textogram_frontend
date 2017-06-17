import * as path from 'path';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import {baseRoutes} from './routes/BaseRouter';
import {articleRoutes} from './routes/ArticleRouter';

import {apiRoutes} from './routes/ApiRouter';


class AppClass {
    public express: express.Application;

    corsOptions: any = {
        origin: '*'
    };

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }

    private middleware() {
        this.express.use(bodyParser.json());
        this.express.use(cors(this.corsOptions));
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    routes() {
        this.express.set('view engine', 'ejs');
        if (process.env.NODE_ENV != 'production') {
            this.express.use('/static', express.static(process.env.STATIC_ROOT));
            this.express.use('/data', express.static(process.env.MEDIA_ROOT));
        }
        this.express.set('views', process.env.VIEWS_DIR);
        this.express.use('/articles', articleRoutes);
        this.express.use('/api/v1', apiRoutes);
        this.express.use('/', baseRoutes);
    }
}

// let app = new App().express;

export default new AppClass().express;
