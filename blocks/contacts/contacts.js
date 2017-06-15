
function myMap() {
  var mapCanvas = document.getElementById("map");
  var myCenter = new google.maps.LatLng(50.4284415, 30.4766053);
  var mapOption = {
    center: myCenter,
    zoom: 7,
  }
  var map = new google.maps.Map(mapCanvas, mapOption);
  marker = new google.maps.Marker({position: myCenter});
  marker.setMap(map);
}

//google.maps.event.addDomListener(window, 'load', myMap);
