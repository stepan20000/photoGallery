$(document).ready(function() { 
  
  function makeSlider() {
    var _this = this;
    this.slideIndex = 0;
    this.images = $(".slider__slide");
    this.l = this.images.length;
    
    for(var i = 0; i < this.l; i ++){
      $(".slider__controls").append("<span class='slider__badge'></span>");
    }
    this.badges = $(".slider__badge");
    
    this.showSlide(this.slideIndex);
    
    $(".slider__controls").on("click", function(evt){
      if(evt.target.id == "slide-left") {
        _this.nextSlide(-1);
      }
      else if (evt.target.id == "slide-right"){
        _this.nextSlide(1);
      }
      else {
        var slideToShow =$.inArray(evt.target, _this.badges);
        if(slideToShow != -1){
          _this.showSlide(_this.slideIndex = slideToShow);
        }
      }
      
    });
  }

  
  makeSlider.prototype.nextSlide = function(n) {
    this.showSlide(this.slideIndex += n);
  }
  
  makeSlider.prototype.showSlide = function(n) {
    this.showSlide(this.slideIndex = n);
  }

  makeSlider.prototype.showSlide = function(n) {
    if (n >= this.l) {this.slideIndex = 0}    
    if (n < 0) {this.slideIndex = this.l - 1;}

    // Switch-off displaying of all images
    for (var i = 0; i < this.l; i++) {
      this.images[i].style.display = "none"; 
      $(this.badges[i]).removeClass("slider__badge_active");  
    }
    //Switch on needed image
    this.images[this.slideIndex].style.display = "block";
    $(this.badges[this.slideIndex]).addClass("slider__badge_active");
  }
  
  mySlider = new makeSlider();
  
});