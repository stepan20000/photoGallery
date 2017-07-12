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
// The link to logged user object or false
var loggedUser = false;

//Save users[] with all data to the session storage and also add timestamp for detecting when data is expired
function saveUsersData(data) {
  if (typeof(Storage) !== "undefined") {
    sessionStorage.setItem("photoAlbumData", JSON.stringify(data));
    sessionStorage.setItem("timestamp", String(Date.now()));
  } 
  else {
    alert("Sorry! No Web Storage support..");
    return;
  }
}



// -------------------- USER --------------------------------------
function User (id) {
  this.id = id;
}

User.prototype.takeMyInfo = function () {
  return $.ajax({
    url: 'https://api.instagram.com/v1/users/' + this.id,
    dataType: 'jsonp',
    type: 'GET',
    data: {access_token: token}
  });
}

User.prototype.saveMyInfo = function (data) {
  var keys = Object.keys(data.data);
  for(var i in keys) {
    this[keys[i]] = data.data[keys[i]];
  }
}

User.prototype.takeMyMedias = function () {
  return $.ajax({
    url: 'https://api.instagram.com/v1/users/' + this.id + '/media/recent',
    dataType: 'jsonp',
    type: 'GET',
    data: {access_token: token, count: numPhotos}
  });
}

User.prototype.saveMyMedias = function (data) {
  this._mediaList = data.data;
  this._mediaList.forEach(function (el) {
    if(el.type == 'carousel') {
      Object.setPrototypeOf(el, Carousel.prototype);
    }
    else if(el.type == 'image') {
      Object.setPrototypeOf(el, Image.prototype);
    } 
  });
}

User.prototype.getMyMedia = function () {
  return this._mediaList;
}

User.prototype.getMediaWithTag = function (tag) {
  return this._mediaList.filter(function (media) {
    return media.tags.some(function (el) {
      return el == tag;
    });
  });
}
                                
// ------------------------- END USER --------------------------------

// ------------------------- MEDIA ----------------------------------

function Media (media) {

}

Media.prototype.getImage = function (size, classImg) {
  var src;
  var alt = this.getTags().join(' ');
  switch (size) {
    case 'low':
      src = this.images.low_resolution.url;
      break;
    case 'standard':
      src =  this.images.standard_resolution.url;
      break;
    case 'thumbnail':
      src =  this.images.thumbnail.url;
      break;
    default:
      src =  this.images.standard_resolution.url;
  }
  return '<img class="' + classImg + '" src="' + src + '" alt="' + alt + '">';
}

Media.prototype.getTags = function () {
  return this.tags;
}

Media.prototype.getImageAsLink = function (size, classA, classImg) {
  var img = this.getImage(size, classImg);
  return '<a class="' + classA +  '"  href="' + this.images.standard_resolution.url + '" target="_blank">' 
    + img +  '</a>';
}

Media.prototype.setLike = function (el) {
  console.log('set like');
  var _this = this;
  $(el).removeClass('like_active');
  _this.user_has_liked = true;
  $(el).html(++this.likes.count);
  console.log('setLike', el);
  $.ajax({
    url: 'https://api.instagram.com/v1/media/' + _this.id + '/likes',
    dataType: "json",
    data: {
        access_token: token,
        _method: 'POST'
    },
    crossDomain: true,
    type: "POST",
    success: function(data) {},
    error: function(data) {}
  });
}
  
  
Media.prototype.removeLike = function (el) {
  var _this = this;
  console.log('remove like');
  $(el).addClass('like_active');
  this.user_has_liked = false;
  $(el).html(--this.likes.count);
  console.log('removeLike', el);
  $.ajax({
    url: 'https://api.instagram.com/v1/media/' + _this.id + '/likes',
    dataType: "json",

    data: {
      access_token: token,
      _method: 'DELETE'
    },
    crossDomain: true,
    type: "POST",
    success: function(data) {},
    error: function(data) {}
  });
}

Media.prototype.makeLike = function () {
  if(this.user_has_liked) {
    this.removeLike();
  } else {
    this.setLike();
  }
}
// ------------------------- END MEDIA --------------------------------

// ------------------------- IMAGE ------------------------------------


function Image () {
  Media.call(this);
}

Image.prototype = Object.create(Media.prototype);
Image.prototype.constructor = Image;


// ------------------------- END IMAGE --------------------------------

// ------------------------- CAROUSEL ---------------------------------

function Carousel () {
  Media.call(this);
}

Carousel.prototype = Object.create(Media.prototype);
Carousel.prototype.constructor = Carousel;

Carousel.prototype.getCarouselImageAsLinks = function (classA, classImg) {
  var _this = this;
  return this.carousel_media.map(function (img) {
    return '<a class="' + classA + '" href="' + img.images.standard_resolution.url + '" target="_blank">' +
      '<img class="' + classImg + '" src="' + img.images.standard_resolution.url + 
      '" alt="' + _this.getTags().join(' ')  + '"></a>';
  });
}
// ------------------------- END CAROUSEL -----------------------------

// Request all neaded data and call given function when data is reseived
function getData (fun) {
  console.log('getdata');
  Promise.all( users.map(function (x) {
    return Promise.resolve(x.takeMyInfo()).then(
      function (data) {
        x.saveMyInfo(data);
        return Promise.resolve(x.takeMyMedias());
      }).then(
      function (data) {
        x.saveMyMedias(data);
        return x;
      }
    ); 
  })).then(
    function (data) {
      console.log(users);
      saveUsersData(users);
      fun();
    }
  ).catch(function (err) {
    alert('Can not load data');
  });
}

// This function fills users aray with data from instagram or session.Storage. If there are no data in session.Storage
// or it is expired (older than elevanceInterva) if calls getData function
function start (fun) {
  if(Number(sessionStorage.timestamp) > Date.now() - relevanceInterval){
    users = JSON.parse(sessionStorage.photoAlbumData);
    users.forEach(function (user) {
      Object.setPrototypeOf(user, User.prototype);
      user.getMyMedia().forEach(function (media){
        if(media.type == 'carousel') {
          Object.setPrototypeOf(media, Carousel.prototype);
        }
        else if(media.type == 'image') {
          Object.setPrototypeOf(media, Image.prototype);
        } 
      });
    });
    fun();
  }
  else{
    return getData(fun);
  }
}
// Take a array with user's ids and create corresponding objects
users = userIds.map(function (id) {
  return new User(id);
});