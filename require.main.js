(function () {

    var angularCDN      = "//ajax.googleapis.com/ajax/libs/angularjs/1.7.7/";
    var materialCDN     = "//ajax.googleapis.com/ajax/libs/angular_material/1.1.13/";
    var uiRouterCDN     = "//unpkg.com/@uirouter/angularjs@1.0.22/release/";
    var bfUrl           = "/";

    require.config({
        waitSeconds: 30,
        //appDir: ".",
        baseUrl: ".",
        // alias libraries paths
        paths: {
            /* Load everything from cdns. On fail, load local file. */
            'angular':            [ angularCDN+"angular.min",               '/resources/js/angular.min'           ],
            'angular-animate':    [ angularCDN+"angular-animate.min",       '/resources/js/angular-animate.min'   ],
            'angular-aria':       [ angularCDN+"angular-aria.min",          '/resources/js/angular-aria.min'      ],
            'angular-messages':   [ angularCDN+"angular-messages.min",      '/resources/js/angular-messages.min'  ],
            'angular-cookies':    [ angularCDN+"angular-cookies.min",       '/resources/js/angular-cookies.min'   ],
            'angular-sanitize':   [ angularCDN+"angular-sanitize.min",      '/resources/js/angular-sanitize.min'  ],
            'angular-ui-router':  [ uiRouterCDN+"angular-ui-router.min",    '/resources/js/angular-ui-router.min' ],
            'angular-material':   [ materialCDN+"angular-material.min",     '/resources/js/angular-material.min'  ],
            'libbf':              [ bfUrl+'libbf/core/libbf.min' ],
            'libbf-ui':           [ bfUrl+'libbf/ui/libbf-ui.min' ],
            'libbf-editor':       [ bfUrl+'libbf/editor/libbf-editor.min' ],
            'libbf-dashboard':    [ bfUrl+'libbf/dashboard/libbf-dashboard.min' ],
            'libbf-barcode':      [ bfUrl+'libbf/barcode/libbf-barcode.min' ],
        },
        // angular as well as other libraries have been already loaded with "script" tags
        shim: {
            'angular':            { exports: "angular" },
            'angular-animate':    [ 'angular' ],
            'angular-aria':       [ 'angular' ],
            'angular-messages':   [ 'angular' ],
            'angular-cookies':    [ 'angular' ],
            'angular-sanitize':   [ 'angular' ],
            'angular-ui-router':  [ 'angular' ],
            'angular-material':   [ 'angular' ],
            'libbf':              [ 'angular' ],
            'libbf-ui':           [ 'libbf', 'angular' ],
            'libbf-editor':       [ 'libbf', 'angular' ],
            'libbf-dashboard':    [ 'libbf', 'angular' ],
            'libbf-barcode':      [ 'libbf', 'angular' ],
            'app.bootstrap':      [
                'angular', 'angular-animate', 'angular-aria', 'angular-messages', 'angular-cookies', 'angular-sanitize',
                'angular-ui-router',
                'angular-material',
                'libbf', 'libbf-dashboard', 'libbf-ui', 'libbf-editor', 'libbf-barcode'
            ]
        },

        config: {
            'app.main': {
                bfBaseUrl: bfUrl
            },
            /*
            text: {
              onXhr: function(xhr, url) {
                console.log('file ' + url + ' is about to be loaded');
              },
              onXhrComplete: function(xhr, url) {
                console.log('file ' + url + ' has been loaded');
              }
            }
            */
        },

        // kick start application
        deps: ['./app.bootstrap'],

        onNodeCreated: function(node, config, moduleName, url) {

            node.addEventListener('load', function() {
                if ( loadProgressBar )
                    loadProgressBar.inc( config.paths[ moduleName ] != null );
            });

            node.addEventListener('error', function() {
                if ( loadProgressBar )
                    loadProgressBar.inc( config.paths[ moduleName ] != null );
            });
        },

    });

    // keep track of how many first-level modules we are expecting
    var globalConfigs = requirejs.s.contexts._.config;
    if ( loadProgressBar )
        loadProgressBar.expected( Object.keys( globalConfigs.paths ).length );

    requirejs.onError = onRequireJSError;
})();