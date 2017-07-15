// -------------------- USER --------------------------------------
// Constructor for user's object
function MyUser (id) {
  this.id = id;
}

// Call to instagram for user's info in json format
MyUser.prototype.takeMyInfo = function () {
  return $.ajax({
    url: 'https://api.instagram.com/v1/users/' + this.id,
    dataType: 'jsonp',
    type: 'GET',
    data: {access_token: token}
  });
}

// Simply copy all key-data pairs from json received from instagram
MyUser.prototype.saveMyInfo = function (data) {
  var keys = Object.keys(data.data);
  for(var i in keys) {
    this[keys[i]] = data.data[keys[i]];
  }
// Set the user password
  this.psw = this.username + 'psw';
}

//Call to instagram for user's  as my appliction is in SandBox Mode instagram send 
//only 20 last media 
MyUser.prototype.takeMyMedias = function () {
  return $.ajax({
    url: 'https://api.instagram.com/v1/users/' + this.id + '/media/recent',
    dataType: 'jsonp',
    type: 'GET',
    data: {access_token: token, count: numPhotos}
  });
}

// Save received media object in user's _mediaList and than set prototype for each media
// object depends on it's type ('image' or 'carousel')
MyUser.prototype.saveMyMedias = function (data) {
  this._mediaList = data.data;
  this._mediaList.forEach(function (el) {
    if(el.type == 'carousel') {
      Object.setPrototypeOf(el, Carousel.prototype);
    }
    else if(el.type == 'image') {
      Object.setPrototypeOf(el, MyImage.prototype);
    } 
  });
}

//Simply return user's media list (an array)
MyUser.prototype.getMyMedia = function () {
  return this._mediaList;
}

//Return a list of user's media which have a tag specified by the argument
MyUser.prototype.getMediaWithTag = function (tag) {
  return this._mediaList.filter(function (media) {
    return media.tags.some(function (el) {
      return el == tag;
    });
  });
}

// This method adds new media to the user. First it calls My Image constructor and then
// push constructed medi object to the user's _mediaList object. At the moment we can add
// only media with type 'image', constructor for 'carousel' type media is not implemented
MyUser.prototype.addMedia = function (newMediaDesc, newMediaSrc) {
    this._mediaList.push(new MyImage(newMediaDesc, newMediaSrc));
}
                                
// ------------------------- END USER --------------------------------

// ------------------------- MEDIA ----------------------------------

// Consttructor for media object. Media can be of two types 'image' and 'carousel'. Media is 
//the parent for Image and Carousel.
// Most of the data in instagram object are not used by my appliction but I try to construct
// media object similar to original
// newMediaDesc - is a string user type to description field when load the media
// Here the newMediaSrc is a really file itself readed from harddrive by FileReade
function Media (newMediaDesc, newMediaSrc) {
// Make a random media id in instagram format - number of 19 digit long +  '_' + user id.
  this.id = Math.floor(Math.random() * 9999999999999999999) + '_' + loggedUser.id;
// LoggedUser is a global variable which refference to the user object which now is logged in
  this.user = {'id': loggedUser.id, 
               'full_name': loggedUser.full_name, 
               'profile_picture': loggedDialog.profile_picture,
               'username': loggedUser.username
              };
// Instagram's media has different url's for each image size, in my constructed object
// all images has the same size and save url. 'width' and 'heigth' are not used.
  this.images = {
    'thumbnail':{ 'width':150, 'height':150, 'url': newMediaSrc // fill url
      },
    'low_resolution':{
      'width':320,'height':400,'url': newMediaSrc // fill url
      },
    'standard_resolution':{
      'width':640,'height':800,'url': newMediaSrc // fill url
      }
    };
  this.created_time = Date.now();
  this.caption = {
    'id':'',
    'text': newMediaDesc, // The text entered by user while added image  newMediaDesc
    'created_time': Date.now(), // Date.now()
    'from':{'id': loggedUser.id, // fill user info again 
      'full_name': loggedUser.full_name,
      'profile_picture': loggedUser.profile_picture,
      'username': loggedUser.username
     }
  };
// In object created this property does not have sens. In original instagram object it means
// in the owner of access token liked this media. Therefore I use it for setting likes
  this.user_has_liked = false;
  this.likes = {'count': 0 };
  this.filter = 'Normal';
  this.comments = {'count': 0};
// This should be link to the instagram page with this media. Constructed media stored in 
// localSrorege so just link to instagram.com
  this.link = 'https://www.instagram.com';
  this.location = null;
  this.attribution = null;
  this.users_in_photo = [];
// Process user's description for capturing hash tags
  this.tags = newMediaDesc.match(/#\w+/g) ? newMediaDesc.match(/#\w+/g).map(function (tag) {
    return tag.slice(1);
  }) : [];
}

