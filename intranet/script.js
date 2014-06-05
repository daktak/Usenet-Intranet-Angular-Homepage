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

usenetApp.factory('jsonFactory', function($http) {
	return {
		getJSONAsync: function(url, callback) {
		$http.get(url).success(callback);
		}};
});

controllers.SabDLList = function ($scope, xmlFactory, jsonFactory) {
	jsonFactory.getJSONAsync('intranet/settings.json', function(results){
		$scope.usesab = results.sabnzbd;
		$scope.settings = results;
	xmlFactory.getXMLAsync(results.sabnzbdURL+'api?mode=qstatus&output=xml&apikey='+results.sabnzbdAPI, function(results){
		$scope.sabdl = results.queue.jobs.job;
		angular.forEach($scope.sabdl, function(eachjob) {
			eachjob.mbprog = eachjob.mb - eachjob.mbleft;
			eachjob.percent = eachjob.mbprog / eachjob.mb * 100;
		});
		$scope.sabstatus = results.queue;
	});
	xmlFactory.getXMLAsync(results.sabnzbdURL+'api?mode=history&start=0&limit=5&output=xml&apikey='+results.sabnzbdAPI, function(results){
		$scope.sabhistory = results.history.slots.slot;
	});
	});
   }

usenetApp.controller(controllers);

