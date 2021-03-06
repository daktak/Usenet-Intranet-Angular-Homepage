'use strict';

var app = angular.module('usenetApp.sessions', []);

app.config(["$httpProvider", function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

var baseUrl = function (ip) {
  return 'http://' + ip + '/transmission/rpc';
}

app.factory('Session', ["$http","$q","$base64",function($http, $q, $base64) {
  var ipAddress = '192.168.1.1';
  var methods = {};

  methods.listSettings = function(sessionId, ipAddress) {
    var deferSettingList = $q.defer();
    var postData = {'method': 'session-get'};
    $http({
          url: baseUrl(ipAddress),
          method: "POST",
          data: postData,
          headers: {'X-Transmission-Session-Id': sessionId}
    })
    .success(function(data, status, headers, config) {
      deferSettingList.resolve(data);
    }).
      error(function(_data_, _status_, headers, _config_) {
      deferSettingList.resolve(headers()['x-transmission-session-id']);
    });
    return deferSettingList.promise;
  };

  methods.listTorrents = function(sessionId, ipAddress, settings) {
    var deferList = $q.defer();
    var postData = {'arguments': { 'fields': settings}, 'method': 'torrent-get'};
    $http({
          url: baseUrl(ipAddress),
          method: "POST",
          data: postData,
          headers: {'X-Transmission-Session-Id': sessionId}
    })
    .success(function(data, status, headers, config) {
      deferList.resolve(data);
    }).
      error(function(_data_, _status_, headers, _config_) {
      deferList.resolve(headers()['x-transmission-session-id']);
    });
    return deferList.promise;
  };

  methods.torrentStats = function(sessionId, ipAddress) {
    var deferStats = $q.defer();
    var postData = {'arguments': {'fields': 'cumulative-stats'}, 'method': 'session-stats'};
    $http({
          url: baseUrl(ipAddress),
          method: "POST",
          data: postData,
          headers: {'X-Transmission-Session-Id': sessionId}
    })
    .success(function(data, status, headers, config) {
      deferStats.resolve(data);
    }).
      error(function(_data_, _status_, headers, _config_) {
      deferStats.resolve(headers()['x-transmission-session-id']);
    });
    return deferStats.promise;
  };

  methods.addTorrent = function(sessionId, ipAddress, inputFile) {
    var deferAdd = $q.defer();
    var metainfo = $base64.encode(inputFile);
    var postData = {'arguments': { 'metainfo' : metainfo }, 'method': 'torrent-add'};
    $http({
          url: baseUrl(ipAddress),
          method: "POST",
          data: postData,
          headers: {'X-Transmission-Session-Id': sessionId}
    })
    .success(function(data) {
      deferAdd.resolve(data);
    })
    .error(function(_data_, _status_, headers, _config_) {
      deferAdd.resolve(headers()['x-transmission-session-id']);
    });
    return deferAdd.promise;
  };

  methods.stopTorrent = function(sessionId, ipAddress, id) {
    var deferStop = $q.defer();
    var postData = {'arguments': { 'ids' : id }, 'method': 'torrent-stop'};
    $http({
          url: baseUrl(ipAddress),
          method: "POST",
          data: postData,
          headers: {'X-Transmission-Session-Id': sessionId}
    })
    .success(function(data) {
      deferStop.resolve(data);
    })
    .error(function(_data_, _status_, headers, _config_) {
      deferStop.resolve(headers()['x-transmission-session-id']);
    });
    return deferStop.promise;
  };


  methods.restartTorrent = function(sessionId, ipAddress, id) {
    var deferRestart = $q.defer();
    var postData = {'arguments': { 'ids' : id }, 'method': 'torrent-start-now'};
    $http({
          url: baseUrl(ipAddress),
          method: "POST",
          data: postData,
          headers: {'X-Transmission-Session-Id': sessionId}
    })
    .success(function(data) {
      deferRestart.resolve(data);
    })
    .error(function(_data_, _status_, headers, _config_) {
      deferRestart.resolve(headers()['x-transmission-session-id']);
    });
    return deferRestart.promise;
  };

  methods.removeTorrent = function(sessionId, ipAddress, id) {
    var deferRemove = $q.defer();
    var postData = {'arguments': { 'ids' : id, 'delete-local-data' : true }, 'method': 'torrent-remove'};
    $http({
          url: baseUrl(ipAddress),
          method: "POST",
          data: postData,
          headers: {'X-Transmission-Session-Id': sessionId}
    })
    .success(function(data) {
      deferRemove.resolve(data);
    })
    .error(function(_data_, _status_, headers, _config_) {
      deferRemove.resolve(headers()['x-transmission-session-id']);
    });
    return deferRemove.promise;
  };

  return methods;
}]);


