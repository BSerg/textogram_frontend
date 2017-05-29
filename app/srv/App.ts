import * as path from 'path';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import {baseRoutes} from './routes/BaseRouter';


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
        this.express.use('/', baseRoutes);
    }
}

// let app = new App().express;

export default new AppClass().express;
