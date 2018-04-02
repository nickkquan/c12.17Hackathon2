const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const yelp = require('yelp-fusion');
const app = express();

//Load Keys file
const keys = require('./config.js');
const apiKey = keys.api_key;
const client = yelp.client(apiKey);

//Cross Browser compatiability 
app.use(cors());

//Body Parser Middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//Path middleware
app.use(express.static(path.join(__dirname, "client")));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

function termTest(req) {
    let pattern = /food|bar/g;
    if (pattern.test(req.query.term)) {
        var term = req.query.term;
    }
    return term;
}

function radiusTest(req) {
    let pattern = /^[0-9]{5}$/;
    if (pattern.test(req.query.radius)) {
        var radius = req.query.radius;
    }
    return radius;
}

function latitudeTest(req) {
    let pattern = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,10}/;
    if (pattern.test(req.query.latitude)) {
        var latitude = req.query.latitude;
    }
    return latitude;
}

function longitudeTest(req) {
    let pattern = /^-?([1]?[1-7][1-9]|[1]?[1-8][0]|[1-9]?[0-9])\.{1}\d{1,10}/;
    if (pattern.test(req.query.longitude)) {
        var longitude = req.query.longitude;
    }
    return longitude;
}

app.get('/yelprequest', (req, res) => {
    var term = termTest(req);
    var latitude = latitudeTest(req);
    var longitude = longitudeTest(req);
    var radius = radiusTest(req);
    const searchRequest = {
        term,
        latitude,
        longitude,
        radius
    };
    client.search(searchRequest).then(response => {
        const firstResult = response.jsonBody.businesses;
        const prettyJson = JSON.stringify(firstResult, null, 4);
        res.send(prettyJson);
    }).catch(e => {
        res.json({
            message: 'There was an error while finding data from Yelp.'
        });
    });
})

//Port depending on where it is listening
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Server connected on ' + port);
});