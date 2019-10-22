import {Logger} from "../commons/Logger";

export class ControllerArticle {
    constructor(storeArticle) {
        this.storeArticle = storeArticle;
        this.LOGGER_NAME = 'ControllerArticle';
    }

    async getArticles(request, response)  {
        try {
            const filter = request.query.filter ;
            const result = await this.storeArticle.getArticles( (filter==null? '' : filter)  );
            Logger.traceMessage(this.LOGGER_NAME, 'getArticles', 'count articles ' + result.length );
            response.json(result);
            Logger.traceMessage(this.LOGGER_NAME, 'getArticles', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'getArticles', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async getArticlesLatest(request, response)  {
        try {
            response.json(await this.storeArticle.getArticlesOrderByLimited('releaseDate', 'asc', request.query.limit));
            Logger.traceMessage(this.LOGGER_NAME, 'getArticlesNewest', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'getArticlesNewest', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async getArticle(request, response)  {
        try {
            response.json(await this.storeArticle.getArticle(null, request.query.article));
            Logger.traceMessage(this.LOGGER_NAME, 'getArticle', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'getArticle', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async changeArticleRating(request, response)  {
        try {
            let article = await this.storeArticle.getArticle(request.body.articleID,null);
            // noinspection JSUnresolvedVariable
            if(request.body.rateUp) {// find the lowest
                for (let i = 0; i < article.rating.length; i++ ) {
                    if(!article.rating[i])  {
                        article.rating[i] = true;
                        await this.storeArticle.update(article);
                        break;
                    }
                }
            }else   {
                for (let i = article.rating.length; i >= 0; i-- ) {
                    if(article.rating[i])  {
                        article.rating[i] = false;
                        await this.storeArticle.update(article);
                        break;
                    }
                }
            }
            response.json(article);
            Logger.traceMessage(this.LOGGER_NAME, 'changeArticleRating', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'changeArticleRating', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }


}