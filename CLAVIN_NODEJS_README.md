Node.js Server for CLAVIN
================

Overview
----------------

At the Red Cross we create a lot of documents. This service builds on the [CLAVIN](http://clavin.berico.us/clavin-web/) project by [Berrico Technologies](http://www.bericotechnologies.com/).

Service Endpoint
-----------------

There is currently only one endpoint for all services [http://webviz.redcross.org:4000/geodoc/](http://webviz.redcross.org/geodoc/).

The service returns a either a JSON or JSONP object by posting arguments with the document name and text to be parsed.

Parameters
-----------------

 - **name** _(string)_: Document name. Used for tracking purposes only.
 - **text** _(string)_: Plain text to be parsed for locations.
 - **callback** _(string)_: If present response will be in JSONP format.

Sample Post:
```javascript
var postArgs = {
  name: "sampleDoc",
  text: "I really like the food in France but my favorite food is from India."
};

var url = 'http://webviz.redcross.org:4000/geodoc/';

//Send POST, using JSONP
$.getJSON(url + "?callback=?", postArgs).done(function (data) {
  handleNameSearchResponse(data);
}).fail(function (jqxhr, textStatus, error) {
  var err = textStatus + ', ' + error;
  console.log("Request Failed: " + err);
});
```

Sample Response:
```javascript
callback && callback({
  "documentName": "sampleDoc",
  "date": "2013-10-23T01:05:20.740Z",
  "resolvedLocations": [
    {
      "name": [
        "Republic of France",
        "France"
      ],
      "centroid": {
        "lat": "",
        "lng": ""
      }
    },
    {
      "name": [
        "Republic of India",
        "India"
      ],
      "centroid": {
        "lat": "",
        "lng": ""
      }
    }
  ]
});
```

Disclaimer
-----------------
*This database is not an inclusive list of all world places. The inclusion, exclusion, or geometry of a country or place does not imply the expression of any opinion on the part of the American Red Cross concerning the legal status of a territory or of its authorities.*