define([ 'angular', 'libbf' ], function( angular, libbf ) {
    'use strict';

    const i18n = libbf.i18n;
    const MemstoreService = libbf.generators.MemstoreService;
    const Papa = libbf.libraries.papaparse;

    var module = angular.module('app.customization', [ 'libbf', 'libbf.ui' ]);



    /**
     * this service is used to manage the person's roles of Butachimie
     */
    module.service('arzPersonRoles', [ 'APP_BASE_URL', function( APP_URL ) {

        var service = new MemstoreService( [
            { name: "id",   datatype: "string" },
            { name: "name", datatype: "string" },
        ], "id", false, false );

        Papa.parse( APP_URL + "data/people-roles.csv", {
            download: true,
            complete: function(results) {
                console.log("Parsed people roles' CSV:", results);
                results.data.forEach(function(f, idx) {
                    service.create({ id: f[0], name: f[1] });
                });
            }
        });

        return service;
    }]);


    /**
     * this block registers the Product Families of Saint Gobain with the form editor and the fk field
     */
    module.run([ 'bfFormService', 'bfJsonSchemaFkField', function ( bfForm, bfJsonSchemaFkField ) {
        bfJsonSchemaFkField.registerService( 'arz.personRoles', 'arzPersonRoles' );
        bfForm.addResource('Person role', 'arz.personRoles', 'id', 'name' );
    }]);


    return module;
});