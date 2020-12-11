define([
    'require',
    'libbf',
    '../../functions/subject2MapEntity',
    './module',
], function ( require, libbf, subject2MapEntity, module ) {
    'use strict';

    const i18n = libbf.i18n;
    const L = libbf.libraries.leaflet;
    const debounce = libbf.functions.debounce;

    const EV_REFRESH = 'demo-refresh-view';
    const IMAGE = 'image';
    function json2imageEntity ( s ) {
        var e = subject2MapEntity( s, IMAGE );
        var ap = s.appProperties || {};
        // extract the image from the application-specific properties
        e.image = ap.image;
        e.level = ap.level;
        return e;
    }

    function hasGeojson ( s ) {
        return s.geojson != null;
    }

    const STATE_SUCCESS = 'success';
    const STATE_FAILED = 'failed';

    demoController.$inject = [ '$scope', 'bfTableService', 'Buildings', 'BFSubjectsService', '$q', 'BF_BASE_URL', '$interval',
        'BFDataService' ];
    function demoController ( $scope, bfTable, Buildings, BFSubjects, $q, bfBaseUrl, $interval, BFDataService ) {

        var $ctrl = this;

        this.mapConfig = {
            //provider:  'Mapbox',
            editable:   false,
            withImages: true,
            withTracks: true,
            measureControl: true,
            /*
            overlays:   [
                { id: "dots", deflate: true, pane: null, priority: 300 }
            ],
            */
            imagePath:      bfBaseUrl+'resources/icons/map/',
            selection:  {
                enable:     false,
                multiple:   false,
            },
            levels:     {
                enable:     true,
                onChange:   function( level ) {
                    $ctrl.level = level;
                    $scope.$emit( EV_REFRESH );
                }
            },
            onClick: function( entity, subject, ev ) {
                var latlng = map.mouseEventToLatLng( ev.originalEvent );
                console.log("clicked at: "+latlng.lat + ', ' + latlng.lng);
                debouncedAddMarker( latlng );
            }
        };
        this.entities = [];
        this.tracks = [];
        this.images = [];
        this.map = null;

        this.buildings = [];
        this.floors = [];
        this.people = [];
        this.level = 0;

        this.running = false;

        $scope.model = {
            tagId:      null,
            delay:      10,
        };

        function rowStyleFn ( row ) {
            var color = 'transparent';
            switch ( row._state ) {
            case STATE_SUCCESS:
                color = 'rgba(0,255,0,0.125)';
                break;
            case STATE_FAILED:
                color = 'rgba(255,0,0,0.125)';
                break;
            }
            return { 'background-color': color };
        }

        $scope.path = {
            config: {
                title:      i18n.gettext("Path"),
                rowStyleFn:     rowStyleFn,
                columns: [
                    { key: "id",  label: "ID" },
                    { key: "lat", label: "latitude", },
                    { key: "lng", label: "longitude", },
                ],
                actions:    [
                    {
                        icon:       'md:delete',
                        tooltip:    i18n.gettext('Remove'),
                        ariaLabel:  i18n.gettext('Remove'),
                        callback:   function ( $event, row ) {
                            var idx = $scope.path.data.indexOf( row );
                            if ( idx !== -1 ) {
                                $scope.$applyAsync(function() {
                                    $scope.path.data.splice(idx, 1);
                                    layerGroup.removeLayer( row.marker );
                                    bfTable.refresh( $scope, $scope.path.data );
                                });
                            }
                        }
                    }
                ]
            },
            data:   [],
        };
        var map = null;
        var layerGroup = null;
        var sequence = 0;
        var current = 0;

        function addMarker ( latlng ) {
            if ( $ctrl.running ) { return; }
            var id = sequence++;

            // this is used to compute the real size of the label
            //var bbox = map.getLabelBBox( ""+id );

            var marker = L.marker( latlng, {
                icon: L.divIcon({
                    className:  'demo-marker-icon',
                    html:       ""+id,
                    //iconSize:   [ bbox.width, bbox.height ],
                    //iconAnchor: [ bbox.width / 2, bbox.height / 2 ]
                })
            }).addTo( layerGroup );

            $scope.$applyAsync(function() {
                $scope.path.data.push({
                    id:     id,
                    lat:    latlng.lat,
                    lng:    latlng.lng,
                    marker: marker
                });
                bfTable.refresh( $scope, $scope.path.data );
            });
        }
        var debouncedAddMarker = debounce( addMarker, 200 );

        $scope.$on('mapReady', function() {
            console.log("map object:", $ctrl.map);
            $ctrl.map.selectLevel( $ctrl.level );
            map = $ctrl.map.map;
            map.createPane( "dots" );
            map.getPane( "dots" ).style.zIndex = 460; // this will put the pane between the overlay-pane and the shadow-pane
            layerGroup = L.layerGroup([], { pane: "dots" });
            map.addLayer( layerGroup );

            map.on('click', function( ev ) {
                var coord = ev.latlng;
                var lat = coord.lat;
                var lng = coord.lng;
                console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
                //var latlng = $ctrl.map.map.mouseEventToLatLng( ev.originalEvent );
                //console.log("clicked at: "+latlng.lat + ', ' + latlng.lng);
                debouncedAddMarker(coord);
            });
        });

        $scope.$on( EV_REFRESH, function() {
            $scope.$applyAsync(function() {
                $ctrl.entities = $ctrl.buildings.filter( hasGeojson );
                $ctrl.images = $ctrl.floors.filter( hasGeojson ).filter(function(floor) {
                    return floor.level === $ctrl.level;
                });
                $q.all( $ctrl.images.map(function(floor) {
                    return BFSubjects.search({
                        typeSid:    'butachimie-zone',
                        childId:   floor.id,
                        relType:    'is-part-of',
                        properties: [
                            { path: '{shape,color}', name: "color" }
                        ]
                    });
                }) )
                .then(function(all) {
                    var zones = all.reduce(function(arr, res) { return arr.concat( res ); }, []).filter( hasGeojson ).map( subject2MapEntity );
                    $scope.$applyAsync(function() {
                        $ctrl.entities = [].concat( $ctrl.entities, zones );
                    });
                });
            });
        });

        this.selectLevel = function ( level ) {
            $ctrl.level = level;
            if ($ctrl.map) {
                $ctrl.map.selectLevel( level );
            }
            $scope.$emit( EV_REFRESH );
        };

        var oldRow = null;
        function sendNext () {
            var data = $scope.path.data;
            if ( current >= data.length ) {
                current = 0;
            }
            if ( current < data.length ) {
                var row = data[ current ];
                row._state = null;
                if ( oldRow && oldRow._state !== STATE_FAILED ) {
                    oldRow._state = null;
                }
                oldRow = row;
                var msg = [
                    {
                        ts:     (new Date()).toISOString(),
                        id:     $scope.model.tagId,
                        lat:    row.lat,
                        lon:    row.lng,
                        alt:    $ctrl.level * 3
                    }
                ];
                BFDataService.save( 'butachimie/tags', msg ).then(function() {
                    row._state = STATE_SUCCESS;
                }, function(err) {
                    console.error("send failed, reason:", err );
                    row._state = STATE_FAILED;
                }).finally(function() {
                    $scope.$applyAsync(function() {
                        bfTable.refresh( $scope, $scope.path.data );
                    });
                });
            }
            // let's prepare for the next one
            if ( ++current >= data.length ) {
                current = 0;
            }
        }

        this.interval = null;
        this.start = function() {
            this.running = true;
            sendNext();
            this.interval = $interval( sendNext, $scope.model.delay * 1000 );
        };

        this.stop = function() {
            this.running = false;
            if ( this.interval ) {
                $interval.cancel( this.interval );
                this.interval = null;
            }
        };

        this.reset = function() {
            oldRow = null;
            $scope.path.data.forEach( function(row) {
                layerGroup.removeLayer( row.marker );
            });
            $scope.path.data = [];
            bfTable.refresh( $scope, $scope.path.data );
        };

        this.$onInit = function() {
            Buildings.search({ name: '...' }).then(function(buildings) {
                //console.log("buildings:", buildings);
                $ctrl.buildings = buildings;
                return BFSubjects.search({
                    name:       '...',
                    typeSid:    'section',
                    properties: [
                        { name: "image", path: "{image}" },
                        { name: "level", path: "{level}" },
                    ]
                });

            }).then(function(floors) {
                //console.log("floors:", floors);
                $ctrl.floors = floors.map( json2imageEntity );
                $ctrl.selectLevel( $ctrl.level );
                return BFSubjects.search({
                    name:       '...',
                    typeSid:    'butachimie-zone',
                    properties: [
                    ]
                });
            });
        };
    }

    module.component('demoComp', {
        templateUrl:    require.toUrl('./demo.component.html'),
        controller:     demoController,
        controllerAs:   '$demoCtrl'
    });

    module.config([ '$stateProvider', function($stateProvider) {

        $stateProvider.state({
            name: 'demoPositions',
            url: '/demoPositions',
            component: 'demoComp',
            data: { authRequired: true },
            sticky: true,
        });

    }]);


    return module;
});
