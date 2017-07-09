function indexFun () {
  $(document).ready(function() { 
    navFun();
    
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
  });
}

start(indexFun);

