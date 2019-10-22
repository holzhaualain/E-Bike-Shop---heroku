import {DatabaseManager_NEDB} from "../../commons/DatabaseManager_NEDB";

export class StoreArticle {
    constructor() {
        this.dbManager_Article = new DatabaseManager_NEDB("data/article.db");
    }

    async getArticle(articleId, articleQueryParameter) {
        const articleArr = await this.dbManager_Article.find((articleId? {"_id": articleId} : {"articleQueryParameter": articleQueryParameter}));
        return (articleArr.length === 0 ? null : articleArr[0]);
    }

    async getArticles(filterName) {
        if (filterName !== '') {
            return await this.dbManager_Article.find({"searchTags": new RegExp(filterName.toLowerCase())});
        }
        return await this.dbManager_Article.find({});
    }

    async getArticlesOrderByLimited(sort, ascDesc, limit) {
        const ascDesc_DB = (ascDesc.toLowerCase() === 'asc' ? this.dbManager_Article.DESCENDING : this.dbManager_Article.ASCENDING);
        return await this.dbManager_Article.find({}, {"releaseDate": ascDesc_DB}, limit);
    }


    async update(article) {
        await this.dbManager_Article.update(article._id, article);
    }

}