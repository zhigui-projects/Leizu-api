const ExtendableError = require('es6-error');

exports.BadRequest = class BadRequest extends ExtendableError {
    constructor(validationErrors) {
        super('Bad Request');

        const includedKeys = [];
        const formattedErrors = [];

        validationErrors.forEach((validationError) => {
            const error = {
                field: Object.keys(validationError)[0],
                message: validationError[Object.keys(validationError)[0]],
            };

            if (!includedKeys.includes(error.field)) {
                formattedErrors.push(error);
            }

            includedKeys.push(error.field);
        });
        this.body = {
            errors: formattedErrors,
        };
        this.status = 400;
    }
};

exports.Unauthorized = class Unauthorized extends ExtendableError {
    constructor(message) {
        super(message);
        this.body = {
            errors: [{
                message,
            }],
        };
        this.status = 401;
    }
};

exports.Forbidden = class Unauthorized extends ExtendableError {
    constructor(message) {
        super(message);
        this.body = {
            errors: [{
                message,
            }],
        };
        this.status = 403;
    }
};

exports.ModelError = class ModelError extends ExtendableError {
    constructor(message) {
        super('Internal Server Error');
        this.body = {
            errors: [{
                message,
                stack: this.stack,
            }],
        };
        this.status = 500;
    }
};
