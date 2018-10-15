const JsonRefs = require('json-refs');
const YAML = require('js-yaml');
const fs = require('fs');

const parseDoc = async () => {
    const options = {
        loaderOptions: {
            processContent: function (res, callback) {
                callback(undefined, YAML.safeLoad(res.text));
            }
        }
    };
    const location = "docs/api/index.yml";
    await JsonRefs.resolveRefsAt(location, options).then((results) => {
        const res = YAML.safeDump(results.resolved, {noRefs: true});
        fs.writeFileSync('dist/swagger.yml', res);
    }).catch((err) => {
        console.error('parse api yaml failed with error: ', err);
    });
};

parseDoc();
