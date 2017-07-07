$(document).ready(function() {  
  
  function AllPhoto(target){
    var _this = this;
// Make media's database 
    this.database = users.map(function (user) {
      return user.getMyMedia();
    }).reduce(function (acc, userMedia, index, arr) {
      return acc.concat(userMedia);
    }, []).sort(function (a, b) {
      return b.created_time - a.created_time;
    });
    console.log(users);
    console.log(this.database);
    this.allPhoto = target;
    this.lastItDisplayed = undefined;
    this._addItems();
    
    $("#load-more").on("click", function(evt){
      _this._addItems();
    });
    
    $('.all-photo').on('click', function (evt) {
      console.log($(evt.target).parent().data('media'));
      $(evt.target).parent().data('media').showMyBigImage();
    });
  }
  
  AllPhoto.prototype._addItems = function() {
    if(this.database.length == 0){
      console.log("No data loaded");
      return;
    }
    var firstItem;
    if(this.lastItDisplayed === undefined) {
      firstItem = 0;
      this.lastItDisplayed = 5;
    }
    else{
      firstItem = this.lastItDisplayed + 1;
      this.lastItDisplayed = this.lastItDisplayed + 6;
    }
    if(this.lastItDisplayed > this.database.length -1) {
      this.lastItDisplayed = this.database.length - 1;
      $("#load-more").attr("disabled", true);
    }
    for(var i = firstItem; i <= this.lastItDisplayed; i++) {
      $("<figure class='all-photo__item'><img class='all-photo__img'  src=" + this.database[i].getImageLink('low') + 
        " alt='" + 
        this.database[i].getTags().join(' ') + "'></figure>").data('media', this.database[i]).appendTo(this.allPhoto); 
    }
  }
  
  function allPhotoFun(){
    navFun();
    var allPhoto= new AllPhoto($(".all-photo")[0]); 
  }
 
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
    allPhotoFun();
  }
  else{
    getData(allPhotoFun);
  }
});