//ID's of users who gave access to their accounts
var userIds = [5604673568, 5611812646, 5612036694, 5617349057, 222066133];
// Instagram's access token
var token = '5604673568.7436976.80a61fbf539244dbab7f434b32ece141';
// In Sandbox mode we can only load maximum 20 media per request
var numPhotos = 20;
//The interval after which the data is considered to be obsolete and loaded again (30 min)
var relevanceInterval = 1800000;
// The array with user's info and media obtained from instagram API
var users;
//loggedUser is a refference to the user object which is logged in now
var loggedUser = false;
// Global variables for mediaContainers objects
var allPhoto, find;
// Flag used for calling initMap function only once
var mapInited = false;

var noLoacalStorage = false;


// Take a array with user's ids and create corresponding objects. After that elements in users array are instance of myUser
users = userIds.map(function (id) {
  return new MyUser(id);
});

// indexFun, allPhotoFun, findFun, contactsFun are used in router.
// The fadeOut not neaded .content div  ans fadeIn neaded .contant div 
// contactsFun also call initMap() 
function indexFun () {
// Adjust navigation bar
  $('.nav__link').removeClass('nav__link_current');
  $('.nav__link[href="#index"]').addClass('nav__link_current');
// Switch off all containers and switch on needed index container
  $('.content').fadeOut();
  $('#indexPage').fadeIn();
}

function allPhotoFun () {
  // Adjust navigation bar
  $('.nav__link').removeClass('nav__link_current');
  $('.nav__link[href="#all-photo"]').addClass('nav__link_current');
// Switch off all containers and switch on needed index container
  $('.content').fadeOut();
  $('#allPhotoPage').fadeIn();
}

function gridFun () {
  // Adjust navigation bar
  $('.nav__link').removeClass('nav__link_current');
  $('.nav__link[href="#grid"]').addClass('nav__link_current');
// Switch off all containers and switch on needed index container
  $('.content').fadeOut();
  $('#gridPage').fadeIn();
}

function findFun () {
  // Adjust navigation bar
  $('.nav__link').removeClass('nav__link_current');
  $('.nav__link[href="#find"]').addClass('nav__link_current');
  // Switch off all containers and switch on needed index container
  $('.content').fadeOut();
  $('#findPage').fadeIn();
}
 
function contactsFun () {
  // Adjust navigation bar
  $('.nav__link').removeClass('nav__link_current');
  $('.nav__link[href="#contacts"]').addClass('nav__link_current');
    // Switch off all containers and switch on needed index container
  $('.content').fadeOut();
  $('#contactsPage').fadeIn();
  if(!mapInited) {
    initMap();
    mapInited = true;
  }
}

