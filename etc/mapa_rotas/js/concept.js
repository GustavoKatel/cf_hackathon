var coordinates;
$.getJSON( "https://dl.dropboxusercontent.com/u/93930714/campus/json/paradas3", function( data ) {
    //var coordinates = $.parseJSON(data);
    coordinates = data.coordinates;
});

google.maps.event.addDomListener(window, 'load', getLocation);

var origin;

// inicializa o mapa e os marcadores
function initialize() {

    // definição do mapa
    var pos1 = origin.split(",");
    var x = parseFloat(pos1[0]);
    var y = parseFloat(pos1[1]);

    var mapProp = {
      center:new google.maps.LatLng(x, y),
      zoom:13,
      mapTypeId:google.maps.MapTypeId.ROADMAP
    };
    var map=new google.maps.Map(document.getElementById("googleMap"), mapProp);

    // marcador de origem
    var myLatLng = {lat: x, lng: y};
    var OriginMarker = new google.maps.Marker({
      position: myLatLng,
      map: map,
      title: 'Origem!'
    });

    // descobrindo parada mais próxima
    var parada = nearestParada(x, y);

    var splitCoord = coordinates[parada].split(",");
    var paradaEntradaX = parseFloat(splitCoord[0]);
    var paradaEntradaY = parseFloat(splitCoord[1]);

    //marcador de destino
    var myDestLatLng = {lat: paradaEntradaX, lng: paradaEntradaY};
    var destMarker = new google.maps.Marker({
      position: myDestLatLng,
      map: map,
      title: 'Destino!'
    });
    /**/
    var latlngbounds = new LatLngBounds();
    latlngbounds.extend(myDestLatLng);
    latlngbounds.extend(myLatLng);

    map.setCenter(latlngbounds.getCenter(), map.getBoundsZoomLevel(latlngbounds));
}

function nearestParada(origin_x, origin_y){
    var nearestID = 0;
    var nearestDistance;

    var splitCoord = coordinates[0].split(",");
    var destX = parseFloat(splitCoord[0]);
    var destY = parseFloat(splitCoord[1]);
    var currentDistance;

    var p1 = new google.maps.LatLng(origin_x, origin_y);
    var p2 = new google.maps.LatLng(destX, destY);
    nearestDistance = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);

    $.each(coordinates, function(key, val){
        splitCoord = val.split(",");
        destX = parseFloat(splitCoord[0]);
        destY = parseFloat(splitCoord[1]);

        p2 = new google.maps.LatLng(destX, destY);
        currentDistance = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
        if(currentDistance < nearestDistance){
            nearestDistance = currentDistance;
            nearestID = key;
        }
    });

    return nearestID;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("FUUUUUU!!!");
    }
}

function showPosition(position) {
    origin = "" + position.coords.latitude + "," + position.coords.longitude;
    initialize();
}
