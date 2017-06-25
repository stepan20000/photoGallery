$(document).ready(function(){
  
  function makeFind(target, database) {
    var _this = this;
    this.database = database;
    this.currentDatabase = database;
    this.find = target;
    this.pageShown = 0;
    this.itemsOnPage = 10;
    this.mql = window.matchMedia('all and (min-width: 768px)');
    this.hashTags = this._takeHashTags();
    this.usernames = this._takeUsernames();
    this.autoCompleteSource = "usernames";

    this._sortBy();
    this._showPage(0); 
    
    $(".pag").on("click", function(evt){
      _this._pagEvtList(evt);
    });
    
    $("#sort-by").on("change", function(evt) {
      _this._sortBy(evt);
      _this._showPage(0);
    });
    
    $("#order").on("change", function(evt) {
      _this.currentDatabase.reverse();
      _this._showPage(0);
    });
    
    $("#reset").on("click",  function() {
      _this._reset();
    });
    
    $("#search").autocomplete({
      source: _this.usernames
   });

    $("#search").keyup(function(e){
      var inputHasHash = /#/.test($(this).val());
      if(_this.autoCompleteSource == "usernames" && inputHasHash){
        console.log("set autocomplete from tags");
        _this.autoCompleteSource = "hashTags";
        $("#search").autocomplete({
          source: _this.hashTags
        });
      }
      if(_this.autoCompleteSource == "hashTags" && !inputHasHash) {
        _this.autoCompleteSource = "usernames";
        $("#search").autocomplete({
          source: _this.usernames
        });
      }
    });
    
    $("#search").on("change", function(){
      if($("#search").val()[0] == "#"){
        _this._displayTag();
      }
      else {
        _this._displayUser();
      }
    });
  }
  
  makeFind.prototype._showPage = function(page) {
//Clear page
    $(this.find).html("");

    if(this.currentDatabase.length == 0){
      console.log("No data loaded");
      return;
    }
    var start = this.itemsOnPage * page;
    var end = start + this.itemsOnPage;
// Check if we reach end of the database
    if(start >= this.currentDatabase.length) {
      console.log("This page does not exist");
      return;
    }
// Check if last page us shorter than this.itemsOnPage
    if(end >= this.currentDatabase.length) {
      end = this.currentDatabase.length;
    }
    
    for(var i = start; i < end; i++) {
      $("<figure class='find__item'><img class='find__img' src=" + 
        this.currentDatabase[i].images.standard_resolution.url + "></figure>").appendTo(this.find); 
    }
    this._adjustPag(page);
  }
  
  makeFind.prototype._adjustPag = function(page) {
// Remove old pagination
    $(".pag__page_gotoPage").remove();
// Show page number
    this.pageShown = page;
    $("#page-current").html(page + 1);
// If first page is shown disable "Prev" and "<<" buttons else unable them
    if(page === 0){
      $("#page-start, #page-prev").attr("disabled", true);
    } else {
      $("#page-start, #page-prev").attr("disabled", false);
    }
// If last page is shown disable "Next" and ">>" buttons else unable them
    if(page * this.itemsOnPage + this.itemsOnPage >= this.currentDatabase.length) {
      $("#page-end, #page-next").attr("disabled", true);
    } else {
      $("#page-end, #page-next").attr("disabled", false);
    }
    
    if(this.mql.matches) {
      var pageBefore, pageAfter, count;
      var lastPage = Math.floor(this.currentDatabase.length / this.itemsOnPage);
      pageBefore = pageAfter =  $("#page-current");
      count = 0;
      for(var i = 1; i <= 6; i++) {
        if(page - i >= 0 && count < 6) {
          count++;
          pageBefore.before("<button id='page-" + (page - i) + "' class='pag__page pag__page_gotoPage'>" + (page + 1 - i) + "</button>");
          pageBefore = $("#page-" + (page - i));
        }
        if(page + i <= lastPage && count < 6) {
          count++;
          pageAfter.after("<button id='page-" + (page + i) + "' class='pag__page pag__page_gotoPage'>" + (page + 1 + i) + "</button>");
          pageAfter = $("#page-" + (page + i));
        }
      }

      if(parseInt($(pageAfter).html()) - 1 < lastPage) {
        pageAfter.after("<button class='pag__page pag__page_gotoPage' disabled>...</button>");
      }
      if(parseInt($(pageBefore).html()) - 1 > 0) {
        pageBefore.before("<button class='pag__page pag__page_gotoPage' disabled>...</button>");
      }
    }
  }
  
  makeFind.prototype._pagEvtList = function(evt) {
    switch (evt.target) {
      case $("#page-start")[0]:
        this._showPage(0);
        break;
      case $("#page-end")[0]:
        console.log("end");
        this._showPage(Math.floor(this.currentDatabase.length / this.itemsOnPage));
        break;
      case $("#page-prev")[0]:
        this._showPage(this.pageShown - 1);
        break;
      case $("#page-next")[0]:
        this._showPage(this.pageShown + 1);
        break;
      default:
        if($(evt.target).hasClass("pag__page_gotoPage")) {
          this._showPage(parseInt($(evt.target).html()) - 1);
        }        
    }
  }
  
  makeFind.prototype._sortBy = function(evt) {
    if($("#sort-by option:selected").val() == "date") {
      this.currentDatabase = this.currentDatabase.sort(function(a, b){
        return b.created_time - a.created_time;
      });
    }
    if($("#sort-by option:selected").val() == "likes") {
      this.currentDatabase = this.currentDatabase.sort(function(a, b){
        return b.likes.count - a.likes.count;
      });
    }
    if($("#order").is(':checked')) { 
      this.currentDatabase.reverse();
    }
    console.log(mediaList);
  }
  
makeFind.prototype._reset = function() {
  $('input:checkbox[name=order]').prop('checked', false);
  $("option").prop("selected", false);
  this.currentDatabase = this.database.sort(function(a, b){
    return b.created_time - a.created_time;
  });
  this._showPage(0);
}

makeFind.prototype._takeHashTags = function() {
  var data = this.database;
  var hashTags = [];
  for(var i = 0, l = data.length; i < l; i++) {
    for(var j = 0; j < data[i].tags.length; j++){
      if(!hashTags.some(function(element, index, array){
        return element == "#" + data[i].tags[j];
        }))
      {
        hashTags.push("#" + data[i].tags[j]);
      }
    }
  }
  return hashTags;
}



makeFind.prototype._takeUsernames = function() {
  var userNames = [];
  for(var i = 0, l = this.database.length; i < l; i++) {
    if(userNames.indexOf(this.database[i].user.username) == -1) {
      userNames.push(this.database[i].user.username);
    }
  }
  return userNames;
}

makeFind.prototype._displayTag = function() {
  console.log("display tag");
//  this.currentDatabase = this.database.filter(function())
}

makeFind.prototype._displayUser = function() {
  console.log("display user");
}

  
// This is the main funtion for the find page
  function findFun(){
    navFun();
    var find= new makeFind($(".find"), mediaList); 
  }


  if(sessionStorage.photoAlbum !== undefined && Number(sessionStorage.timestamp) > Date.now() - relevanceInterval){
    mediaList = JSON.parse(localStorage.photoAlbum);
    findFun();
  } else {
    getData(findFun);
  }
});