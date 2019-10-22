import {Logger} from "../../commons/Logger";
import {DatabaseManager_NEDB} from "../../commons/DatabaseManager_NEDB";
import {ShoppingBasket} from "./ShoppingBasket";


export class StoreShoppingBasket {
    constructor() {
        this.dbManager_ShoppingBasket = new DatabaseManager_NEDB("data/shoppingbasket.db");
        this.LOGGER_NAME = 'StoreShoppingBasket';
    }

    async create() {
        const shoppingBasket = await this.dbManager_ShoppingBasket.insert(new ShoppingBasket());
        Logger.traceMessage(this.LOGGER_NAME, 'create', 'ok');
        return shoppingBasket;
    }

    async get(shoppingBasketID) {
        const basketArr = await this.dbManager_ShoppingBasket.find({"_id": shoppingBasketID});
        Logger.traceMessage(this.LOGGER_NAME, 'get', 'ok');
        return (basketArr.length === 0 ? null : basketArr[0]);
    }

    async update(shoppingBasket) {
        await this.dbManager_ShoppingBasket.update(shoppingBasket._id, shoppingBasket);
        Logger.traceMessage(this.LOGGER_NAME, 'update', 'ok');
    }






}