module.exports = async function (context, req) {
    data = context.bindings.alertsStorage;
    requestTime = Date.now();

    if (!req.query.all) {
        data = data.filter(item => item.event_created > requestTime);
    }

    data = data.sort((first, second) => {
        first.event_created - second.event_created;
    }).reverse();

    context.res = {
        body: data
    };
}