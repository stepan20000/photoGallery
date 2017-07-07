function indexFun () {
  $(document).ready(function() { 
    navFun();
    var mySlider = new Slider($('.slider__viewport')[0]);
    var myMozaik = new Mozaik($('.mozaik__container')[0]);
  });
}
// This block makes users aray with data from instagram or session.Storage. If there are no data in session.Storage
// or it is expired (older than elevanceInterva) if calls getData function

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
  indexFun();
}
else{
  getData(indexFun);
}

// ----- CLASSES --------------
//------ IMAGESSET -----------
function ImagesSet (target) {
  var _this = this;
  this.target  = target;
  this.database = users.map(function (user) {
    return user.getMyMedia();
  }).reduce(function (acc, userMedia, index, arr) {
    return acc.concat(userMedia);
  }, []).sort(function (a, b) {
    return b.created_time - a.created_time;
  });
  console.log(users);
}

ImagesSet.prototype.addImages = function(start, num, className, database, size) {
  var l = this.database.length;
  for(var i = 0; i < num && i < l; i++) {
     $("<img class='" + className +
       "' src=" + this.database[(i + start) % l].getImageLink(size) + 
      " alt='" + this.database[i].getTags().join(' ') + "'>").appendTo(this.target); 
  }
}

//------ IMAGESSET END-----------

// ------ MOZAIK ----------------
function Mozaik (target) {
  ImagesSet.call(this, target);
  this.database = this.database.concat(this.database);
  console.log(this.database);
  this.addImages(0, 100, 'mozaik__image', this.database, 'thumbnail');
}

Mozaik.prototype = Object.create(ImagesSet.prototype);
Mozaik.prototype.constructor = Mozaik;
// ------ MOZAIK END----------------

// ------ SLIDER -------------------
function Slider (target) {
  ImagesSet.call(this, target);
  var _this = this;
  var l = this.database.length;
  this.addImages(Math.floor(Math.random() * l), 10, 'slider__slide', this.database, 'standard');
  this.slideIndex = 0;
  this.slideIndexLast = 0;
  this.images = $(".slider__slide");
  this.l = this.images.length;

  for(var i = 0; i < this.l; i ++){
    $(".slider__controls").append("<span class='slider__badge'></span>");
  }
  this.badges = $(".slider__badge");

  this.showSlide(this.slideIndex);

  $(".slider__controls").on("click", function(evt){
    if(evt.target.id == "slide-left") {
      _this.nextSlide(-1, 'left');
    }
    else if (evt.target.id == "slide-right"){
      _this.nextSlide(1, 'right');
    }
    else {
      var slideToShow =$.inArray(evt.target, _this.badges);
      if(slideToShow != -1){
        if(slideToShow > _this.slideIndex) {
          _this.showSlide(_this.slideIndex = slideToShow, 'right');
        }
        else if(slideToShow < _this.slideIndex) {
          _this.showSlide(_this.slideIndex = slideToShow, 'left');
        }
      }
    }

  });
}
Slider.prototype = Object.create(ImagesSet.prototype);
Slider.prototype.constructor = Slider;
  
Slider.prototype.nextSlide = function(n, direction) {
  this.showSlide(this.slideIndex += n, direction);
}

Slider.prototype.showSlide = function(n, direction) {
  if (n >= this.l) {this.slideIndex = 0}    
  if (n < 0) {this.slideIndex = this.l - 1;}

  // Switch-off displaying of all images
  for (var i = 0; i < this.l; i++) {
    this.images[i].style.display = "none"; 
    $(this.badges[i]).removeClass("slider__badge_active");  
  }
  //Switch on needed image
  if(direction == 'right') {
    $(this.images[this.slideIndex]).css('animation', 'animateright 0.4s');
  }
  else if(direction == 'left') {
    $(this.images[this.slideIndex]).css('animation', 'animateleft 0.4s');
  }
  this.images[this.slideIndex].style.display = "inline-block";
  $(this.badges[this.slideIndex]).addClass("slider__badge_active");
  this.slideIndexLast = this.slideIndex;
}
// ------ SLIDER END ---------------


