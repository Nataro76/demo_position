define([
    'angular',
    './home/index',
    './about/index',
    './userPrefs/index',
    './searchPeople/index',
    './locateComp/index',
    './backoffice/index',
    './alerts/index',
    './alertsHistory/index',
    './demo/index'
], function( angular ) {
    return angular.module('app.modules', [
        'app.home',
        'app.about',
        'app.userPrefs',
        'app.people.search',
        'app.locate',
        'app.backoffice',
        'app.arzAlerts',
        'app.arzAlertsHistory',
        'app.demo',
    ]);
});