Red Cross Basic Borders Database

Overview
----------------

Sometimes you just need a country border to put on a simple leaflet map. The Basic Borders Database supplies the simplified geometry for a given country. The geometry is based on [Natural Earth](http://naturalearth.com) with manipualtion and simplification by Red Cross Internation Services. 

Disclaimer
-----------------
*The Basic Borders Database is not an inclusive list of all world countries. The inclusion, exclusion, or geometry of a country does not imply the expression of any opinion on the part of the American Red Cross concerning the legal status of a territory or of its authorities.*

Service Endpoint
-----------------

There are currently is only one endpoint for all services [http://webviz.redcross.org/basicborders/](http://webviz.redcross.org/basicborders/).

The service returns a either a JSON or JSONP object by requesting either the 3 digit [ISO 3166-1](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) code or the Country Name.

Parameters
-----------------

 - **qtype** _(string)_: Options are 'iso' or 'name'. Where 'iso' is the three digit ISO 3166-1 code. 'iso' is the default
 - **geom** _(string)_: The amount of simplification needed where high is the most simplified. Returning orginal geometry can be slow depending on the size of the geometry. Options are 'high', 'med', or 'orginal'. The default is 'high'.
 - **year** _(integer)_: Returns the borders for the given year. Default is current year. _Note this feature is not yet implemented._
 - **callback** _(string)_: If present response will be in JSONP format.

Sample Post:
```javascript
var postArgs = {
  qtype: "name",
  geom: "high",
  year: "2013"
};

var url = 'http://webviz.redcross.org/basicborders/';

//Send POST, using JSONP
$.getJSON(url + "?callback=?", postArgs).done(function (data) {
  handleNameSearchResponse(data);
}).fail(function (jqxhr, textStatus, error) {
  var err = textStatus + ', ' + error;
  console.log("Request Failed: " + err);
});
```

The service can also return a world file by using 'world' as your query.
[http://webviz.redcross.org/basicborders/world?callback=callback](http://webviz.redcross.org/basicborders/world?callback=callback)

Simple Sample GET Request:
[http://webviz.redcross.org/basicborders/VAT?callback=callback](http://webviz.redcross.org/basicborders/ITA?callback=callback)

Sample Response:
```javascript
callback && callback({
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Vatican",
        "year": 2013,
        "adm0_a3": "VAT",
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                12.453125,
                41.9028930664062
              ],
              [
                12.453125,
                41.9039306640625
              ],
              [
                12.4541015625,
                41.9039306640625
              ],
              [
                12.4541015625,
                41.9028930664062
              ],
              [
                12.453125,
                41.9028930664062
              ]
            ]
          ]
        }
      }
    }
  ]
});
```