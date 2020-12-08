define([ 'libbf' ], function( libbf ) {
    'use strict';

    const i18n = libbf.i18n;

    function voltage2icon ( metric ) {
        //console.log("metric:",  metric);
        if ( !metric || !metric.value ) { return null; }
        // the battery used by wirepas Anchors is a 3.0 V CR2477 with a cut-off voltage of 2.0 V
        // and a continuous drain of 0.2 mA
        // this means that the operative range for voltage is between 2V and 3V
        // 2V                                          3V
        // |----------|----------|----------|----------|
        //       ^          ^          ^          ^
        var v = ( metric.value - 2 );
        var icon = { icon: 'battery-full', set: 'fa', color: '#08e800' }; // also battery-4
        if ( v < 0.125 ) {
            icon = { icon: 'battery-empty', set: 'fa', color: 'red' }; // also battery-0
        } else if ( v < 0.125 + 0.250 ) {
            icon = { icon: 'battery-quarter', set: 'fa', color: '#ff7300' }; // also battery-1
        } else if ( v < 0.125 + 0.500 ) {
            icon = { icon: 'battery-half', set: 'fa', color: '#a6b0a5' }; // also battery-2
        } else if ( v < 0.125 + 0.750 ) {
            icon = { icon: 'battery-three-quarters', set: 'fa', color: '#8dcf8a' }; // also battery-3
        }
        return { icon: icon, tooltip: i18n.sprintf("%d%%", ( v < 0 ? 0 : ( v > 1 ? 1 : v ) ) * 100 ) };
    }

    return voltage2icon;
});