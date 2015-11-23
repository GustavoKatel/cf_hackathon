// TODO angular service
var mrCoordinates = [];
var mrRotas = [];

var mrMaps = {};

var mrOrigin = {};

google.maps.event.addDomListener(window, 'load', mrInit);

function mrInit() {
  $.getJSON("data/paradas.json", function( data ) {
      mrCoordinates = data.coordinates;
      $.getJSON('data/rotas.json', function( data ) {
        mrRotas = data;
        mrGetLocation();
        mrMapsInit();
        mrButtonsInit();
      });
  });
}

function mrMapsInit() {
  $('maparota').each(function( index ) {
    $(this).append('<div class="maparota-map" style="width:'+$(this).attr('width')+';height:'+$(this).attr('height')+';"></div>');

    var map_tag = $(this).children('.maparota-map')[0];

    // definição do mapa
    var pos1 = $(this).attr('origin').split(",");
    var x = parseFloat(pos1[0]);
    var y = parseFloat(pos1[1]);

    var mapProp = {
      center:new google.maps.LatLng(x, y),
      zoom:parseInt($(this).attr('zoom')) || 13,
      mapTypeId:google.maps.MapTypeId.ROADMAP
    };

    var map=new google.maps.Map(map_tag, mapProp);

    if($(this).attr('id')) {
      mrMaps[$(this).attr('id')] = map;
    }

    var latlngbounds = new google.maps.LatLngBounds();

    // marcadores
    $(this).children('marker').each(function( index ) {
      var marker = new google.maps.Marker({
        position: {lat: parseFloat($(this).attr('lat')), lng: parseFloat($(this).attr('lng'))},
        map: map,
        icon: $(this).attr('img'),
        title: $(this).attr('title')
      });
      var m = this;
      marker.addListener('click', function() {
        window.location.href = 'pontoTuristico.html?id='+$(m).attr('id');
      });
      latlngbounds.extend(new google.maps.LatLng(parseFloat($(this).attr('lat')), parseFloat($(this).attr('lng'))));
    });

    // marcador de origem
    var orin_marker = $(this).attr('origin-marker');
    if(orin_marker==undefined) orin_marker = true;
    if(orin_marker==true) {
      var myLatLng = {lat: x, lng: y};
      var OriginMarker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: 'Você está aqui'
      });
      latlngbounds.extend(new google.maps.LatLng(myLatLng.lat, myLatLng.lng));
    }

    // descobrindo parada mais próxima
    var paradas = mrNNearestParada(x, y, 5);

    paradas.forEach(function(parada) {

      var splitCoord = mrCoordinates[parada].split(",");
      var paradaEntradaX = parseFloat(splitCoord[0]);
      var paradaEntradaY = parseFloat(splitCoord[1]);

      //marcador de destino
      var myDestLatLng = {lat: paradaEntradaX, lng: paradaEntradaY};
      var destMarker = new google.maps.Marker({
        position: myDestLatLng,
        map: map,
        title: 'Parada de ônibus',
        icon: 'assets/images/busstop.png'
      });

    });

    var boundaries = $(this).attr('boundaries');
    if(boundaries == 'true' || boundaries == undefined) boundaries = true;
    if(boundaries == true) {
      map.setCenter(latlngbounds.getCenter());
      map.fitBounds(latlngbounds);
    }

  });

}

function mrButtonsInit() {
  $('[data-role="maparota-trace"]').each(function( index ) {

    var mapId = $(this).attr('data-target-map');
    var lat = parseFloat($(this).attr('data-target-lat'));
    var lng = parseFloat($(this).attr('data-target-lng'));

    var map = mrMaps[mapId];

    $(this).on('click', function(ev) {

      var paradaDest = mrNNearestParada(lat, lng, 1)[0];
      var paradaDestCoords = mrCoordinates[paradaDest];
      var paradaDestLat = parseFloat(paradaDestCoords.split(',')[0]);
      var paradaDestLng = parseFloat(paradaDestCoords.split(',')[1]);

      var paradaOrig = mrNNearestParada(mrOrigin.lat, mrOrigin.lng, 1)[0];
      var paradaOrigCoords = mrCoordinates[paradaOrig];
      var paradaOrigLat = parseFloat(paradaOrigCoords.split(',')[0]);
      var paradaOrigLng = parseFloat(paradaOrigCoords.split(',')[1]);

      mrGetStreetName(paradaDestLat, paradaDestLng).then(function(destSt) {

        mrGetStreetName(paradaOrigLat, paradaOrigLng).then(function(origSt) {

          var route = mrGetRoute(origSt, destSt);
          alert(route);

        }).catch(function(err) {
          console.log(err);
        });

      }).catch(function(err) {
        console.log(err);
      });
    });

  });
}

function mrGetBusList(lat, lng) {
  return new Promise(function(resolve, reject) {

    var parada = mrNNearestParada(lat, lng, 1)[0];
    var paradaCoords = mrCoordinates[parada];
    var paradaLat = parseFloat(paradaCoords.split(',')[0]);
    var paradaLng = parseFloat(paradaCoords.split(',')[1]);

    var busList = [];

    mrGetStreetName(paradaLat, paradaLng).then(function(street) {

      Object.keys(mrRotas).forEach(function(bus) {
        if(mrFuzzySearch(mrRotas[bus], street).length>0) {
          busList.push(bus);
        }
      });

      resolve(busList);

    }).catch(reject);

  });

}

function mrNNearestParada(origin_x, origin_y, count) {

    var dists = mrCoordinates.map(function(coord, index) {

      var splitCoord = coord.split(",");
      var destX = parseFloat(splitCoord[0]);
      var destY = parseFloat(splitCoord[1]);

      var p1 = new google.maps.LatLng(origin_x, origin_y);
      var p2 = new google.maps.LatLng(destX, destY);

      return {
        id: index,
        dist: google.maps.geometry.spherical.computeDistanceBetween(p1, p2)
      }

    });

    dists = _.sortBy(dists, function(obj) {
      return obj.dist;
    });

    dists = dists.splice(0, count);

    var ids = dists.map(function(obj) {
      return obj.id;
    });

    return ids;
}

function mrGetStreetName(lat, lng) {
  return new Promise(function(resolve, reject) {

    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location': {lat: lat, lng: lng}}, function(results, status) {
      if (status == 'OK') {

        var street = _.find(results[0].address_components, function(cmp) {
          return _.indexOf(cmp.types, "route") >= 0;
        }).short_name;
        resolve(street);

      } else {
        reject('Geocoder failed due to: ' + status);
      }
    });

  });
}

function mrFuzzySearch(arr, item) {
  var f = new Fuse(arr, {
    caseSensitive: false,
    threshold: 0.3
  });

  var results = f.search(item);
  return results;
}

function mrGetRoute(origStreet, destStreet) {

  var busListBegin = [];
  var busListEnd = [];

  Object.keys(mrRotas).forEach(function(bus) {
    if(mrFuzzySearch(mrRotas[bus], origStreet).length>0 && mrFuzzySearch(mrRotas[bus], 'VARADOURO').length>0) {
      busListBegin.push(bus);
    }
  });

  Object.keys(mrRotas).forEach(function(bus) {
    if(mrFuzzySearch(mrRotas[bus], destStreet).length>0 && mrFuzzySearch(mrRotas[bus], 'VARADOURO').length>0) {
      busListEnd.push(bus);
    }
  });

  return {begin: busListBegin, end: busListEnd};

}

function mrGetLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          mrOrigin = {lat: position.coords.latitude, lng: position.coords.longitude};
        });
    } else {
        alert("FUUUUUU!!!");
    }
}
