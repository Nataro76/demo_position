define([
    // these are the functional modules we are going to activate for the app
    'angular',
    'libbf',
    'module',     // this is the requirejs module defined in { config: { 'app.main': ... } }, not an angularjs module like in the rest of the code
    './services/index',
    './modules/index',
    './app.customization',
  ],
  function( angular, libbf, requirejsModule ) {
    'use strict';

    const i18n = libbf.i18n;

    var rjsCfg = requirejsModule.config();
    console.log( "module config:", rjsCfg );
    var baseUrl = rjsCfg.bfBaseUrl;

    libbf.setApplicationID( 'ButachimieTracker', baseUrl );

    var module = angular.module('app', [
        'ngMessages', 'ngMaterial', 'ngCookies', 'ui.router',
        'libbf',
        'libbf.ui',
        'app.customization',
        'app.services',
        'app.modules',
    ]);

    // we need to create the real menu service
    var rootMenu = [
        {
            name:  "General",
            label: i18n( "General" ),
            items: [
                { label: i18n( 'Home' ),    name: 'Home',      sref: 'home'  },
                { label: i18n( 'About' ),   name: 'About',     sref: 'about' },
            ]
        },
        {
            name:  "Monitoring",
            label: i18n( "Monitoring" ),
            items: [
                { label: i18n( 'Locate' ),    name: 'Locate',      sref: 'locate'  },
                { label: i18n( 'Current alerts' ),    name: 'alerts',   sref: 'arzAlerts' },
                { label: i18n( 'Alert log' ),         name: 'arzAlertsHistory', sref: 'arzAlertsHistory' },
            ]
        },
        {
            name:  "People",
            label: i18n( "People" ),
            items: [
                { label: i18n( 'Search' ),    name: 'searchPeople',      sref: 'searchPeople'  },
            ]
        },
        {
            name:  "backoffice",
            label: i18n( "Backoffice" ),
            roles: {
                'butachimie': 'admin'
            },
            items: [
                { label: i18n( 'Tags' ),      name: 'Tags',      sref: 'tagsList' },
                { label: i18n( 'Anchors' ),   name: 'Anchors',   sref: 'anchorsList' },
                { label: i18n( 'People' ),    name: 'people',      sref: 'peopleList'  },
                { label: i18n( 'Companies' ), name: 'companies',   sref: 'companiesList'  },
                { label: i18n( 'Buildings' ), name: 'buildings',   sref: 'buildingsList'  },
                { label: i18n( 'Zones' ),     name: 'Zones',      sref: 'zonesList' },
                { label: i18n( 'Units' ),     name: 'Units',      sref: 'bcUnitsList' },
                {
                    label:       i18n('Users'),
                    name:        'Users',
                    sref:        'usersList',
                    privileges:  ['read-users', 'create-user', 'update-user', 'delete-user'],
                    tooltip:     '',
                    tooltipLong: ''
                },
                {
                    name:       'Invitations',
                    label:      i18n( 'Invitations' ),
                    sref:       'invitationsList',
                    privileges:  ['read-users', 'create-user', 'update-user', 'delete-user'],
                    tooltip:     '',
                    tooltipLong: ''
                },
            ]
        },
        {
            name:  "Demo",
            label: i18n( "Demo" ),
            roles: {
                'butachimie': 'admin'
            },
            items: [
                { label: i18n( 'Demo Positions' ),    name: 'demoPositions',      sref: 'demoPositions'  },
            ]
        },
    ];

    var appBaseUrl = '/butachimie-geo/';
    module.constant('APP_BASE_URL',    appBaseUrl);
    module.constant('APP_API_URL',     appBaseUrl+'api/');
    module.constant('PATROL_TOPIC_PREFIX',    'butachimie/patrols')

    module.controller('AppCtrl', ['$scope', '$rootScope', '$mdSidenav', '$state', 'BFAuthService', 'bfAccordionMenu', 'bfNotificationListener', '$q',
      function ($scope, $rootScope, $mdSidenav, $state,  AuthService, bfAccordionMenu, bfNotificationListener, $q ) {

        $scope.auth = AuthService;

        $scope.openSideNavPanel = function() {
            $mdSidenav('mainMenu').open();
        };

        $scope.closeSideNavPanel = function() {
            $mdSidenav('mainMenu').close();
        };

        $scope.logout = AuthService.logout;

        console.log("creating root menu");
        $scope.rootMenu = bfAccordionMenu.create( rootMenu, {
            onClick:    function() { $mdSidenav('mainMenu').close(); }
        });

        $rootScope.peopleInDanger = [];

        function onAlarmEvent ( msg ) {
            /* This is the structure that we expect to receive here:
             {
               alarm:         25,
               alarmName:     'Personne en danger',
               alarmSid:      "people-in-danger",
               alert:         19,
               alertSid:      'in-danger',
               alertName:     'quite high',
               topic:         255,
               topicName:     'butachimie/tags/743987439/_position_',
               topicDatatype: 'position',
               variable:      6,
               variableSid:   'position',
               variableName:  'GPS position',
               severity:      2,
               severitySID:   'error',
               severityName:  'Error',
               eventType:     'fired', // 'subsided'
               firedOn:       '2019-05-20 19:55:57.302851+02',
               ts:            '2019-05-22 01:33:29.527388+02',
               msgType:       'alarmEvent',
               username:      'admin'
             }
             */
            if ( msg.msgType === 'alarmEvent' ) {

                if ( msg.alarmSid === 'people-in-danger' ) {

                    var personInDanger = $rootScope.peopleInDanger.find(function(p) { return p.subject === msg.subject; });

                    if ( msg.eventType === 'fired' ) {
                        if ( !personInDanger ) {
                            $rootScope.$applyAsync(function() {
                                $rootScope.peopleInDanger.push({ subject: msg.subject });
                            });
                        }

                    } else if ( msg.eventType === 'subsided' ) {
                        if ( personInDanger ) {
                            var idx = $rootScope.peopleInDanger.indexOf( personInDanger );
                            if ( idx !== -1 ) {
                                $rootScope.$applyAsync(function() {
                                    $rootScope.peopleInDanger.splice( idx, 1 );
                                });
                            }
                        }
                    }

                }

            }

            /*
            $scope.$watchCollection( 'peopleInDanger', function(newColl, oldColl) {
                
            });
            $scope.$watchCollection( function() { return $rootScope.peopleInDanger; }, function(newColl, oldColl) {
                
            });
            */
        }


        function fetchCurrentAlarms() {
            return $q.when([]);
        }

        this.$onInit = function() {
            fetchCurrentAlarms().then(function() {
                bfNotificationListener.listen(function(msg) {
                    console.log("processing msg", msg);
                    if ( msg.msgType === 'alarmEvent' ) {
                        onAlarmEvent( msg );
                    }
                });
            })
        };
    }]);

    return module;
});