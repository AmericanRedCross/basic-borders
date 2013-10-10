var pg = require('pg'),
url = require('url'),
loggly = require('loggly'),
ga = require('nodealytics'),
settings = require('../settings');

var conString = "postgres://" + settings.pg.username + ":" + settings.pg.password + "@" + settings.pg.server + ":" + settings.pg.port + "/" + settings.pg.database;
var client = new pg.Client(conString);

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

//Take in results object, return GeoJSON (if there is geometry)
function geoJSONFormatter(rows, geom_fields_array) {
    //Take in results object, return GeoJSON
    if (!geom_fields_array) {
    geom_fields_array = ["geom"]
    } //default

    //Loop thru results
    var featureCollection = { "type": "FeatureCollection", "features": [] };

    rows.forEach(function (row) {
        var feature = { "type": "Feature", "properties": {} };
        //Depending on whether or not there is geometry properties, handle it.  If multiple geoms, use a GeometryCollection output for GeoJSON.
        if (geom_fields_array && geom_fields_array.length == 1) {
            //single geometry
            if (row[geom_fields_array[0]]) {
                feature.geometry = JSON.parse(row[geom_fields_array[0]]);
                //remove the geometry property from the row object so we're just left with non-spatial properties
                delete row[geom_fields_array[0]];
            }
        }
        else if (geom_fields_array && geom_fields_array.length > 1) {
            //if more than 1 geom, make a geomcollection property
            feature.geometry = { "type": "GeometryCollection", "geometries": [] };
            geom_fields_array.forEach(function (item) {
                feature.geometry.geometries.push(row[item]);
                //remove the geometry property from the row object so we're just left with non-spatial properties
                delete row[item];
            });
        }

        //handle centroids
        if (row.centroid) {
            row.centroid = row.centroid.replace("POINT(", "").replace(")", "").split(" "); //split WKT into a coordinate array [x,y]
        }

        feature.properties = row;
        featureCollection.features.push(feature);
    })

    return featureCollection;
};

exports.neBorders = function(req, res) {
	var args = url.parse(req.url, true).query;
	var qType;
	var getID2 = [];
	var params = [];

	//Grab POST or QueryString args depending on type
	if (req.method.toLowerCase() == 'post') {
		var getID = req.body;
	}
	else if (req.method.toLowerCase() == 'get') {
		var getID = req.params.id;	
	}

	log(getID);

	for(var i=0;i<getID.length;i++){
		getID2.push(getID[i].name);
		params.push('$'+(i+1));
	}

	if (!args.year) {
		args.year = new Date().getFullYear();
	}

	if (!args.geom) {
		args.geom = 'high';
	}

	if (!args.qtype) {
		args.qtype = 'iso';
	}

	//fix the case problem
	args.geom.toLowerCase();
	args.qtype.toLowerCase();

	switch (args.geom) {
	    case 'original':
	        args.geom = 'geom';
	        break;
	    case 'high':
	        args.geom = 'geom_simplify_high';
	        break;
	    case 'med':
	    	args.geom = 'geom_simplify_med';
	    	break;
	    default:
	    	args.geom = 'geom_simplify_high';
    }

	switch (args.qtype) {
		case 'iso':
			qType = 'adm0_a3';
			break;
		case 'name':
			qType = 'name'
			break;
	}

	client.connect();
	
	var queryText = "SELECT name, year, adm0_a3, 'Feature' As type, ST_AsGeoJSON(ne0."+ args.geom + ")::json As geometry FROM naturalearth0 As ne0";
	if (getID != 'world') {
		queryText += " WHERE "+qType+" IN("+params.join(",")+")";
	}
	var query = client.query(queryText, getID2);

	query.on("row", function (row, response) {
		response.addRow(row);
	});

	//Handle query error - fires before end event
    query.on('error', function (error) {
        res.status = 'error';
        res.message = error;
        log('error \n' + error);
    });
	
	query.on("end", function (response) {
		log('query executed \n' + query);
		var resFormated = geoJSONFormatter(response.rows);
		res.setHeader('Content-Type', 'application/json');

		if (args.callback) {
			res.json(resFormated);
		} else {
			res.send(200,resFormated);
		}
		
		client.end();
	});
};

//Utilities
function log(message) {
    //Write to console and to loggly
    logclient.log(settings.loggly.logglyKey, message);
    console.log(message);
}