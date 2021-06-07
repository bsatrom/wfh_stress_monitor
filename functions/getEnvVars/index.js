const fetch = require("node-fetch");
const url = process.env["NOTEHUB_URL"];
const accessToken = process.env["NOTEHUB_KEY"];

module.exports = async function (context, req) {
    const headers = {
        'X-SESSION-TOKEN': `${accessToken}`
    };

    await fetch(url, { headers })
        .then(response => response.json())
        .then(response => {
            env_vars = {};
            if (Object.keys(response.environment_variables).length > 0) {
                for (const [key, value] of Object.entries(response.environment_variables)) {
                    env_vars[key] = value;
                }
            } else if (Object.keys(response.environment_variables_env_default).length > 0) {
                for (const [key, value] of Object.entries(response.environment_variables_env_default)) {
                    env_vars[key] = value;
                }
            }
            context.res.json(env_vars);
        });
}