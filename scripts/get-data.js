//ID's of users who gave access to their accounts
var userIds = [5604673568, 5611812646, 5612036694, 5617349057, 222066133];
// Instagram's access token
var token = '5604673568.7436976.80a61fbf539244dbab7f434b32ece141';
// In Sandbox mode we can only load maximum 20 media an one request
var numPhotos = 20;
//The interval after which the data is considered to be obsolete and loaded again
var relevanceInterval = 1800000;
// The array with user's info and media obtained from instagram API
var users;


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

Media.prototype.getImageLink = function (size) {
  switch (size) {
    case 'low':
      return this.images.low_resolution.url;
    case 'standard':
      return this.images.standard_resolution.url;
    case 'thumbnail':
      return this.images.thumbnail.url
    default:
      return this.images.standard_resolution.url;
  }
}

Media.prototype.getTags = function () {
  return this.tags;
}

Media.prototype.setLike = function (el) {
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
// ------------------------- END MEDIA --------------------------------

// ------------------------- IMAGE ------------------------------------


function Image () {
  Media.call(this);
}

Image.prototype = Object.create(Media.prototype);
Image.prototype.constructor = Image;

Image.prototype.showMyBigImage = function () {
  var _this = this;
  $('.big-photo__link').attr('href', this.images.standard_resolution.url);
  $(".big-photo__image").attr({
    src: this.images.standard_resolution.url,
    alt: this.tags.join(' ')
  });
  $('.instagram.big-photo__control').attr('href', this.link);
  $('.like').html(this.likes.count);
  if(!this.user_has_liked) {
    $('.like').addClass('like_active');
  }
  $('.big-photo').slideDown('slow');
  
  $('.big-photo .close').on('click', function () {
    $('.big-photo .close').off('click', '**');
    $('.like').off('click', '**');  
    $('.big-photo').slideUp('slow');
  });
  
  $('.like').on('click', function (evt) {
    console.log(evt.target);
    if(_this.user_has_liked) {
      _this.removeLike(evt.target);
    } else {
      _this.setLike(evt.target);
    }
  });
  
}

// ------------------------- END IMAGE --------------------------------

// ------------------------- CAROUSEL ---------------------------------

function Carousel () {
  Media.call(this);
}

Carousel.prototype = Object.create(Media.prototype);
Carousel.prototype.constructor = Carousel;

// ------------------------- END CAROUSEL -----------------------------

users = userIds.map(function (id) {
  return new User(id);
});


function getData (fun) {
  Promise.all( users.map(function (x) {
    return Promise.resolve(x.takeMyInfo()).then(
      function (data) {
        x.saveMyInfo(data);
        return Promise.resolve(x.takeMyMedias());
      },
      function (error) {
        console.log(error);
      }
      ).then(
      function (data) {
        x.saveMyMedias(data);
        return x;
      },
      function (error) {
        console.log(error);
      }
    ); 
  })).then(
    function (data) {
      console.log(users);
      saveUsersData(users);
      fun();
    },
    function (error) {
      console.log(error);
    }
  );
}

//function fun () {
//  console.log(users);
//}
//
//getData(fun);
