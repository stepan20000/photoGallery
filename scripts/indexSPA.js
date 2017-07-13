function indexFun () {
// Remova all old event listeners from the .content      
    $('.content').find('*').off();
//Add the index makeup
    $('.content').html(window.Templates.indexPage);
    $('.nav__link').removeClass('nav__link_current');
    $('.nav__link[href="#index"]').addClass('nav__link_current');
    
// Array of all media sorted in date order newest top
    var mediaDatabase =  users.map(function (user) {
        return user.getMyMedia();
    }).reduce(function (acc, userMedia, index, arr) {
      return acc.concat(userMedia);
    }, []).sort(function (a, b) {
      return b.created_time - a.created_time;
    });
    var l = mediaDatabase.length;
//Number of images in slider
    var sliderSize = 10;
    
//Get 10 random images for slider
    var rand = Math.floor(Math.random() * l);
    var sliderImages = [];
    for(var i = 0; i < sliderSize && i < l; i++) {
      sliderImages.push(mediaDatabase[(i + rand) % l].getImage('standard', 'slider__slide'));
    }    

    var mySlider = new Slider($('#slider'), sliderImages);
    
// Get all images from databaise for mozaik
    var mozaikImages = [];
    
    for(var i = 0; i < l; i++) {
      mozaikImages.push(mediaDatabase[i].getImage('thumbnail', 'mozaik__image'));
    }  
    
    var myMozaik = new Mozaik($('.mozaik__container')[0], mozaikImages);
}

function allPhotoFun (){
// Remova all old event listeners from the .content      
    $('.content').find('*').off();
//Add the all-photo makeup
    $('.content').html(window.Templates.allPhotoPage);
    $('.nav__link').removeClass('nav__link_current');
    $('.nav__link[href="#all-photo"]').addClass('nav__link_current');
    var allPhoto= new AllPhoto($(".all-photo")[0]); 
}

function findFun (){
// Remova all old event listeners from the .content      
    $('.content').find('*').off();
    $('.content').html(window.Templates.findPage);
    $('.nav__link').removeClass('nav__link_current');
    $('.nav__link[href="#find"]').addClass('nav__link_current');

    var find = new Find($('.find')[0]);
    console.log(users);
}
 
function contactsFun () {
// Remova all old event listeners from the .content      
    $('.content').find('*').off();
    $('.content').html(window.Templates.contactsPage);
    $('.nav__link').removeClass('nav__link_current');
    $('.nav__link[href="#contacts"]').addClass('nav__link_current');
// Make the map 
//    var map1;
//    var mapScript = document.createElement("script");
//    mapScript.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA1YG3ps-5l9rhQzO5bYc3GWAt0EeZ2pi4&callback=initMap";
//    mapScript.type="text/javascript";
//    document.head.appendChild(mapScript);
  initMap();
}
// Setup router 
var router = new Router();
router.route('index', indexFun);
router.route('all-photo', allPhotoFun);
router.route('find', findFun);
router.route('contacts', contactsFun);
router.route('', indexFun);


function initMap () {
  console.log('initMap');
  var mapCanvas = document.getElementById('map');
    if($( window ).width() > 800) {
      $(mapCanvas).css("width", $( window ).width() * 0.6);
    }
    else {
      $(mapCanvas).css("width", $( window ).width() * 0.85);
    }
  var myCenter = new google.maps.LatLng(50.4284415, 30.4766053);
  var mapOptions = {center: myCenter, zoom: 15};
  map1 = new google.maps.Map(mapCanvas, mapOptions);
// Add marker
  var marker = new google.maps.Marker({position:myCenter});
  marker.setMap(map1);
  var infowindow;
//Add info window and increase zoom when marker is clicked
  google.maps.event.addListener(marker,'click',function() {
    var zm = map1.getZoom();
    map1.setZoom(6);
    map1.setCenter(marker.getPosition());
    if(!infowindow){
      infowindow = new google.maps.InfoWindow({
        content: "We are here!"
      });
      infowindow.open(map1,marker);
    }
//Set zoom back after 3s
    window.setTimeout(function() {map1.setZoom(zm);},3000);
  });     
}

