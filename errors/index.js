const BadRequestError = require("./badRequest");
const CustomAPIError = require("./custom-api");
const NotFoundError = require("./not-found");
const UnauthenticatedError = require("./unauthenticated");

module.exports={
    BadRequestError,
    UnauthenticatedError,
    CustomAPIError,
    NotFoundError
}