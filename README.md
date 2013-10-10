Red Cross Basic Borders Database
==============================

Overview
----------------

Sometimes you just need a country border to put on a simple leaflet map. The Basic Borders Database supplies the simplified geometry for a given country. The geometry is based on [Natural Earth](http://naturalearth.com) with manipualtion and simplification by Red Cross Internation Services. 

Disclaimer
-----------------
*The Basic Borders Database is not an inclusive list of all world countries. The inclusion, exclusion, or geometry of a country does not imply the expression of any opinion on the part of the American Red Cross concerning the legal status of a territory or of its authorities.*

Service Endpoint
-----------------

There are currently is only one endpoint for all services [http://webviz.redcross.org/basicborders/](http://webviz.redcross.org/basicborders/).

The service returns a JSONP object by requesting either the 3 digit [ISO 3166-1](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) code or the Country Name.

The service can also return a world file by using 'world' as your query.
[http://webviz.redcross.org/basicborders/world?callback=callback](http://webviz.redcross.org/basicborders/world?callback=callback)

Sample Request:
[http://webviz.redcross.org/basicborders/ITA?callback=callback](http://webviz.redcross.org/basicborders/ITA?callback=callback)

Sample Response:
  
  callback && callback({
    "type": "Feature",
    "id": 83,
    "properties": {
      "name": "Ireland",
      "geoCode": "IRL",
      "geoType": "country"
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            -6.197885,
            53.867565
          ],
          [
            -6.032985,
            53.153164
          ],
          [
            -6.788857,
            52.260118
          ],
          [
            -8.561617,
            51.669301
          ],
          [
            -9.977086,
            51.820455
          ],
          [
            -9.166283,
            52.864629
          ],
          [
            -9.688525,
            53.881363
          ],
          [
            -8.327987,
            54.664519
          ],
          [
            -7.572168,
            55.131622
          ],
          [
            -7.366031,
            54.595841
          ],
          [
            -7.572168,
            54.059956
          ],
          [
            -6.95373,
            54.073702
          ],
          [
            -6.197885,
            53.867565
          ]
        ]
      ]
    }
  });