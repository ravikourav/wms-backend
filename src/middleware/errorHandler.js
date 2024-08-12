import { statusCodes } from "../constants.js";

const errorHandler = (err , req , res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.json({ title: statusCodes[statusCode] , message: err.message, stactTrace : err.stack })
}

export default errorHandler;