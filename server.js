
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import {Logger} from './commons/Logger';
import {RouterWebShop} from './router/RouterWebShop';
import {RouterWebShopFrontend} from './router/RouterWebShopFrontend';

class WebShopBackend {
    constructor() {
        this.app = express();
        this.routerWebShop = new RouterWebShop();
        this.routerWebShopFrontend = new RouterWebShopFrontend();
        this.LOGGER_NAME = 'WebShopBackend';

        this.app.use((request, response, next) => {
            if (request.path.startsWith('/backend')) {
                response.setHeader('Access-Control-Allow-Origin', '*');                     //enable CORS
                response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
                response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
                response.setHeader('Access-Control-Allow-Credentials', true);
                response.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
            next();
        });

        //Authentication
        this.app.use(async (request, response, next) => {
            if(WebShopBackend.isBackendCall(request)) {
                request.authenticated = await this.routerWebShop.getControllerUser().isTokenValid(request);
            }
            next();
        });

        //Trace URL Backend only
        this.app.use(async (request, response, next) => {
            if(WebShopBackend.isBackendCall(request)) {
                Logger.traceMessage('WebShopBackend', 'traceURL_Backend', request.url + '     (' + request.method + ')');
            }
            next();
        });

        this.app.use(express.static(path.resolve('public')));                   // images, frontend
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(bodyParser.json());
        this.app.use(express.static(__dirname + '/backend'), this.routerWebShop.getRouter());               // backend      -> http://localhost:3000/webshop
        this.app.use(express.static(__dirname + '/'), this.routerWebShopFrontend.getRouter());      // frontend     -> http://localhost:3000/frontend
        this.app.listen(process.env.PORT ||8080);

        Logger.traceMessage(this.LOGGER_NAME, 'constructor', 'Backend  WebShop : http://localhost:3000/backend');
        Logger.traceMessage(this.LOGGER_NAME, 'constructor', 'Frontend WebShop : http://localhost:3000/frontend');
    }

    static isBackendCall(request) {
        Logger.traceMessage('WebShopBackend', 'isBackendCall', request.path);
        return request.path.startsWith('/backend') && request.method !== 'OPTIONS';
    }

}

//new StoreUser().hashExistingPWDs().then();
new WebShopBackend();
