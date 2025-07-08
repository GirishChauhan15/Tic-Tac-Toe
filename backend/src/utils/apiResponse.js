export default class apiResponse {
    constructor(statusCode = 200, data = {}, message ="Success") {
        this.message = message
        this.statusCode = statusCode
        this.data = data
        this.success = true
    }
}