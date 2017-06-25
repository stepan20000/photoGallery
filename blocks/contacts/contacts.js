$(document).ready(function() {  
  
  var map;
  function myMap() {
    var mapCanvas = $(".contacts__map")[0];
    if($( window ).width() > 800) {
      $(mapCanvas).css("width", $( window ).width() * 0.6);
    }
    else {
      $(mapCanvas).css("width", $( window ).width() * 0.85);
    }
    var myCenter = new google.maps.LatLng(50.4284415, 30.4766053);
    var mapOptions = {center: myCenter, zoom: 15};
    map = new google.maps.Map(mapCanvas, mapOptions);
// Add marker
    var marker = new google.maps.Marker({position:myCenter});
    marker.setMap(map);
    var infowindow;
//Add info window and increase zoom when marker is clicked
    google.maps.event.addListener(marker,'click',function() {
      var zm = map.getZoom();
      map.setZoom(6);
      map.setCenter(marker.getPosition());
      if(!infowindow){
        infowindow = new google.maps.InfoWindow({
          content: "We are here!"
        });
        infowindow.open(map,marker);
      }
//Set zoom back after 3s
      window.setTimeout(function() {map.setZoom(zm);},3000);
    });
  }
  
  navFun();
  myMap();
});