function loggedDialog () {

}

function loginDialog () {
  var dialogForm = $('<form id="login-form" class="form" action="#">' +
    '<h5 class="form__head">Log into PhotoGallery</h5>' +
    '<p class="form__wrong">Wrong Login or Password</p>' +
    '<input type="text" id="login__username" name="username" class="form__input form__input_login" size="21"' +       'maxlength="50" placeholder="USERNAME" pattern="^\\w{6,20}$"  required>' +
    '<input type="password" id="login__password" name="psw" class="form__input form__input_psw" size="21"' + 'maxlength="50" placeholder="PASSWORD" pattern="^\\w{6,20}$" required>' +
    '<input type="submit" class="btn btn_large" value="Login">' +  
    '<span id="dialog-window-close" href="#" class="close" title="Close login form">✕</span>' +      
  '</form>');
  
  $('.dialog-window__content').html(dialogForm);
  $('.dialog-window').fadeIn();
  
  $('#login-form').on('submit', function (evt) {
  evt.preventDefault();
// Take username and password from input field
  var username = $('#login__username').val();
  var password = $('#login__password').val();

  if(makeLogin(username, password)) {
    displayLoggedUser();
  } else {
    displayLoginError();
  }
});
}

function loggedDialog () {
  $('.dialog-window__content').html('<button id="loadPhoto" class="btn btn_large">Load Photo</button>' +
  '<button id="logOut" class="btn btn_large">Log out</button>');
  $('.dialog-window').fadeIn();

  $('#logOut').on('click', function () {
    localStorage.storedLoggedUser = '0';
    loggedUser = false;
    displayNoLoggedUser();
  });
}

function makeLogin (username, password) {
  var usr;
// Searcvh for a user with such username
  for(var i = 0; i < users.length; i++){
    if(users[i].username === username) {
      usr = users[i];
      break;
    }
  }
  if(usr === undefined) {
    return false;
  }
// Check the password
  if(usr.psw == password) {
    loggedUser = usr;
    localStorage.setItem('storedLoggedUser', loggedUser.id);
    return true;
  } else {
    return false;;
  }
}  

function displayLoginError () {
  console.log('displayLoginError');
  $('#login-form .form__wrong').fadeIn();
}

function displayLoggedUser () {
// Show success dialog window for 1.5 second
  $('.dialog-window__content').html('<p class="dialog-window__success">You successfully logged in</p>' + 
    '<span id="dialog-window-close" href="#" class="close" title="Close login form">✕</span>');
  setTimeout(function () {
    $('.dialog-window').fadeOut();
  }, 1500);
  
// Show user's profile photo on the navbar
  $('#nav-login').html('<img class="nav__profile-photo" src="' + loggedUser.profile_picture + '" alt="' + 
    loggedUser.full_name + ' profile photo">');
}

function displayNoLoggedUser () {
  $('#nav-login').html('Log in');
  $('.dialog-window').fadeOut();
}

function startSPA () {
// Separately start navFun because it should be started only once
  $(document).ready(function () {
    navFun();
// Go to correct route when SPA starts
    if (window.location.hash == '') {
      router.toPath('index');
    } else {
      router.toPath(window.location.hash.slice(1));
    }
    
// Check for loggeUser stored in local storage. We store the id of loggedUser or 0
    if(localStorage.storedLoggedUser) {
      if(localStorage.storedLoggedUser != '0'){
        for(var i = 0; i < users.length; i++) {
          if(localStorage.storedLoggedUser == users[i].id){
            loggedUser = users[i];
            break;
          }
        }
        if(!loggedUser) {
          displayNoLoggedUser();   
        } else {
          displayLoggedUser();
        }
      } else {
        displayNoLoggedUser();  
      }
    } else {
      displayNoLoggedUser();
    }


    // Start routing
    window.onhashchange = function(evt) {
      evt.preventDefault();
      console.log('onhachchange');
      console.log(window.location.hash.slice(1));
      router.toPath(window.location.hash.slice(1));
    };  
  });
}

start(startSPA);

  