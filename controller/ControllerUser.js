import {Logger} from '../commons/Logger';
import {CryptoManager} from "../commons/CryptoManager";

export class ControllerUser {
    constructor(storeUser, storeSession) {
        this.HOUR = 1000 * 60 * 60;//ms
        this.LOGGER_NAME = 'ControllerUser';
        this.storeSession = storeSession;
        this.storeUser = storeUser;
    }

   async signIn(request, response) {
        try {
            const user = await this.storeUser.getUser_ByMailPwd(request.body.email, request.body.pwd);
            if (user != null) {
                const session = await this.storeSession.getSessionByUser(user._id);
                if (session == null) {
                    user.token = await this.storeSession.createSession(user._id);
                    Logger.traceMessage(this.LOGGER_NAME, 'signIn', 'user "' + request.body.email + '" -> no session found, new one created');
                } else if (new Date().getTime() > (session.tokenDate.getTime() + this.HOUR)) {
                    user.token = await this.storeSession.renewSession(session._id);
                    Logger.traceMessage(this.LOGGER_NAME, 'signIn', 'user "' + request.body.email + '" -> session expired, token renewed');
                } else {
                    user.token = session.token;
                }
                Logger.traceMessage(this.LOGGER_NAME, 'signIn', 'user "' + request.body.email + '" ok');
                response.json(user);
            }
            else {
                Logger.traceError(this.LOGGER_NAME, 'signIn', 'user"' + request.body.email + '" failed, user or pwd nok');
                response.status(404).send('user or pwd nok');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'signIn', 'user"' + request.body.email + '" failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async create(request, response) {
        try {
            let user = await this.storeUser.getUser_ByMail(request.body.email);
            if(!user)    {
                user = request.body;
                user.type = 'customer';
                user.pwd = await CryptoManager.createHash(user.pwd);
                user = await this.storeUser.create(user);
                user.token = await this.storeSession.createSession(user._id);
                Logger.traceMessage(this.LOGGER_NAME, 'create', 'ok');
                response.json(user);
            }
            else   {
                Logger.traceError(this.LOGGER_NAME, 'create', 'user already exists');
                response.status(400).send('user already exists');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'create', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async updateUser(request, response) {
        try {
            let user = request.body;
            if(request.body.pwd)    {
                user.pwd = await CryptoManager.createHash(user.pwd);
            }   else {
                delete user['pwd'];//do not change existing pwd
            }
            response.json(await this.storeUser.update(user));
            Logger.traceMessage(this.LOGGER_NAME, 'updateUser', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'updateUser', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async deleteUser(request, response) {
        try {
            response.json(await this.storeUser.delete(request.body));
            Logger.traceMessage(this.LOGGER_NAME, 'deleteUser', 'ok');
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'deleteUser', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async signOut(request, response) {
        const token = request.headers.authorization;
        try {
            const session = await this.storeSession.getSessionByUser(request.body.userId);
            if (session == null) {
                Logger.traceMessage(this.LOGGER_NAME, 'signOut', 'no session found for token "' + token + '" ok');
                response.status(404).send('no session found');
            } else {
                await this.storeSession.updateSessionTokenDate(session._id, new Date(Date.now() - this.HOUR));
                Logger.traceMessage(this.LOGGER_NAME, 'signOut', 'ok');
                response.json({status: 'ok'});
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'signOut', 'token"' + token + '" failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async isTokenValid(request) {
        const token = request.headers.authorization;
        if (token == null) {
            return false;
        }else if (token === '') {
            return false;
        }

        const tokenDate = await this.storeSession.getSessionTokenDate(token);
        if (tokenDate == null) {
            Logger.traceMessage(this.LOGGER_NAME, 'isTokenValid', 'unknown token ' + token);
            return false;
        }

        const hasNotExpired = Date.now() < (tokenDate.getTime() + this.HOUR);
        if (!hasNotExpired) {
            Logger.traceMessage(this.LOGGER_NAME, 'isTokenValid', 'session not valid, token has expired');
        }
        return hasNotExpired;
    }

    async getUser(request, response)  {
        try {
            let user = await this.storeUser.getUser(request.query.id);
            const session = await this.storeSession.getSessionByUser(user._id);
            if(user && session) {
                user.token = session.token;
                Logger.traceMessage(this.LOGGER_NAME, 'getUser', 'ok');
                response.json(user);
            }else if(user){
                user.token = await this.storeSession.createSession(user._id);
                Logger.traceMessage(this.LOGGER_NAME, 'getUser', 'no session found, new created');
                response.json(user);
            }else{
                Logger.traceError(this.LOGGER_NAME, 'getUser', 'user not found ' + request.query.id);
                response.status(404).send('user not found');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'getUser', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }

    async getUsers(request, response)  {
        try {
            const session = await this.storeSession.getSessionByToken(request.headers.authorization);
            const user = await this.storeUser.getUser(session.userID);
            if(user.type === 'admin')    {
                response.json(await this.storeUser.getUsers());
                Logger.traceMessage(this.LOGGER_NAME, 'getUsers', 'ok');
            }
            else    {
                Logger.traceError(this.LOGGER_NAME, 'getUsers', 'user has not role "admin"');
                response.status(404).send('user has not role "admin"');
            }
        } catch (e) {
            Logger.traceError(this.LOGGER_NAME, 'getUsers', 'failed -> ' + e);
            response.status(500).send('server error, contact support');
        }
    }




}
