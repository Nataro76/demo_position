<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Butachimie Geo</title>

    <!-- AngularJS Material UI -->
    <link rel="stylesheet" href="css/angular-material.min.css" />
    <link rel="stylesheet" href="css/main.css" />

    <link rel="stylesheet" href="/resources/css/splashscreen.css">
    <script type="text/javascript" src="/resources/js/splashscreen.js"></script>

  </head>

  <body>
    <script type="text/javascript">splashscreen.create('splashscreen.html');</script>

  <div bf-compile-after="appReady" layout="column" flex layout-fill
        ng-class="{'debug-sref': debug.uisref, 'debug-view': debug.uiview}"
        ng-controller="AppCtrl as $ctrl"
        id='#popupContainer'
        ng-cloak>

    <md-toolbar>
      <div class="md-toolbar-tools">
        <md-button class="md-icon-button" aria-label="{{ 'Menu' | translate }}" ng-click="openSideNavPanel()">
          <md-tooltip><translate>Menu</translate></md-tooltip>
          <md-icon class="material-icons">menu</md-icon>
        </md-button>
        <h2 translate>Butachimie Geo</h2>
        <span flex></span>
        <md-button class="md-icon-button" aria-label="{{ 'Home' | translate }}" ui-sref="home">
          <md-tooltip><translate>Home</translate></md-tooltip>
          <md-icon class="material-icons">home</md-icon>
        </md-button>
        <md-button class="md-icon-button" aria-label="{{ 'About' | translate }}" ui-sref="about">
          <md-tooltip><translate>About</translate></md-tooltip>
          <md-icon class="material-icons">info</md-icon>
        </md-button>

        <bf-alerts-indicator ignore-notices="true" target-state="arzAlerts" poll-period="0.167" show-naks="true"></bf-alerts-indicator>
        <bf-user-menu></bf-user-menu>

      </div>
    </md-toolbar>

    <md-sidenav class="md-sidenav-left md-whiteframe-z2 main-menu" md-component-id="mainMenu">
      <md-toolbar layout="row">
        <div class="md-toolbar-tools">
          <h2 translate>Main Menu</h2>
          <span flex></span>
          <md-button class="md-icon-button" aria-label="{{ 'Close Main menu' | translate }}" ng-click="closeSideNavPanel()">
            <md-tooltip><translate>Close Main menu</translate></md-tooltip>
            <md-icon class="md-default-theme material-icons">&#xE5CD;</md-icon>
          </md-button>
        </div>
      </md-toolbar>
      <md-content layout-padding>
        <bf-accordion-menu menu="rootMenu"></bf-accordion-menu>
      </md-content>
    </md-sidenav>

    <ui-view layout="column" layout-fill flex>
    </ui-view>

  </div>

    <!-- we are going to use RequireJS to pull the app -->
    <script src="/resources/js/require-2.3.6.min.js" data-main="require.main.js"></script>
  </body>
</html>