// Return mark up string needed for inserting image to the DOM
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
      return '<div class="mozaik__one"><img class="' + classImg + '" src="' + src + 
        '" alt="' + alt + '"</div>';
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

// For setting a like this curl command should be executed:
//curl -F 'access_token=ACCESS-TOKEN' \
//    https://api.instagram.com/v1/media/{media-id}/likes
// I tried to make it with ajax. Like sets successfully but 'Cross-Origin Request Blocked:...'
//message is shown in browser console
Media.prototype.setLike = function (el) {
  var _this = this;
  $(el).removeClass('like_active');
  _this.user_has_liked = true;
  $(el).html(++this.likes.count);
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
  
// For setting a like this curl command should be executed:
//curl -X DELETE https://api.instagram.com/v1/media/{media-id}/likes?access_token=ACCESS-TOKEN
// I tried to make it with ajax. Like deletes successfully but 'Cross-Origin Request Blocked:...' message is shown in browser console
Media.prototype.removeLike = function (el) {
  var _this = this;
  $(el).addClass('like_active');
  this.user_has_liked = false;
  $(el).html(--this.likes.count);
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

// Deside what to do remove or set like
Media.prototype.makeLike = function () {
  if(this.user_has_liked) {
    this.removeLike();
  } else {
    this.setLike();
  }
}
// ------------------------- END MEDIA --------------------------------

// ------------------------- IMAGE ------------------------------------
// MyImage constructor
// newMediaDesc - is a string user type to description field when load the media
// Here the newMediaSrc is a really file itself readed from harddrive by FileReade
function MyImage (newMediaDesc, newMediaSrc) {
// Call parent constructor first
  Media.call(this, newMediaDesc, newMediaSrc);
  this.type = 'image';
  
  //Store new media obj in a localStorage
  if(localStorage[loggedUser.id]) {
    var storedUser = JSON.parse(localStorage[loggedUser.id]);
    storedUser.push(this);
    localStorage.setItem(loggedUser.id, JSON.stringify(storedUser));
  } else {
    var storedUser = [this];
    localStorage.setItem(loggedUser.id, JSON.stringify(storedUser));
  }
}

MyImage.prototype = Object.create(Media.prototype);
MyImage.prototype.constructor = MyImage;


// ------------------------- END IMAGE --------------------------------

// ------------------------- CAROUSEL ---------------------------------
// Constructor for media with type='carousel'. Not implemented now. carousel is a media with several images added user in one post. 
function Carousel () {
  Media.call(this);
}

Carousel.prototype = Object.create(Media.prototype);
Carousel.prototype.constructor = Carousel;
// return a mark up strinng with carousle's images wrapped in links
Carousel.prototype.getCarouselImageAsLinks = function (classA, classImg) {
  var _this = this;
  return this.carousel_media.map(function (img) {
    return '<a class="' + classA + '" href="' + img.images.standard_resolution.url + '" target="_blank">' +
      '<img class="' + classImg + '" src="' + img.images.standard_resolution.url + 
      '" alt="' + _this.getTags().join(' ')  + '"></a>';
  });
}
// ------------------------- END CAROUSEL -----------------------------
// Request neaded data from instagram (all users info and 20 medias info), store data and call given function when data is reseived
// The elements in Promese.all array contains of two linked Promises:
// - getting user's info
// - and then gettin user's medias
// Also we check if user has stored media in localStorage and if so push it to the 
// reseived media data
function getData (fun) {
  Promise.all( users.map(function (x) {
    return Promise.resolve(x.takeMyInfo()).then(
      function (data) {
        x.saveMyInfo(data);
        return Promise.resolve(x.takeMyMedias());
      }).then(
      function (data) {
        if(localStorage[x.id]) {
        data.data = data.data.concat(JSON.parse(localStorage[x.id]));
        }
        x.saveMyMedias(data);
        return x;
      }
    ); 
  })).then(
    function (data) {
      console.log(users);
      fun();
    }
  ).catch(function (err) {
    alert('Can not load data');
    console.log(err);
  });
}