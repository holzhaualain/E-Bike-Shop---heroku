import {Logger} from "../commons/Logger";
import {ShoppingBasketItem} from "../service/shopping-basket/ShoppingBasketItem";

export class ControllerShoppingBasket {
    constructor(storeShoppingBasket, storeArticle) {
        this.storeShoppingBasket = storeShoppingBasket;
        this.storeArticle = storeArticle;
        this.LOGGER_NAME = 'ControllerShoppingBasket';
    }

    async create(request, response) {
        try {
            response.json(await this.storeShoppingBasket.create());
            Logger.traceMessage(this.LOGGER_NAME, 'create', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'create', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async get(request, response) {
        try {
            const shoppingBasket = await this.storeShoppingBasket.get(request.query.id);
            if (shoppingBasket === null) {
                Logger.traceError(this.LOGGER_NAME, 'get', 'shoppingBasketID"' + request.query.id + '" failed, no basket found ->');
                response.json(await this.storeShoppingBasket.create());
                // response.status(404).send('ShoppingBasket not found');
            } else {
                response.json(shoppingBasket);
                Logger.traceMessage(this.LOGGER_NAME, 'get', 'ok');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'get', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    static calculateTotalSum(shoppingBasket) {
        shoppingBasket.totalSum = 0;
        for (let i = 0; i < shoppingBasket.items.length; i++) {
            shoppingBasket.totalSum += shoppingBasket.items[i].articlePriceSum;
        }
    }

    async addItem(request, response) {
        try {
            let shoppingBasket = await this.storeShoppingBasket.get(request.body.shoppingBasketID);
            let articleAlreadyExists = false;
            if (shoppingBasket != null) {
                for (let i = 0; i < shoppingBasket.items.length; i++) {
                    if (shoppingBasket.items[i].articleID === request.body.articleID) {
                        articleAlreadyExists = true;
                        Logger.traceMessage(this.LOGGER_NAME, 'addItem', 'article already exists, will change amount');
                        await this.changeItemAmount(request, response);
                        break;
                    }
                }

                if (!articleAlreadyExists) {
                    const article = await this.storeArticle.getArticle(request.body.articleID, null);
                    // noinspection JSUnresolvedVariable
                    const shoppingBasketItem = new ShoppingBasketItem(article._id, article.name, article.brand, article.price, article.imageURL, article.availability, request.body.articleAmount, article.itemNumber, article.articleQueryParameter);
                    shoppingBasket.items.push(shoppingBasketItem);
                    ControllerShoppingBasket.calculateTotalSum(shoppingBasket);
                    await this.storeShoppingBasket.update(shoppingBasket);
                    Logger.traceMessage(this.LOGGER_NAME, 'addItem', 'ok');
                    response.json(shoppingBasket);
                }
            }
            else {
                Logger.traceError(this.LOGGER_NAME, 'addItem', 'shoppingBasketID"' + request.body.shoppingBasketID + '" failed. no basket found ->');
                response.status(404).send('ShoppingBasket not found');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'addItem', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async changeItemAmount(request, response) {
        try {
            let shoppingBasket = await this.storeShoppingBasket.get(request.body.shoppingBasketID);
            for (let i = 0; i < shoppingBasket.items.length; i++) {
                if (shoppingBasket.items[i].articleID === request.body.articleID) {
                    shoppingBasket.items[i].articleAmount = request.body.articleAmount;
                    shoppingBasket.items[i].articlePriceSum = shoppingBasket.items[i].articleAmount * shoppingBasket.items[i].articlePrice;
                    ControllerShoppingBasket.calculateTotalSum(shoppingBasket);
                    await this.storeShoppingBasket.update(shoppingBasket);
                    break;
                }
            }
            response.json(shoppingBasket);
            Logger.traceMessage(this.LOGGER_NAME, 'changeItemAmount', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'changeItemAmount', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async removeItem(request, response) {
        try {
            let shoppingBasket = await this.storeShoppingBasket.get(request.body.shoppingBasketID);
            if (shoppingBasket != null) {
                shoppingBasket.items = shoppingBasket.items.filter((item) => {
                    return (item.articleID !== request.body.articleID);
                });
                ControllerShoppingBasket.calculateTotalSum(shoppingBasket);
                await this.storeShoppingBasket.update(shoppingBasket);
                response.json(shoppingBasket);
                Logger.traceMessage(this.LOGGER_NAME, 'removeItem', 'ok');
            }
            else {
                Logger.traceError(this.LOGGER_NAME, 'removeItem', 'shoppingBasketID"' + request.body.shoppingBasketID + '" failed. no basket found ->');
                response.status(404).send('ShoppingBasket not found');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'removeItem', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }


}