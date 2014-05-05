var express = require('express'),
    places = require('./routes/places');

var app = express();

app.use(express.bodyParser());
app.enable("jsonp callback");
app.post('/basicborders/', places.neBorders);
app.get('/basicborders/:id', places.neBorders);

app.listen(80);
console.log('Listening on port 80...');