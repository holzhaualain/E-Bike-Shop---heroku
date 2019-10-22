import dateformat from 'dateformat';

export class Logger {
    static buildMessage(className, functionName, message) {
        let str = className + '.' + functionName + '()' ;
        while (str.length < 50) {
            str += " ";
        }
        return dateformat(new Date(), "yyyy.mm.dd h:MM:ss ") + str + message;
    }

    static traceMessage(className, functionName, message) {
        console.log( Logger.buildMessage(className, functionName, message)  );
    }

    static traceError(className, functionName, message) {
        console.error( Logger.buildMessage(className, functionName, message)  );
    }


}
