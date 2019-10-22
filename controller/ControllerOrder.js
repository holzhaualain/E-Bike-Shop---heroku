import {Logger} from '../commons/Logger';
import {StoreOrder} from "../service/order/StoreOrder";

export class ControllerOrder {
    constructor(storeShoppingBasket, storeSession, storeUser) {
        this.storeShoppingBasket = storeShoppingBasket;
        this.storeSession = storeSession;
        this.storeOrder = new StoreOrder();
        this.storeUser = storeUser;
        this.LOGGER_NAME = 'ControllerOrder';
    }

    async create(request, response) {
        try {
            const shoppingBasket = await this.storeShoppingBasket.get(request.body.shoppingBasketId);
            let ok = !!shoppingBasket; // like (shoppingBasket ? true : false)
            let session, user;

            if (ok) {
                session = await this.storeSession.getSessionByToken(request.headers.authorization);
                ok = !!session;
            }
            if (ok) {
                user = await this.storeUser.getUser(session.userID);
                ok = !!user;
            }
            if (ok) {
                let order = await this.storeOrder.create(shoppingBasket);
                const orderLatest = await this.storeOrder.getLatestFromUser(session.userID);
                if (orderLatest != null) {
                    order.deliveryAddress = orderLatest.deliveryAddress;
                    order.contactData = orderLatest.contactData;
                    order.deliveryType = orderLatest.deliveryType;
                    order.paymentType = orderLatest.paymentType;
                    order.state = 'NEW COPY OF';

                }
                order.deliveryAddress.surname = user.firstname; // set data from user
                order.deliveryAddress.givenname = user.name; // set data from user
                order.contactData.email = user.email; // set data from user
                await this.storeOrder.update(order);
                response.json(order);
                Logger.traceMessage(this.LOGGER_NAME, 'create', 'ok');
            }
            else {
                Logger.traceError(this.LOGGER_NAME, 'create', 'shoppingBasket / user not found');
                response.status(404).send('shoppingBasket not found');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'create', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async get(request, response) {
        try {
            response.json(await this.storeOrder.get(request.query.id));
            Logger.traceMessage(this.LOGGER_NAME, 'get', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'get', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async getOrdersByUser(request, response) {
        try {
            response.json(await this.storeOrder.getOrdersByUser(request.query.userId));
            Logger.traceMessage(this.LOGGER_NAME, 'getOrdersByUser', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'getOrdersByUser', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }


    async updateOrder(request, response) {
        try {
            response.json(await this.storeOrder.update(request.body));
            Logger.traceMessage(this.LOGGER_NAME, 'updateOrder', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'updateOrder', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async deleteOrder(request, response) {
        try {
            response.json(await this.storeOrder.delete(request.body));
            Logger.traceMessage(this.LOGGER_NAME, 'updateOrder', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'updateOrder', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async getOrders(request, response) {
        try {
            const session = await this.storeSession.getSessionByToken(request.headers.authorization);
            const user = await this.storeUser.getUser(session.userID);

            if(user.type === 'admin')    {
                response.json(await this.storeOrder.getOrders('', 'orderDate', ''));
                Logger.traceMessage(this.LOGGER_NAME, 'getOrders', 'ok');
            }
            else    {
                Logger.traceError(this.LOGGER_NAME, 'getOrders', 'user has not role "admin"');
                response.status(404).send('user has not role "admin"');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'getOrders', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async change(request, response) {
        try {
            let order = await this.storeOrder.get(request.body._id);
            let ok = order != null;
            if (ok) {
                if (request.url.endsWith('delivery-address')) {
                    order.deliveryAddress = request.body.deliveryAddress;
                    order.state = 'CHANGE DELIVERY ADDRESS';
                    await this.storeOrder.update(order);
                    response.json(order);
                    Logger.traceMessage(this.LOGGER_NAME, 'change deliveryAddress', 'ok');
                } else if (request.url.endsWith('contact-data')) {
                    order.contactData = request.body.contactData;
                    order.state = 'CHANGE CONTACT DATA';
                    await this.storeOrder.update(order);
                    response.json(order);
                    Logger.traceMessage(this.LOGGER_NAME, 'change contactData', 'ok');
                }
                else if (request.url.endsWith('delivery-type')) {
                    order.deliveryType = request.body.deliveryType;
                    order.state = 'CHANGE DELIVERY TYPE';
                    await this.storeOrder.update(order);
                    response.json(order);
                    Logger.traceMessage(this.LOGGER_NAME, 'change deliveryType', 'ok');
                }
                else if (request.url.endsWith('payment-type')) {
                    order.paymentType = request.body.paymentType;
                    order.state = 'CHANGE PAYMENT TYPE';
                    await this.storeOrder.update(order);
                    response.json(order);
                    Logger.traceMessage(this.LOGGER_NAME, 'change paymentType', 'ok');
                }
                else {
                    ok = false;
                }
            }

            if (!ok) {
                Logger.traceError(this.LOGGER_NAME, 'change', 'order not found / URL not found');
                response.status(404).send('order not found');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'change', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async changeState(request, response) {
        try {
            let order = await this.storeOrder.get(request.body.orderId);
            const session = await this.storeSession.getSessionByToken(request.headers.authorization);
            let ok = order !== null && session !== null;
            if (ok) {
                order.userID = session.userID;
                order.state = request.body.state;
            }
            if (order.state === 'APPROVED') {
                const shoppingBasket = await this.storeShoppingBasket.get(order.shoppingBasket._id);
                ok = shoppingBasket !== null;
                if (ok) {
                    order.shoppingBasket = shoppingBasket;
                    Logger.traceMessage(this.LOGGER_NAME, 'changeState', 'APPROVED, shoppingBasket synced');
                }
            }
            if (ok) {
                await this.storeOrder.update(order);
                response.json(order);
                Logger.traceMessage(this.LOGGER_NAME, 'changeState', 'ok');
            }
            else {
                Logger.traceError(this.LOGGER_NAME, 'changeState', 'order / user / shoppingBasket not found');
                response.status(404).send('order not found');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'changeState', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

}