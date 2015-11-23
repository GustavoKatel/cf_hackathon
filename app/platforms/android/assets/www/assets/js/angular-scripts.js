angular.module('cf_hackathon', [], function($locationProvider) {

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

})

.run(function($rootScope) {

})

.factory('guia', function($http) {

  return new Promise(function(resolve, reject) {

    $http.get('data/guia.json').then(function(response) {
      resolve(response.data);
    }).catch(reject);

  });

})

.factory('location', function($window) {
  return new Promise(function(resolve, reject) {

    if ($window.navigator.geolocation) {
        $window.navigator.geolocation.getCurrentPosition(function(position) {
          resolve({lat: position.coords.latitude, lng: position.coords.longitude});
        });
    } else {
        reject("FUUUUUU!!!");
    }

  });
})

.factory('_', function($window) {
  return $window._;
})

.controller('mainMapCtrl', function($scope, guia, location) {

  $scope.origin = {}

  $scope.pontos = [];

  guia.then(function(dados) {
    $scope.pontos = dados.pontos;
    $scope.$apply();
  });

  location.then(function(point) {
    $scope.origin.lat = point.lat;
    $scope.origin.lng = point.lng;
    $scope.$apply();
  });

})

.controller('navbarCtrl', function($scope, $window, guia, _) {

  $scope.doQRcode = function() {

    $window.cordova.plugins.barcodeScanner.scan(
      function (result) {
          if(result.format=='QR_CODE') {

            guia.then(function(data) {
              var ponto = _.find(data.pontos, function(ponto) {
                return ponto.id == result.text;
              });

              $window.location.href = "pontoTuristico.html?id="+ponto.id;

            });

          }
      },
      function (error) {
          alert("Scanning failed: " + error);
      }
   );

  };
})

.controller('pontoTuristicoCtrl', function($scope, $window, $location, _, guia, location) {

  var id = $location.search().id;

  $scope.ponto = {};
  $scope.orig = {};

  $scope.closestStreet = '';

  $scope.routes = '';

  $scope.zero = {};

  guia.then(function(data) {
    $scope.ponto = _.find(data.pontos, function(ponto) {
      return ponto.id == id;
    });
    $scope.orig.lat = ''+ (parseFloat($scope.ponto.lat)+0.0006);
    $scope.orig.lng = $scope.ponto.lng;
    $scope.$apply();
  });

  location.then(function(latlng) {
    $scope.zero = latlng;
    $scope.$apply();
  });

  $scope.openHome = function() {
    $window.location.href = "index.html";
  };

  $scope.openOnibus = function() {
    location.then(function(latlng) {
      var parada = mrNNearestParada(latlng.lat, latlng.lng, 1);
      var coords = mrCoordinates[parada].split(',');
      mrGetStreetName(parseFloat(coords[0]), parseFloat(coords[1])).then(function(st) {
        $scope.closestStreet = st;

        mrGetStreetName(parseFloat($scope.ponto.lat), parseFloat($scope.ponto.lng)).then(function(st2){
          var routes = mrGetRoute(st, st2);
          $scope.routes = routes.begin[0] + '-> Integração -> ' + (routes.end[0] || '');
          $scope.$apply();
          $window.$('#myModal_A').modal('toggle').on('shown.bs.modal', function(e) {
            var map = mrMaps['modal-map'];
            google.maps.event.trigger(map,'resize');
            var latlngbounds = new google.maps.LatLngBounds();
            latlngbounds.extend(new google.maps.LatLng($scope.orig.lat, $scope.orig.lng));

            var paradas = mrNNearestParada($scope.orig.lat, $scope.orig.lng, 5);

            paradas.forEach(function(parada) {
              var splitCoord = mrCoordinates[parada].split(",");
              var paradaEntradaX = parseFloat(splitCoord[0]);
              var paradaEntradaY = parseFloat(splitCoord[1]);

              //marcador de destino
              var myLatLng = {lat: paradaEntradaX, lng: paradaEntradaY};
              latlngbounds.extend(new google.maps.LatLng(myLatLng.lat, myLatLng.lng));
            });

            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);

          });
        });

      });
    });
  };

  $scope.openMidia = function() {
    $window.location.href = "midia.html?id="+$scope.ponto.id;
  }

})

.controller('onibusCtrl', function($scope, $window, $location, _, guia) {

  var id = $location.search().id;

  $scope.ponto = {};
  $scope.orig = {};

  guia.then(function(data) {
    $scope.ponto = _.find(data.pontos, function(ponto) {
      return ponto.id == id;
    });
    $scope.orig.lat = ''+ (parseFloat($scope.ponto.lat)+0.0006);
    $scope.orig.lng = $scope.ponto.lng;
    $scope.$apply();
  });



})
