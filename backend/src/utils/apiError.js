export default class apiError extends Error {
    constructor(res, statusCode = 500, message = "Something went wrong.") {
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.success = false

         if (process.env.NODE_ENV === 'development') {
            this.stack = Error.captureStackTrace(this, this.constructor);
        }

        if(res) {
            return res?.status(statusCode)?.json({statusCode, message, success :this.success})
        } 
    }
}