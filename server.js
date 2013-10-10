var express = require('express'),
    places = require('./routes/places');
 
var app = express();

app.use(express.bodyParser());
app.enable("jsonp callback");
app.post('/basicborders/', places.neBorders);
app.get('/basicborders/:id', places.neBorders);
// app.get('basicborders/unique/'. places.getUniques);

app.listen(3000);
console.log('Listening on port 3000...');