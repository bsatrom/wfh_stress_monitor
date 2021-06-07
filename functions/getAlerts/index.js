module.exports = async function (context, req) {
    data = context.bindings.alertsStorage;
    requestTime = Date.now();

    if (req.query.since) {
        sinceTime = new Date(parseInt(req.query.since)).getTime();
        sinceTime = sinceTime ? sinceTime : 0;
        data = data.filter(item => item.event_created > sinceTime);
    }

    data = data.sort((first, second) => {
        first.event_created - second.event_created;
    }).reverse();

    context.res = {
        body: data
    };
}