const AWS = require("aws-sdk")
const ddb = new AWS.DynamoDB.DocumentClient()

exports.handler = async (event, context, callback) => {
    const data = event.date
    console.log(data)
    const response = await readMeasurements()
    const measurements = response.Items
    const measurementsGroupByDate = groupByDate(data, measurements)
    const measurementsStatics = getMean(measurementsGroupByDate)
    callback(null, {
        statusCode: 200,
        body: measurementsStatics,
        headers: {
            'Acces-Control-Allow-Origin': '*'
        }
    })
};


const readMeasurements = () => {
    const params = {
        TableName: 'measurements',
    }
    
    return ddb.scan(params).promise();
}

const groupByDate = (date, measurements) => {
    return measurements.filter((measurement) => measurement.measurement_date === date).reduce((m, d) => {
        if (!m[d.station]) {
            m[d.station] = { ...d, count: 1 }
            return m;
        }
        m[d.station].temperature_max += d.temperature_max
        m[d.station].temperature_min += d.temperature_min
        m[d.station].humidity_max += d.humidity_max
        m[d.station].humidity_min += d.humidity_min
        m[d.station].rain += d.rain
        m[d.station].count += 1;
        return m;
    }, {})
}

const getMean = (measurements) => {
    return Object.keys(measurements).map(k => {
    const item = measurements[k];
    return {
            station: item.station,
            temperature_max: item.temperature_max/item.count,
            temperature_min: item.temperature_min/item.count,
            humidity_max: item.humidity_max/item.count,
            humidity_min: item.humidity_min/item.count,
            rain: item.rain/item.count
        }
    })
}