var usenetApp = angular.module('usenetApp', ['ui.bootstrap']);

var controllers = {};

usenetApp.factory('xmlFactory', function($http) {
	return {
		getXMLAsync: function(url, callback) {
		$http.get(url, 
     {transformResponse:function(data) {
              // convert the data to JSON and provide
              // it to the success function below
              var x2js = new X2JS();
              var json = x2js.xml_str2json( data );
              return json;
         }}
	).success(callback);
    }};
});	

controllers.SabDLList = function ($scope, xmlFactory) {
	xmlFactory.getXMLAsync('xml.load', function(results){
		$scope.sabdl = results.queue.jobs;
		angular.forEach($scope.sabdl, function(eachjob) {
			eachjob.mbprog = eachjob.mb - eachjob.mbleft;
			eachjob.percent = eachjob.mbprog / eachjob.mb * 100;
		});
		$scope.sabstatus = results.queue;
		$scope.usesab = true;
	});
	xmlFactory.getXMLAsync('hist.xml', function(results){
		$scope.sabhistory = results.history.slots.slot;
	});
   }

usenetApp.controller(controllers);

