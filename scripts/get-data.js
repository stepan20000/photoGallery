// -------------------- USER --------------------------------------
function MyUser (id) {
  this.id = id;
}

MyUser.prototype.takeMyInfo = function () {
  return $.ajax({
    url: 'https://api.instagram.com/v1/users/' + this.id,
    dataType: 'jsonp',
    type: 'GET',
    data: {access_token: token}
  });
}

MyUser.prototype.saveMyInfo = function (data) {
  var keys = Object.keys(data.data);
  for(var i in keys) {
    this[keys[i]] = data.data[keys[i]];
  }
  this.psw = this.username + 'psw';
}

MyUser.prototype.takeMyMedias = function () {
  return $.ajax({
    url: 'https://api.instagram.com/v1/users/' + this.id + '/media/recent',
    dataType: 'jsonp',
    type: 'GET',
    data: {access_token: token, count: numPhotos}
  });
}

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

MyUser.prototype.getMyMedia = function () {
  return this._mediaList;
}

MyUser.prototype.getMediaWithTag = function (tag) {
  return this._mediaList.filter(function (media) {
    return media.tags.some(function (el) {
      return el == tag;
    });
  });
}

MyUser.prototype.addMedia = function (newMediaDesc, newMediaSrc) {
    this._mediaList.push(new MyImage(newMediaDesc, newMediaSrc));
}
                                
// ------------------------- END USER --------------------------------

// ------------------------- MEDIA ----------------------------------

function Media (newMediaDesc, newMediaSrc) {

// Construct a new image object 
  this.id = Math.floor(Math.random() * 9999999999999999999) + '_' + loggedUser.id;
  this.user = {'id': loggedUser.id, 
               'full_name': loggedUser.full_name, 
               'profile_picture': loggedDialog.profile_picture,
               'username': loggedUser.username
              };
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
      'profile_picture': loggedDialog.profile_picture,
      'username': loggedUser.username
     }
  };
  this.user_has_liked = false;
  this.likes = {'count': 0 };
  this.filter = 'Normal';
  this.comments = {'count': 0};
  this.link = 'https://www.instagram.com';
  this.location = null;
  this.attribution = null;
  this.users_in_photo = [];
  this.tags = newMediaDesc.match(/#\w+/g) ? newMediaDesc.match(/#\w+/g).map(function (tag) {
    return tag.slice(1);
  }) : [];
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

Media.prototype.makeLike = function () {
  if(this.user_has_liked) {
    this.removeLike();
  } else {
    this.setLike();
  }
}
// ------------------------- END MEDIA --------------------------------

// ------------------------- IMAGE ------------------------------------


function MyImage (newMediaDesc, newMediaSrc) {

  Media.call(this, newMediaDesc, newMediaSrc);
  this.type = 'image';
  
  //Store new media obj in a localStorage
  if(localStorage[loggedUser.id]) {
    var storedUser = JSON.parse(localStorage[loggedUser.id]);
    storedUser.push(this);
    localStorage.removeItem(loggedUser.id);
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