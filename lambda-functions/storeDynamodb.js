const AWS = require("aws-sdk")
const ddb = new AWS.DynamoDB.DocumentClient()

exports.store = async (event, context, callback) => {
    const measurements = []
    await event.Records.forEach( async record => {
        var measurement = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));
        
        measurements.push({
            "measurementsId": `ID-${String(Math.random()).slice(2)}`,
            "station": measurement.name,
            "measurement_date": measurement.measurement_date,
            "temperature_max": measurement.temperature_max,
            "temperature_min": measurement.temperature_min,
            "humidity_max": measurement.humidity_max,
            "humidity_min": measurement.humidity_min,
            "rain": measurement.rain
            
        })
    })
    for (var measurement of measurements) {
        try {
            const params = {
                TableName: "measurements",
                Item:  measurement
            }
            await ddb.put(params).promise()
            console.log(measurement)
        } catch (e) {
            console.log({"Meu erro": e})
        }
    }
};
