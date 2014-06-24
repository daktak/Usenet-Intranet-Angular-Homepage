var usenetApp = angular.module('usenetApp', ['usenetApp.sessions', 'base64','ngStorage']);	

var controllers = {};

usenetApp.config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});


var settingsBuilder = function(p) {
    var presets = [ 'id', 'name', 'rateDownload', 'percentDone'];
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
        if (p[key]) {
          if (typeof p[key] === 'boolean') {
             presets.push(key);
          }
        }
      }
    }
    return presets;
};

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

controllers.SabComing =  function ($scope, jsonFactory) {
        //get settings first
        jsonFactory.getJSONAsync('settings.json', function(results){
                $scope.settings = results;
		if ($scope.settings.sickbeard) {
                jsonFactory.getJSONAsync($scope.settings.sickbeardURL+'api/'+$scope.settings.sickbeardAPI+'/?cmd=future&sort=date&type=later', function(results){
                        var later = [];
                        var myDays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
                        var monthNames = [ "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December" ];
                        angular.forEach(results.data.later, function(eachshow) {
                                if (eachshow.episode=="1") {
                                eachshow.weekday = myDays[eachshow.weekday];
                                var airdate = new Date(eachshow.airdate);
                                eachshow.nicedate = airdate.getDate() + ' ' + monthNames[airdate.getMonth()] + ' ' +airdate.getFullYear();
                                later.push(eachshow);
                                }
                        });
                        $scope.coming = later;
                });
		}

});
}

controllers.SabDLList = function ($scope, Session, xmlFactory, jsonFactory, $localStorage) {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	if(dd<10) {
	    dd='0'+dd
	} 
	if(mm<10) {
        	mm='0'+mm
	} 
	$scope.today =  yyyy+'-'+mm+'-'+dd;
	//get settings first
	jsonFactory.getJSONAsync('intranet/settings.json', function(results){
		$scope.settings = results;
		if ($scope.settings.sickMissed) {
			$scope.sicktype = 'missed';
		}
		else {
			$scope.sicktype = 'today';
		}
		//if transmission
		if ($scope.settings.transmission) {	
		$scope.session = undefined; 
		$scope.torrents = [];
		$scope.ipAddress = $scope.settings.transmissionURL;
		$scope.listSettings = function() {
		      return settingsBuilder($scope.$storage);
		};
  $scope.$storage = $localStorage.$default({
        downloadDir: true,
        rateUpload: true,
        eta: false,
        totalSize: true,
        status: true,
        remove: true,
        uploadedEver: true,
  });
Session.listTorrents($scope.session, $scope.ipAddress, $scope.listSettings()).then(function(data) {
      if (angular.isString(data)) {
        $scope.session = data;
      } else {
        $scope.torrents = data['arguments']['torrents'];
      }
      });
     } 
		//get sab downrload queue
		if ($scope.settings.sabnzbd) {
		xmlFactory.getXMLAsync(results.sabnzbdURL+'api?mode=qstatus&output=xml&apikey='+results.sabnzbdAPI, function(results){
		$scope.sabdl = results.queue.jobs.job;
		angular.forEach($scope.sabdl, function(eachjob) {
			eachjob.mbprog = eachjob.mb - eachjob.mbleft;
			eachjob.percent =Math.round( eachjob.mbprog / eachjob.mb * 100);
		});
		$scope.sabstatus = results.queue;
		});
		//get sab history
		xmlFactory.getXMLAsync(results.sabnzbdURL+'api?mode=history&start=0&limit=5&output=xml&apikey='+results.sabnzbdAPI, function(results){
			$scope.sabhistory = results.history.slots.slot;
		});
		}
		//get todays shows
		if ($scope.settings.sickbeard) {
		jsonFactory.getJSONAsync($scope.settings.sickbeardURL+'api/'+$scope.settings.sickbeardAPI+'/?cmd=future&sort=date&type='+$scope.sicktype, function(results){
			var sbtoday = [];
			if ($scope.settings.sickMissed) {
			angular.forEach(results.data.missed, function(eachshow){
				sbtoday.push(eachshow);
			});
			} else { 
			angular.forEach(results.data.today, function(eachshow){
				 if (eachshow.airdate == $scope.today) {
				 	sbtoday.push(eachshow);
				 }
			});
			}
			$scope.sbtoday = sbtoday;
		});
		jsonFactory.getJSONAsync($scope.settings.sickbeardURL+'api/'+$scope.settings.sickbeardAPI+'/?cmd=history&limit=50', function(results){
			var sbgot = [];
			angular.forEach(results.data, function(eachshow){
				if ((eachshow.date.substring(0,10) == $scope.today)&&(eachshow.status == "Snatched")) {
					if (eachshow.quality == "HD TV") {
						eachshow.quality="hd";
					} else if (eachshow.quality == "SD TV") {
						eachshow.quality="sd";
					} else {
						eachshow.quality="";
					}
					sbgot.push(eachshow);
				}
			});
			$scope.sbgot = sbgot;
		});
		}
	});
   }

usenetApp.controller(controllers);

