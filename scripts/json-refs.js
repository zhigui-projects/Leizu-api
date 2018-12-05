/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

const JsonRefs = require('json-refs');
const YAML = require('js-yaml');
const fs = require('fs');

const parseDoc = async () => {
    const options = {
        loaderOptions: {
            processContent: (res, callback) => {
                callback(undefined, YAML.safeLoad(res.text));
            }
        }
    };
    const location = 'docs/api/index.yml';
    await JsonRefs.resolveRefsAt(location, options).then((results) => {
        const dir = 'dist';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(`${dir}/swagger.yml`, YAML.safeDump(results.resolved, {noRefs: true}));
    }).catch((err) => {
        console.error('parse api yaml failed with error: ', err);
    });
};

parseDoc();
