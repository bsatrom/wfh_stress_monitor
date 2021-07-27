module.exports = async function (context, req) {
    data = context.bindings.healthDataStorage;

    data = data.sort((first, second) => {
        first.event_created - second.event_created;
    }).reverse();

    let returnData = {};

    if (data) {
        returnData = {
            "device": data[0].heart_rate.manufacturer,
            "model": data[0].heart_rate.model_number,
            readings: data.map(item => {
                return {
                    "created": item.event_created,
                    "bpm": item.heart_rate.bpm,
                    "batt": item.heart_rate.battery_level,
                    "pct_to_max": item.heart_rate.pct_notify,
                    "humidity": item.humidity,
                    "temp": item.temp,
                    "pressure": item.pressure,
                    "sound_level": item.sound_level
                };
            })
        };
    }

    context.res = {
        body: returnData
    };
}