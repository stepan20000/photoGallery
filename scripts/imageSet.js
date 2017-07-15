//------ IMAGESSET -----------
//ImageSet class has two child mozaik and slider.
// Constructor ImageSet
function ImagesSet (target, images) {
  this.target  = target;
  this.images = images;
  this.l = images.length;
}

// Simply append images from this.images array(given as an argument to constructor) 
// to the target
ImagesSet.prototype.addImages = function(target) {
  this.images.forEach(function (image) {
    $(target).append(image);
  });
}

//------ IMAGESSET END-----------

// ------ MOZAIK ----------------
function Mozaik (target, images) {
  ImagesSet.call(this, target, images);
  this.addImages(this.target);
}

Mozaik.prototype = Object.create(ImagesSet.prototype);
Mozaik.prototype.constructor = Mozaik;
// ------ MOZAIK END----------------

// ------ SLIDER -------------------
// target is a element-container for slider, images is an array with images or wrapped in <a> tag images
function Slider (target, images) {
  var _this = this;
  ImagesSet.call(this, target, images);
  this.slideIndex = 0;
  this.slideIndexLast = 0;
// Add markup for to slider container
  $(target).html('<div class="slider"><div class="slider__viewport"></div>' +
      '<div class="slider__controls">' +
        '<div id="slide-left" class="slider__goto slider__goto_left">&#10094;</div>' +
        '<div id="slide-right" class="slider__goto slider__goto_right">&#10095;</div>' +
      '</div></div>');
  
// Add slide's images 
  this.addImages($(target).find('.slider').children('.slider__viewport'));
  
// Save all slide's images 
  this.slides = $(this.target).find('.slider').children(".slider__viewport").find('.slider__slide');
//Add badges. If there are more than 10 images in slider add small badges
  if(this.l <= 10) {
    for(var i = 0; i < this.l; i ++){
      $(target).find('.slider').children('.slider__controls').append("<span class='slider__badge'></span>");
    }
  } else {
    for(var i = 0; i < this.l; i ++){
      $(target).find('.slider').children('.slider__controls').append("<span class='slider__badge slider__badge_small'></span>");
    }
  }
// Save budges
  this.badges = $(target).find('.slider').children('.slider__controls').children('.slider__badge');
// Show first slide
  this.showSlide(this.slideIndex);

   $(target).find('.slider').children(".slider__controls").on("click", function(evt){
    if(evt.target.id == "slide-left") {
      _this.nextSlide(-1, 'left');
    }
    else if (evt.target.id == "slide-right"){
      _this.nextSlide(1, 'right');
    }
    else { 
      var slideToShow =$.inArray(evt.target, _this.badges);
      if(slideToShow != -1){ // If user clicked on badge
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

// Show specified slide (n), and set the animation according the direction
Slider.prototype.showSlide = function(n, direction) {
  if (n >= this.l) {this.slideIndex = 0}    
  if (n < 0) {this.slideIndex = this.l - 1;}

  // Switch-off displaying of all images
  $(this.slides).css('display', 'none'); 
  $(this.badges).removeClass("slider__badge_active");  
  
    if(direction == 'right') {
    $(this.slides[this.slideIndex]).css('animation', 'animateright 0.4s');
  }
  else if(direction == 'left') {
    $(this.slides[this.slideIndex]).css('animation', 'animateleft 0.4s');
  }
  $(this.slides[this.slideIndex]).css('display', 'inline-block');
  $(this.badges[this.slideIndex]).addClass("slider__badge_active");
  this.slideIndexLast = this.slideIndex;
}
// ------ SLIDER END ---------------