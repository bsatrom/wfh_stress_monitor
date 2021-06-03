module.exports = async function (context, req) {
    data = context.bindings.healthDataStorage;

    data = data.sort((first, second) => {
        first.event_created - second.event_created;
    }).reverse();

    returnData = {
        "device": data[0].heart_rate_data.manufacturer,
        "model": data[0].heart_rate_data.model_number,
        readings: data.map(item => {
            return {
                "created": item.event_created,
                "bpm": item.heart_rate_data.bpm,
                "batt": item.heart_rate_data.battery_level,
                "pct_to_max": item.heart_rate_data.pct_notify,
                "humidity": item.humidity,
                "temp": item.temp,
                "pressure": item.pressure,
                "sound_level": item.sound_level
            };
        })
    };

    context.res = {
        body: returnData
    };
}