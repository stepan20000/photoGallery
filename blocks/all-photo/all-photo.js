$(document).ready(function() {  
  function makeAllPhoto(target, database){
    var _this = this;
    this.database = database;
    this.allPhoto = target;
    this.lastItDisplayed = undefined;
    this._addItems();
    
    $("#load-more").on("click", function(evt){
      _this._addItems();
    });
  }
  
  makeAllPhoto.prototype._addItems = function() {
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
      $("<figure class='all-photo__item'><img class='all-photo__img' src=" + this.database[i].images.low_resolution.url + "></figure>").appendTo(this.allPhoto); 
    }
  }
  
  function allPhotoFun(){
    navFun();
    var allPhoto= new makeAllPhoto($(".all-photo"), mediaList); 
  }
  
  if(sessionStorage.photoAlbum !== undefined && Number(sessionStorage.timestamp) > Date.now() - relevanceInterval){
    mediaList = JSON.parse(localStorage.photoAlbum);
    allPhotoFun();
  }
  else{
    getData(allPhotoFun);
  }
});