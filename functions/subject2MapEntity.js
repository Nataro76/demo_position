define([], function() {
    'use strict';

    function subject2MapEntity ( json, category ) {

        console.log("subject json:", json);

        switch ( json.subjectTypeSid ) {
        case 'butachimie-zone':
            if ( json.properties.zoomThreshold == null ) {
                json.properties.zoomThreshold = 16;
            }
            var color = (json.appProperties || {}).color || (json.properties || {}).color;
            json.geojson.properties.color = color;
            break;

        case 'butachimie-person':
            json.properties.icon = "male-2.png";
            if ( !json.geojson && json.snapshot && json.snapshot.length ) {
                var pos = json.snapshot.find(function(sn) { return sn.varSid === 'position'; });
                if ( pos ) {
                    json.geojson = {
                        type:     'Feature',
                        properties: {
                            icon:   "male-2.png",
                            id:     json.id,
                            label:  json.name
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: pos.value,
                        }
                    };
                }
            }
            break;
        }

        return {
            id:          json.id,
            sid:         json.sid,
            name:        json.name,
            typeSid:     json.subjectTypeSid,
            properties:  json.properties || {},
            geojson:     json.geojson,
            category:    category
        };
    }

    return subject2MapEntity;
});
