import {DatabaseManager_NEDB} from "../../commons/DatabaseManager_NEDB";
import {Logger} from "../../commons/Logger";
import {CryptoManager} from "../../commons/CryptoManager";


export class StoreUser {
    constructor() {
        this.LOGGER_NAME = 'StoreUser';
        this.dbManager_User = new DatabaseManager_NEDB("data/user.db");
    }

    async getUser(userId) {
        const userArr = await this.dbManager_User.find({"_id": userId});
        return (userArr.length === 0 ? null : userArr[0]);
    }

    async getUser_ByMail(email) {
        const userArr = await this.dbManager_User.find({"email": email});
        return (userArr.length === 0 ? null : userArr[0]);
    }


    async getUser_ByMailPwd(email, pwd) {
        const userArr = await this.dbManager_User.find({"email": email});
        for (let i = 0; i < userArr.length; i++) {
            const user = userArr[i];
            const hasSamePwd = await CryptoManager.compare(pwd, user.pwd);
            if(hasSamePwd)    {
                user.pwd = 'XXX';
                return user;
            }
        }
        return null; // nothing found
    }

    async getUsers() {
        return await this.dbManager_User.find(/* {"name": ""} */);
    }

    async update(user) {
        return await this.dbManager_User.update(user._id, user);
    }

    async delete(user) {
        return await this.dbManager_User.remove(user._id, user);
    }

    async create(user) {
        delete user['_id'];
        return await this.dbManager_User.insert(user);
    }

    // noinspection JSUnusedGlobalSymbols
    async hashExistingPWDs() {
        const userArr = await this.dbManager_User.find();
        for (let i = 0; i < userArr.length; i++) {
            let user = userArr[i];
            let pwd = user.pwd;
            user.pwd = await CryptoManager.createHash(pwd);
            await this.update(user);
            Logger.traceMessage(this.LOGGER_NAME, 'hashExistingPWDs', 'next pwd encrypted & stored into database');
        }
        Logger.traceMessage(this.LOGGER_NAME, 'hashExistingPWDs', 'start');
    }

}