const express = require('express'); // Constrói APIs Web
const bodyParser = require('body-parser') //
const cors = require('cors'); // Liberar o acesso para o postman

const { Kinesis } = require('aws-sdk')
const { format, utcToZonedTime } = require('date-fns-tz'); // Fuso de Recife
const axios = require('axios') // Faz chamada pra API inmet

const kinesis = new Kinesis()
const app = express();  // Instancia o server da API

app.use(cors()) // Server utiliza cors
app.use(bodyParser.json()); // Requisições com JSON

app.get('/', async (request, response) => {
    try {
        const tempoRecifeFormatado = format(utcToZonedTime(new Date(), "America/Recife"), "yyyy-MM-dd/HH00") // Formatar o tempo

        const respostaAPI = await axios.get(`https://apitempo.inmet.gov.br/estacao/dados/${tempoRecifeFormatado}`) // Pegar os dados do Brasil no horário de Recife
        const estacoesPE = []  // Lista com os dados de PE

        respostaAPI.data.map(station => {  // Percorre os etados do Brasil 
            if (station.UF === 'PE') {  // Coleta os dados de todas as estações de PE
                let data = {
                    Data: JSON.stringify({
                        name: station.DC_NOME === "CABROBÓ" ? "CABROBO" : station.DC_NOME,
                        temperature_max: parseFloat(station.TEM_MAX),
                        temperature_min: parseFloat(station.TEM_MIN),
                        humidity_max: parseFloat(station.UMD_MAX),
                        humidity_min: parseFloat(station.UMD_MIN),
                        rain: parseFloat(station.CHUVA),
                        measurement_date: station.DT_MEDICAO
                    }),
                    PartitionKey: station.DC_NOME === "CABROBÓ" ? "CABROBO" : station.DC_NOME,
                };

                estacoesPE.push(data)
            }
        })
        
        console.log(estacoesPE) 

        const JSONKinesis = {  // Formatando para os padrões da AWS
            StreamName: "api-inmet-stream",
            Records: estacoesPE,
        }

        kinesis.putRecords(JSONKinesis, function (error, data) { // Enviado os dados para a Stream
            if (error) throw new Error("404 - Bad request");
            else return response.status(200).json(data);
        });
    } catch (err) {
        return response.status(400).json({"meu erro":err})
    }
})

module.exports = app