// Init index page 
function initIndex () {
// Array of all media sorted in date order newest top. mediaDatabase is used only on the
// index page for making slider and mozaik
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

function initMap () {
  var mapCanvas = document.getElementById('map');
// Adjust the map container  according to window.width
  if($( window ).width() > 800) {
    $(mapCanvas).css("width", $( window ).width() * 0.6);
  } else {
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

// When nobody is logged now and user click #nav-login 'login dialog flow' starts. 
// This function maintain 'login dialog flow'
function loginDialog () {
  var dialogForm = $('<form id="login-form" class="form" method="POST"  enctype="multipart/form-data" action="#">' +
    '<h5 class="form__head">Log into PhotoGallery</h5>' +
    '<p class="form__wrong"></p>' +
    '<input type="text" id="login__username" name="username" class="form__input form__input_login" size="21"' +       
    'maxlength="50" placeholder="USERNAME" pattern="^\\w{6,20}$"  required>' +
    '<input type="password" id="login__password" name="psw"' + 
    'class="form__input form__input_psw" size="21"' + 
    'maxlength="50" placeholder="PASSWORD" pattern="^\\w{6,20}$" required>' +
    '<input type="submit" class="btn btn_large" value="Login">' +  
    '<span id="dialog-window-close" href="#" class="close" title="Close login form">✕</span>' + 
  '</form>');
  
  $('.dialog-window__content').html(dialogForm);
  $('.dialog-window__content').removeClass('dialog-window__content_large');
  $('.dialog-window').fadeIn();
  
  $('#login-form').on('submit', function (evt) {
    evt.preventDefault();
  // Take username and password from input field
    var username = $('#login__username').val();
    var password = $('#login__password').val();
// Check if username and password and then login the user or display error
    if(makeLogin(username, password)) {
      displayInfoWindow('You successfully logged in');
      displayLoggedUser();
    } else {
      displayFormError('Wrong Login or Password');
    }
  });
}

// When some user is logged and click #nav-login 'logged dialog flow' starts. 
// This function maintain 'loged dialog flow'
function loggedDialog () {
  $('.dialog-window__content').html('<button id="loadPhoto" class="btn btn_large">Load Photo</button>' +
  '<button id="logOut" class="btn btn_large">Log out</button>' + 
  '<span id="dialog-window-close" href="#" class="close" title="Close login form">✕</span>');
  $('.dialog-window__content').removeClass('dialog-window__content_large');
  $('.dialog-window').fadeIn();

  $('#logOut').on('click', function () {
    localStorage.storedLoggedUser = '0';
    loggedUser = false;
    displayNoLoggedUser();
  });
  
  $('#loadPhoto').on('click', function (evt) {
    loadPhotoDialog();
  });
}

function checkFileName (name) {
  var validFileExtensions = ["jpg", "jpeg", "bmp", "gif", "png"];    
  if(name.split('.').length != 2) {
    return false;
  }
  if(name.split('.')[0] == '') {
    return false;
  }
  if(validFileExtensions.indexOf(name.split('.')[1]) < 0){
    return false;
  }
  if(/[^\wА-Яа-я-_.\s]/.test(name)) {
    return false;
  }
  return true;
}

function loadPhotoDialog () {
  var file;
  var loadPhotoForm = $('<form id="loadPhoto-form" class="form" method="POST" enctype="multipart/form-data"' +      'action="#">' +
    '<h5 class="form__head">Load photo</h5>' +
    '<p class="form__instruction">Some instruction</p>' +  
    '<p class="form__wrong"></p>' +
    '<textarea id="newPhotoDesc" name="newPhotoDesc" class="form__input form__input_textarea" cols="50"' +       
    'rows="10" maxlength="1000" placeholder="Add description"></textarea>' +
    '<input type="file" id="loadFile" name="loadFile" class="form__input form__input_file" required>' +
    '<input type="submit" class="btn btn_large" value="Load" disabled>' +  
    '<span id="dialog-window-close" href="#" class="close" title="Close form">✕</span>' +      
  '</form>');
  $('.dialog-window__content').addClass('dialog-window__content_large');
  $('.dialog-window__content').html(loadPhotoForm);
  
  $('#loadFile').on('change', function () {
    file = this.files[0];
    if(checkFileName(file.name)) {
      $('#loadPhoto-form input[type="submit"]').attr("disabled", false);
      hideFormError();   
    } else {
      displayFormError('Allowed file extensions: jpg, jpeg, bmp, gif, png');
    }
  });
  
  $('#loadPhoto-form input[type="submit"]').on('click', function (evt) {
    evt.preventDefault();
    var x = $('#newPhotoDesc').val();
    var reader = new FileReader();
    reader.onload = function (event) {
      loggedUser.addMedia(x, reader.result);
      allPhoto.refresh();
      find.reset();
    };
    reader.readAsDataURL(file);
    displayInfoWindow('Done');
  });
}


function makeLogin (username, password) {
  var usr;
// Search for a user with such username
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

function hideFormError () {
  $('.form__wrong').fadeOut();
}

function displayFormError (error) {
  $('.form__wrong').html(error);
  $('.form__wrong').fadeIn();
}

function displayInfoWindow (str) {
  $('.dialog-window__content').removeClass('dialog-window__content_large');
// Show success dialog window for 1.5 second
  $('.dialog-window__content').html('<p class="dialog-window__success">' + str + '</p>' + 
    '<span id="dialog-window-close" href="#" class="close" title="Close login form">✕</span>');
  $('.dialog-window').fadeIn();
  setTimeout(function () {
    $('.dialog-window').fadeOut();
  }, 1500);
}

function displayLoggedUser () {
// Show user's profile photo on the navbar
  $('#nav-login').html('<img class="nav__profile-photo" src="' + loggedUser.profile_picture + '" alt="' + 
    loggedUser.full_name + ' profile photo">');
 // $('.dialog-window').fadeOut();
}

function displayNoLoggedUser () {
  $('#nav-login').html('Log in');
  $('.dialog-window').fadeOut();
}

// The first function which called when application started
function startSPA () {
  // Setup router 
  var router = new Router();
  router.route('index', indexFun);
  router.route('all-photo', allPhotoFun);
  router.route('grid', gridFun);
  router.route('find', findFun);
  router.route('contacts', contactsFun);
  router.route('', indexFun);
  router.route('!Services', function () {return;})
  //router.notFound(indexFun);
  
  $(document).ready(function () {
//Start navigation logic in navbar
    navFun();

// Make correspondding make up in each containners using templates
    $('#indexPage').html(window.Templates.indexPage);
    $('#allPhotoPage').html(window.Templates.allPhotoPage);
    $('#gridPage').html(window.Templates.gridPage);
    $('#findPage').html(window.Templates.findPage);
    $('#contactsPage').html(window.Templates.contactsPage);
    
// Make index page with slider and mozaik
    initIndex();
// Make all photo
    allPhoto= new AllPhoto($(".all-photo")[0]);
// Make grid
    grid = new Grid($('.grid')[0]);
// Make find 
    find = new Find($('.find')[0]);
    
    router.toPath(window.location.hash.slice(1));
    
// Check for loggedUser stored in local storage. We store the id of loggedUser or 0 if there is no logged user
    if(noLoacalStorage) {
      displayNoLoggedUser(); 
    } else {
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
    }
    

    // Start routing
    window.onhashchange = function(evt) {
      evt.preventDefault();
      router.toPath(window.location.hash.slice(1));
    };  
  });
}

getData(startSPA);

  