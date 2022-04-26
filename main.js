// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins

const jsonObjToBuffer = obj => Buffer.from(JSON.stringify(obj), 'utf-8');

const fs = require('fs');
var vt2geojson = require('@mapbox/vt2geojson');


module.exports.responseHooks = [
    async ctx => {
        try {
            const body = ctx.response.getBody();
            const filename = '/tmp/vt2geojson.mvt';
            fs.writeFileSync(filename, body);

            const url = ctx.request.getUrl();
            const [, , z, x, y] = Array.from(url.matchAll(/places\/tile\/([a-z]+)\/(\d+)\/(\d+)\/(\d+)\.pbf$/g))[0];

            const resp = await new Promise(function (resolve, reject) {
                vt2geojson({
                    uri: filename,
                    x, y, z
                }, function (err, result) {
                    if (err) reject(err);
                    resolve(result); // => GeoJSON FeatureCollection
                });

            });
            ctx.response.setBody(jsonObjToBuffer(resp));
        } catch (error) {
            console.log('error: ', error);
            // no-op
        }
    }
];
