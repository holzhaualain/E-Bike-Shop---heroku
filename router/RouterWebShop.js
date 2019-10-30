import express from 'express';
import authentication from 'express-authentication';
import {ControllerUser} from '../controller/ControllerUser';
import {ControllerArticle} from '../controller/ControllerArticle';
import {ControllerShoppingBasket} from "../controller/ControllerShoppingBasket";
import {ControllerOrder} from "../controller/ControllerOrder";
import {StoreUser} from "../service/user/StoreUser";
import {StoreSession} from "../service/user/StoreSession";
import {StoreShoppingBasket} from "../service/shopping-basket/StoreShoppingBasket";
import {StoreArticle} from "../service/article/StoreArticle";

export class RouterWebShop {
    constructor() {
        const storeUser = new StoreUser();
        const storeSession = new StoreSession();
        const storeShoppingBasket = new StoreShoppingBasket();
        const storeArticle = new StoreArticle();

        this.router = express.Router(null);
        this.controllerUser = new ControllerUser(storeUser, storeSession);
        this.controllerArticle = new ControllerArticle(storeArticle);
        this.controllerShoppingBasket = new ControllerShoppingBasket(storeShoppingBasket, storeArticle);
        this.controllerOrder = new ControllerOrder(storeShoppingBasket, storeSession, storeUser);

        // GET
        this.router.get('/backend/article', async (request, response) => {
            await this.controllerArticle.getArticle(request, response);
        });
        this.router.get('/backend/articles', async (request, response) => {
            await this.controllerArticle.getArticles(request, response);
        });
        this.router.get('/backend/articles/latest', async (request, response) => {
            await this.controllerArticle.getArticlesLatest(request, response);
        });
        this.router.get('/backend/user', async (request, response) => {
            await this.controllerUser.getUser(request, response);
        });
        this.router.get('/backend/users', authentication.required(), async (request, response) => {
            await this.controllerUser.getUsers(request, response);
        });
        this.router.get('/backend/shopping-basket', async (request, response) => {
            await this.controllerShoppingBasket.get(request, response);
        });
        this.router.get('/backend/order', authentication.required(), async (request, response) => {
            await this.controllerOrder.get(request, response);
        });
        this.router.get('/backend/orders', authentication.required(), async (request, response) => {
            await this.controllerOrder.getOrders(request, response);
        });
        this.router.get('/backend/orders/user', async (request, response) => {
            await this.controllerOrder.getOrdersByUser(request, response);
        });

        // POST
        this.router.post('/backend/sign-in/user', async (request, response) => {
            await this.controllerUser.signIn(request, response);
        });
        this.router.post('/backend/sign-out/user', async (request, response) => {
            await this.controllerUser.signOut(request, response);
        });
        this.router.post('/backend/create/user', async (request, response) => {
            await this.controllerUser.create(request, response);
        });
        this.router.post('/backend/create/shopping-basket', async (request, response) => {
            await this.controllerShoppingBasket.create(request, response);
        });
        this.router.post('/backend/create/order', authentication.required(), async (request, response) => {
            await this.controllerOrder.create(request, response);
        });
        this.router.post('/backend/delete/user', async (request, response) => {
            await this.controllerUser.deleteUser(request, response);
        });
        this.router.patch('/backend/delete/order', async (request, response) => {
            await this.controllerOrder.deleteOrder(request, response);
        });
        this.router.post('/backend/add-item/shopping-basket', async (request, response) => {
            await this.controllerShoppingBasket.addItem(request, response);
        });
        this.router.post('/backend/remove-item/shopping-basket', async (request, response) => {
            await this.controllerShoppingBasket.removeItem(request, response);
        });

        // PUT
        this.router.put('/backend/update/user', async (request, response) => {
            await this.controllerUser.updateUser(request, response);
        });
        this.router.put('/backend/update/order', async (request, response) => {
            await this.controllerOrder.updateOrder(request, response);
        });
        this.router.put('/backend/update/order/delivery-address', authentication.required(), async (request, response) => {
            await this.controllerOrder.change(request, response);
        });
        this.router.put('/backend/update/order/contact-data', authentication.required(), async (request, response) => {
            await this.controllerOrder.change(request, response);
        });
        this.router.put('/backend/update/order/delivery-type', authentication.required(), async (request, response) => {
            await this.controllerOrder.change(request, response);
        });
        this.router.put('/backend/update/order/payment-type', authentication.required(), async (request, response) => {
            await this.controllerOrder.change(request, response);
        });

        // PATCH
        this.router.patch('/backend/update/order/state', authentication.required(), authentication.required(), async (request, response) => {
            await this.controllerOrder.changeState(request, response);
        });
        this.router.patch('/backend/change-rating/article', async (request, response) => {
            await this.controllerArticle.changeArticleRating(request, response);
        });
        this.router.patch('/backend/change-item-amount/shopping-basket', async (request, response) => {
            await this.controllerShoppingBasket.changeItemAmount(request, response);
        });
    }

    getRouter() {
        return this.router;
    }

    getControllerUser() {
        return this.controllerUser;
    }

}
