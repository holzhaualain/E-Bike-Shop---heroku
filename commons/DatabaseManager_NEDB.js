import Datastore from 'nedb-promise'
import {Logger} from "./Logger";

export class DatabaseManager_NEDB {
    constructor(filename) {
        this.db = new Datastore({filename: filename, autoload: true});
        this.DESCENDING = -1;
        this.ASCENDING = 1;
        this.LOGGER_NAME = 'DatabaseManager_NEDB';
        Logger.traceMessage(this.LOGGER_NAME, 'constructor', 'Database "' + filename.replace('.db', '') + '" ready')
    }

    async insert(row) {
        return await this.db.insert(row);
    }

    async update(id, set) {
        await this.db.update({_id: id}, {$set: set});
    }

    async find(filter, sort, limit) {
        if (sort !== null && limit !== null) {
            return await this.db.cfind(filter).sort(sort).limit(limit).exec();
        }
        else if (sort !== null) {
            return await this.db.cfind(filter).sort(sort).exec();
        }
        return await this.db.cfind(filter).exec();
    }

    async deleteAll() {
        return await this.db.remove({}, {multi: true});
    }

    async remove(id) {
        return await this.db.remove({"_id":id},{});
    }

    // noinspection JSUnusedGlobalSymbols
    async logAllItems() {
        const all = await this.find();
        for (let i = 0; i < all.length; i++) {
            Logger.traceMessage(this.LOGGER_NAME, 'logAllItems', JSON.stringify(all[i]));
        }
    }


}