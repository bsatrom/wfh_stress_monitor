const fetch = require("node-fetch");
const url = process.env["NOTEHUB_URL"];
const accessToken = process.env["NOTEHUB_KEY"];

module.exports = async function (context, req) {
    const headers = {
        'X-SESSION-TOKEN': `${accessToken}`
    };

    if (req.body) {
        await fetch(url, {
            method: 'put',
            body:    JSON.stringify(req.body),
            headers
        })
        .then(response => context.res = {
            body: response.json()
        });
    } else {
        context.res = {
            status: 400,
            body: "Please provide a request body"
        };
    }
}