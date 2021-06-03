module.exports = async function (context, req) {
    context.log('Decrypt and save health data from Notehub.');

    msgBody = req.body;

    let rspBody;
    if (msgBody) {
        if (msgBody.alert) {
            context.bindings.healthAlertsStorage = msgBody;
            rspBody = 'Alert received';
        } else {
            context.bindings.healthDataStorage = msgBody;
            rspBody = 'Health data received';
        }
    }

    context.res = {
        body: rspBody
    };
}