const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'debug';
module.exports = logger;

module.exports.getLogger = (name) => {
    const logger = log4js.getLogger(name);
    logger.level = 'debug';
    return logger;
};