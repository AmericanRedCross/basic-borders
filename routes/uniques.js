var pg = require('pg'),
loggly = require('loggly'),
ga = require('nodealytics'),
fs = require('fs'),
async = require('async'),
settings = require('../settings');

//Configure Loggly (logging API)
var config = {
    subdomain: settings.loggly.subdomain,
    auth: {
        username: settings.loggly.username,
        password: settings.loggly.password
    },
    json: true
};

//Loggly client
var logclient = loggly.createClient(config);

//Google Analytics
ga.initialize(settings.ga.key, 'webviz.redcross.org', function () {
});

exports.gdpcClavin = function(req,res) {
    var docs = req.body;
    var queryResponse = [];

    if (docs.length > 1) {
        res.end('Only submit one document at a time.');
    }

    var gdpcCommand = 'sudo cp '+ settings.filepath.filename + ' ' + settings.filepath.clavin + ' && cd ../CLAVIN && MAVEN_OPTS="-Xmx2048M" mvn exec:java -Dexec.mainClass="com.bericotech.clavin.gdpc"';
    var exec = require('child_process').exec;

    fs.writeFile(settings.filepath.filename, docs[0].text, function(err) {
        if(err) {
            log(err);
        } else {
            log("The file " + docs[0].name + " was saved!");
        }
    });

    //create the response
    var uniques = {};
    uniques.documentName = docs[0].name;
    uniques.date = new Date();
    uniques.resolvedLocations = [];

    var parseClavin = function(clavin, callback) {
        log('starting waterfall');
        async.waterfall([
            function(callback) {
                var makePlacesResult;
                async.map(clavin, makePlaces, function(err, result) {
                    makePlacesResult = result;
                });
                log('step 1: \n' + makePlacesResult);
                callback(null, makePlacesResult);
            },
            function(places, callback){

                //locations array
                for(i=0;i<places.length;i++){
                    var location = {};
                    location.name = places[i];
                    location.centroid = {'lat': '', 'lng':''};
                    uniques.resolvedLocations.push(location);
                }
                log('step 2 \n' + JSON.stringify(uniques));
                callback(null, uniques);
            }
        ], function (err, result) {
            callback(result);
        });
    }

    var myObj = {};

    myObj.list = function(callback){
        var result;
        exec(gdpcCommand, function (error, stdout, stderr) {
            if (error) {
                log(error);
            } else {
                callback(stdout);
            }
        });
    }

    myObj.list(function (stdout) {
        log(stdout);
        var cS = stdout.indexOf('Resolved');
        var cE = stdout.indexOf('All Done')-3;
        var clavinRep = stdout.substring(cS,cE).split('#$#$');
        // clavinRep = clavinRep.split('#$#$');
        if (cS == -1) {
            var location = {};
            location.name = 'None Found';
            location.centroid = {'lat': '', 'lng':''};
            uniques.resolvedLocations.push(location);
            res.jsonp(uniques);
        } else {
            log('calling parse Clavin');
            parseClavin(clavinRep, function(places) {
                res.jsonp(places);
            });
        }
    });

}

//Utilities
function log(message) {
    //Write to console and to loggly
    logclient.log(settings.loggly.logglyKey, message);
    console.log(message);
}

function makePlaces(places, callback) {
    var placesArr = [];

    var pS1 = places.indexOf('{') + 1;
    var pE1 = places.indexOf('(') - 1;
    var pS2 = pE1 + 2;
    var pE2 = places.indexOf(',');
    var pS3 = pE2 + 1;
    var pE3 = places.indexOf(')');

    var place1 = places.substring(pS1,pE1);
    var place2 = places.substring(pS2,pE2);
    var place3 = places.substring(pS3,pE3);

    if (place2 != 'United States') {
        if (place3 != ' 00') {
            placesArr.push(place1, place2, place3);
        } else {
            placesArr.push(place1, place2);
        }

    } else {
        placesArr.push(place1 + ',' + place3, place2);
    }
    callback(null, placesArr);
}