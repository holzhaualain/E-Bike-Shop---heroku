import {Logger} from "../../commons/Logger";
import {DatabaseManager_NEDB} from "../../commons/DatabaseManager_NEDB";
import {Order} from "./Order";


export class StoreOrder {
    constructor() {
        this.dbManager_Order = new DatabaseManager_NEDB("data/order.db");
        this.LOGGER_NAME = 'StoreOrder';
    }

    async create(shoppingBasket) {
        const order = await this.dbManager_Order.insert(new Order(shoppingBasket));
        Logger.traceMessage(this.LOGGER_NAME, 'create', 'order created');
        return order;
    }

    async get(id) {
        const orderArr = await this.dbManager_Order.find({"_id": id});
        return (orderArr.length === 0 ? null : orderArr[0]);
    }

    async getLatestFromUser(userId) {
        const orderArr = await this.dbManager_Order.find({"userID": userId}, {"orderDate": this.dbManager_Order.DESCENDING}, 1);
        return (orderArr.length === 0 ? null : orderArr[0]);
    }


    async getOrders(filter, sort, limit) {
        return await this.dbManager_Order.find(filter, {"orderDate": this.dbManager_Order.DESCENDING}, limit);
    }

    async getOrdersByUser(userId) {
        return await this.dbManager_Order.find({"userID": userId}, {"orderDate": this.dbManager_Order.DESCENDING});
    }

    async update(order) {
        await this.dbManager_Order.update(order._id, order);
        Logger.traceMessage(this.LOGGER_NAME, 'update', 'ok');
    }

    async delete(order) {
        await this.dbManager_Order.remove(order._id);
        Logger.traceMessage(this.LOGGER_NAME, 'remove', 'ok');
    }


}