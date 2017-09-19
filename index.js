'use latest';

import { promisifyAll } from 'bluebird';
import * as request from 'request';

const Request = promisifyAll(request);

const urls = {
    api: 'https://api.github.com',
    web: 'https://github.com'
};

module.exports = (context, callback) => {

};
