var pg = require('pg'),
url = require('url'),
loggly = require('loggly'),
ga = require('nodealytics'),
settings = require('../settings');

var conString = "postgres://" + settings.pg.username + ":" + settings.pg.password + "@" + settings.pg.server + ":" + settings.pg.port + "/" + settings.pg.database;


//Configure Loggly (logging API)
var config = {
	token: settings.loggly.token,
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
    	// log(row['geometry']);
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

        //final check
        if (feature.properties.geometry) {
        	feature.geometry = feature.properties.geometry;
        	delete feature.properties.geometry;
        }
    })

    return featureCollection;
};

exports.neBorders = function(req, res) {
	var args = url.parse(req.url, true).query;
	var qType;
	var getID2 = [];
	var params = [];

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
	    case 'quick':
	    	break;
	    default:
	    	args.geom = 'geom_simplify_high';
    }

	switch (args.qtype) {
		case 'iso':
			qColumn = 'adm0_a3';
			qType = 'iso';
			break;
		case 'name':
			qColumn = 'name'
			qType = 'name';
			break;
	}

		//Grab POST or QueryString args depending on type
	if (req.method.toLowerCase() == 'post') {
		var getID = req.body;

		for(var i=0;i<getID.length;i++){
			if (qType == 'iso') {
				getID2.push(getID[i].iso);
			} else {
				getID2.push(getID[i].name);
			}
			params.push('$'+(i+1));
		}
	}
	else if (req.method.toLowerCase() == 'get') {
		var getID = req.params.id;
		getID2.push(getID);
		params.push('$1');
	}

	// log(params);
	// log(args);
	// log(getID);

	var client = new pg.Client(conString);
	client.connect();

	if (getID != 'world') {
		var queryText = "SELECT name, year, adm0_a3, ST_AsGeoJSON("+ args.geom + ")::json AS geometry FROM gadm0_2012";
		queryText += " WHERE "+qColumn+" IN("+params.join(",")+")";
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
			log('query executed \n' + queryText);
			var resFormated = geoJSONFormatter(response.rows);
			res.setHeader('Content-Type', 'application/json');

			if (args.callback) {
				res.jsonp(resFormated);
			} else {
				res.send(200,resFormated);
			}

			client.end();
		});
	} else {
		var worldJSON = require('../worldcountries.json');
		log('worldJSON is being called');

		if (args.callback) {
			res.jsonp(worldJSON);
		} else {
			res.send(200,worldJSON);
		}
	}
};

//Utilities
function log(message) {
    //Write to console and to loggly
    logclient.log(settings.loggly.logglyKey, message);
    console.log(message);
}
