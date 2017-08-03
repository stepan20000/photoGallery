// MediaContainer class has two child AllPhoto and Find.
// MediaContainer counstructor
function MediaContainer (target) {
  this.target = target;
}

// Take all media from each user concat then to one array and sort by date newest first
// than save this array as a current database for 'this' MediaContainer
MediaContainer.prototype.resetCurrentDatabase = function () {
  return users.map(function (user) {
    return user.getMyMedia();
  }).reduce(function (acc, userMedia, index, arr) {
    return acc.concat(userMedia);
  }, []).sort(function (a, b) {
    return b.created_time - a.created_time;
  });
};

// Decide what function call for displaying big media according to the media type ('image' or 'carousel')
MediaContainer.prototype.showBigMedia = function (container, media) {
  if(media.type == 'carousel') {
    this.showBigCarousel(container, media);
  } else {
    this.showBigImage(container, media);
  }
};

//First argument is a jQuery element where the big image shpould be, media is a media object
MediaContainer.prototype.showBigImage = function (container, media) {
  var _this = this;
  container.html('');
// collect data from media obj
  var linkToImage = media.getImageAsLink('standard', 'bigMedia__link', 'bigMedia__image');
  var linkToInstagram = media.link;
  
// Make jQuery elements for markup
  var bigMedia = $('<div class="bigMedia"></div>');

  var figcaption = $('<figcaption class="bigMedia__figcaption"></figcaption>');
  var instagram = $('<a class="instagram bigMedia__control" href="' + linkToInstagram +'" target ="_blank">' + 
          '<img class="instagram__img" src="blocks/staff/img/instagram-logo.png" alt="instagram logo">' + 
        '</a>');
  var like = $('<span class="like bigMedia__control"></span>');
  var close = $('<span class="close">&#10005;</span>');

// Add jQuery data property which is 'pointer' to the to media object 
  like.data('media', media);
  like.html(media.likes.count);

  if(!media.user_has_liked) {
    like.addClass('like_active');
  }
  
  like.on('click', function () {
    media.makeLike();
    like.html(media.likes.count);
    like.toggleClass('like_active');
    _this.refresh();
  });
  
  close.on('click', function () {
    close.off('click', '**');
    like.off('click', '**');  
    container.slideUp();
  });

  figcaption.append(instagram);
  figcaption.append(like);
  
  bigMedia.append(linkToImage);
  bigMedia.append(figcaption);
  bigMedia.append(close);
  
  
  container.append(bigMedia);
};

// Use slider class for making big media with 'carouse' type
MediaContainer.prototype.showBigCarousel = function (container, media) {
  container.html('');
// get images for slider
  var images = media.getCarouselImageAsLinks('slider__slide', 'slider__img');
  var s = new Slider(container, images);
  var close = $('<span class="close">&#10005;</span>');
  
  var linkToInstagram = media.link;
  var slider = container.children('.slider');
  var figcaption = $('<figcaption class="bigMedia__figcaption"></figcaption>');
  var instagram = $('<a class="instagram bigMedia__control" href="' + linkToInstagram +'" target ="_blank">' + 
        '<img class="instagram__img" src="blocks/staff/img/instagram-logo.png" alt="instagram logo">' + 
      '</a>');
  var like = $('<span class="like bigMedia__control"></span>');
  var close = $('<span class="close">&#10005;</span>');
  
  like.data('media', media);
  like.html(media.likes.count);
  if(!media.user_has_liked) {
    like.addClass('like_active');
  }
  
  like.on('click', function () {
    media.makeLike();
    like.html(media.likes.count);
    like.toggleClass('like_active');
    this.refresh();
  });
  
  close.on('click', function () {
    close.off('click', '**');
    like.off('click', '**');  
    container.slideUp();
  });

  figcaption.append(instagram);
  figcaption.append(like);
  
  slider.append(figcaption);
  slider.append(close);
  
};

//------------------- MediaContainer END ------------------------
// ------------------- ALLPHOTO --------------------------------------
function AllPhoto(target) {
  MediaContainer.call(this, target);
// Make media's database 
  this.database = this.resetCurrentDatabase();
  this.lastItDisplayed = undefined;
  this.addItems();
  this.addEvtListeners();
}

AllPhoto.prototype = Object.create(MediaContainer.prototype);
AllPhoto.prototype.constructor = AllPhoto;

// This function called when user adds photo for displaying correct database
AllPhoto.prototype.refresh = function () {
  this.database = this.resetCurrentDatabase();
  $(this.target).html('');
  this.addItems(true); 
};

AllPhoto.prototype.addEvtListeners = function () {
  var _this = this;
  //Display new images when button 'Load more' is clicked
  $("#load-more-allPhoto").on("click", function(evt){
    _this.addItems();
  });

  $('.all-photo').on('click', function (evt) {
    _this.showBigMedia($('#bigMediaContainer'), $(evt.target).parent().data('media'));
    $('#bigMediaContainer').slideDown();
  });
}

// refresh argument may be a true or false, when user add new photo and we need to refresh allPhoto page 
// refresh is needed
AllPhoto.prototype.addItems = function(refresh) {
  var firstItem;
  if(this.database.length == 0){
    console.log("No data loaded");
    return;
  }
  if(!refresh) {
    if(this.lastItDisplayed === undefined) {
      firstItem = 0;
      this.lastItDisplayed = 5;
    } else {
      firstItem = this.lastItDisplayed + 1;
      this.lastItDisplayed = this.lastItDisplayed + 6; // 6 is a number of photo to add each time
    }
    if(this.lastItDisplayed > this.database.length -1) {
      this.lastItDisplayed = this.database.length - 1;
      $("#load-more").attr("disabled", true);
    }
  } else { // if refresh add all items from 0 to lastItDisplayed
    firstItem = 0;
  }
  for(var i = firstItem; i <= this.lastItDisplayed; i++) {
    if(this.database[i].type == 'carousel') { // carousel has spec symbol on the right top
      $('<figure class="all-photo__item"><img src="blocks/staff/img/carousel-icon-white.png"' + 
        'alt="carousel icon" class="carousel-icon">' + 
          this.database[i].getImage('low', 'all-photo__img') +  
        '<div class="all-photo__mask">' + 
          '<span class="like like_small">' + this.database[i].likes.count + '</span>' +
        '</div>' +
      '</figure>').data('media', this.database[i]).appendTo(this.target);
    } else {
      $('<figure class="all-photo__item">' + this.database[i].getImage('low', 'all-photo__img') + 
        '<div class="all-photo__mask">' + 
          '<span class="like like_small">' + this.database[i].likes.count + '</span>' +
        '</div>' +
      '</figure>').data('media', this.database[i]).appendTo(this.target);
    } 
  }
};

// ------------------- ALLPHOTO END  --------------------------------------

// ------------------- GRID -----------------------------------------------

function Grid (target) {
  AllPhoto.call(this, target);
  var _thisGrid = this;
  //Display new images when button 'Load more' is clicked
  $("#load-more-grid").on("click", function(evt){
    _thisGrid.addItems();
  });
}

Grid.prototype = Object.create(AllPhoto.prototype);
Grid.prototype.constructor = Grid;

Grid.prototype.addEvtListeners = function () {
  var _this = this;
  //Display new images when button 'Load more' is clicked
  $("#load-more-grid").on("click", function(evt){
    _this.addItems();
  });
}

Grid.prototype.addItems = function (refresh) {
  var firstItem;
  if(this.database.length == 0){
    console.log("No data loaded");
    return;
  }
  if(!refresh) {
    if(this.lastItDisplayed === undefined) {
      firstItem = 0;
      this.lastItDisplayed = 5;
    } else {
      firstItem = this.lastItDisplayed + 1;
      this.lastItDisplayed = this.lastItDisplayed + 6; // 6 is a number of photo to add each time
    }
    if(this.lastItDisplayed > this.database.length -1) {
      this.lastItDisplayed = this.database.length - 1;
      $("#load-more").attr("disabled", true);
    }
  } else { // if refresh add all items from 0 to lastItDisplayed
    firstItem = 0;
  }

  for(var i = firstItem; i <= this.lastItDisplayed; i++) {
    if(this.database[i].type == 'carousel') { // carousel has spec symbol on the right top
      $('<figure class="grid__item"><img src="blocks/staff/img/carousel-icon-white.png"' +
          'alt="carousel icon" class="carousel-icon">' +
          this.database[i].getImage('standard', 'grid__img') +
          '<div class="grid__mask">' +
          '<span class="like like_small">' + this.database[i].likes.count + '</span>' +
          '</div>' +
          '</figure>').data('media', this.database[i]).appendTo(this.target);
    } else {
      $('<figure class="grid__item">' + this.database[i].getImage('standard', 'grid__img') +
          '<div class="grid__mask">' +
          '<span class="like like_small">' + this.database[i].likes.count + '</span>' +
          '</div>' +
          '</figure>').data('media', this.database[i]).appendTo(this.target);
    }
  }
};

// -------------------- GRID END ------------------------------

// ------------------- FIND -------------------------------------------------

function Find(target) {
  var _this = this;
  MediaContainer.call(this, target);

// currentDatabase is a list of media to display, at this moment it is all user's media 
  this.currentDatabase = this.resetCurrentDatabase(); 
// This is a ufo windows for displaying info when searching for tag or for user
  this.infoTag = $('.info__tag');
  this.infoUser = $('.info__user');

  this.pageShown = 0;
  this.itemsOnPage = 5;
  this.mql = window.matchMedia('all and (min-width: 768px)');
// Two arrays with all hashgs and usernames used as different autocomplete source
  this.hashTags = this.takeHashTags();
  this.usernames = users.map(function (user) {
    return user.username;
  });
// This is like flag for indication what is the source for autocomplete now
  this.autoCompleteSource = 'usernames';
//Show first page of full database media
  this._showPage(0);

  $('.pag').on('click', function(evt) {
    _this._pagEvtList(evt);
  });

  $('#sort-by').on('change', function(evt) {
    _this._sortBy(evt);
    _this._showPage(0);
  });

  $('#order').on('change', function(evt) {
    _this.currentDatabase.reverse();
    _this._showPage(0);
  });

  $('#reset').on('click', function() {
    _this.reset();
  });
// First bu default set autocomplete source to usernames array
  this.autoCompleteArr = this.usernames;
  this.NoResultsLabel = 'No Results';
  _this.NoResultsFlag = false;
// adjust jQUery autocomplete
  $('#search').autocomplete({
    source: function(request, response) {
      var results = $.ui.autocomplete.filter(_this.autoCompleteArr, request.term);
      if (!results.length) {
        results = [_this.NoResultsLabel];
        _this.NoResultsFlag = true;
      } else {
        _this.NoResultsFlag = false;
      }
      response(results);
    },
    select: function(event, ui) {
      if (ui.item.label === _this.NoResultsLabel) {
        event.preventDefault();
      }
    },
    focus: function(event, ui) {
      if (ui.item.label === _this.NoResultsLabel) {
        event.preventDefault();
      }
    }
  });

// Set the autocomplete source depends on whether user enter '#' 
  $('#search').keyup(function(e) {
    var inputHasHash = /^#/.test($(this).val());
    if (_this.autoCompleteSource == 'usernames' && inputHasHash) {
      _this.autoCompleteSource = 'hashTags';
      _this.autoCompleteArr = _this.hashTags;
    }
    if (_this.autoCompleteSource == 'hashTags' && !inputHasHash) {
      _this.autoCompleteSource = 'usernames';
      _this.autoCompleteArr = _this.usernames;
    }
  });

// User can press entr or click the 'Find' button for searching
  $('#search').on('change', function(evt) {
    _this._find(evt);
  });

  $('#search-btn').on('click', function(evt) {
    _this._find(evt);
  });
}

Find.prototype = Object.create(MediaContainer.prototype);
Find.prototype.constructor = Find;

// Page is an integer it is a page number for displaying
Find.prototype._showPage = function(page) {
  //Clear page
  $(this.target).html('');
// Range of item to display on current page from start to end
  var start = this.itemsOnPage * page;
  var end = start + this.itemsOnPage;
  // Check if we reach end of the database
  if (start >= this.currentDatabase.length) {
    console.log('This page does not exist');
    return;
  }
  // Check if last page us shorter than this.itemsOnPage
  if (end >= this.currentDatabase.length) {
    end = this.currentDatabase.length;
  }

  for (var i = start; i < end; i++) {
    var item = $('<div class="find__item"></div>');
    $(this.target).append(item);
        this.showBigMedia(item, this.currentDatabase[i]);
  }
// Remove all close buttons in search results
  $('.close').remove();
  this._adjustPag(page);
  // Hide pagination if we have less than 2 page of results
  if (this.currentDatabase.length <= 1) {
    $('.pag').fadeOut();
  }
};

Find.prototype._adjustPag = function(page) {
  $('.pag').fadeIn();
  // Remove old pagination
  $('.pag__page_gotoPage').remove();
  // Show page number
  this.pageShown = page;
  $('#page-current').html(page + 1);
  // If first page is shown disable "Prev" and "<<" buttons else unable them
  if (page === 0) {
    $('#page-start, #page-prev').attr('disabled', true);
  } else {
    $('#page-start, #page-prev').attr('disabled', false);
  }
  // If last page is shown disable "Next" and ">>" buttons else unable them
  if (
    page * this.itemsOnPage + this.itemsOnPage >=
    this.currentDatabase.length
  ) {
    $('#page-end, #page-next').attr('disabled', true);
  } else {
    $('#page-end, #page-next').attr('disabled', false);
  }

  if (this.mql.matches) {
    var pageBefore, pageAfter, count;
    var lastPage =
      Math.ceil(this.currentDatabase.length / this.itemsOnPage) - 1;
    pageBefore = pageAfter = $('#page-current');
    count = 0;
    for (var i = 1; i <= 6; i++) {
      if (page - i >= 0 && count < 6) {
        count++;
        pageBefore.before(
          "<button id='page-" +
            (page - i) +
            "' class='pag__page pag__page_gotoPage'>" +
            (page + 1 - i) +
            '</button>'
        );
        pageBefore = $('#page-' + (page - i));
      }
      if (page + i <= lastPage && count < 6) {
        count++;
        pageAfter.after(
          "<button id='page-" +
            (page + i) +
            "' class='pag__page pag__page_gotoPage'>" +
            (page + 1 + i) +
            '</button>'
        );
        pageAfter = $('#page-' + (page + i));
      }
    }
// Add dots ... if there are more page then are displayed in pagination
    if (parseInt($(pageAfter).html()) - 1 < lastPage) {
      pageAfter.after(
        "<button class='pag__page pag__page_gotoPage' disabled>...</button>"
      );
    }
    if (parseInt($(pageBefore).html()) - 1 > 0) {
      pageBefore.before(
        "<button class='pag__page pag__page_gotoPage' disabled>...</button>"
      );
    }
  }
};

Find.prototype._pagEvtList = function(evt) {
  switch (evt.target) {
    case $('#page-start')[0]:
      this._showPage(0);
      break;
    case $('#page-end')[0]:
      this._showPage(
        Math.floor(this.currentDatabase.length / this.itemsOnPage)
      );
      break;
    case $('#page-prev')[0]:
      this._showPage(this.pageShown - 1);
      break;
    case $('#page-next')[0]:
      this._showPage(this.pageShown + 1);
      break;
    default:
      if ($(evt.target).hasClass('pag__page_gotoPage')) {
        this._showPage(parseInt($(evt.target).html()) - 1);
      }
  }
};

Find.prototype._sortBy = function(evt) {
  var _this = this;
  if ($('#sort-by option:selected').val() == 'date') {
    this.currentDatabase = this.currentDatabase.sort(function(a, b) {
      return b.created_time - a.created_time;
    });
  }
  if ($('#sort-by option:selected').val() == 'likes') {
    this.currentDatabase = this.currentDatabase.sort(function(a, b) {
      return b.likes.count - a.likes.count;
    });
  }
  if ($('#order').is(':checked')) {
    this.currentDatabase.reverse();
  }
};

Find.prototype.reset = function() {
  $('input:checkbox[name=order]').prop('checked', false);
  $('option').prop('selected', false);
   $('#search').val('');
  this.currentDatabase = this.resetCurrentDatabase();
  this.hashTags = this.takeHashTags();
  this._showPage(0);
  this.infoTag.fadeOut();
  this.infoUser.fadeOut();
};

//Make a list of all hashtags presented in all media oh alll users
Find.prototype.takeHashTags = function() {
  var data = this.currentDatabase;
  var hashTags = [];
  for (var i = 0, l = data.length; i < l; i++) {
    for (var j = 0; j < data[i].getTags().length; j++) {
      if (
        !hashTags.some(function(element, index, array) {
          return element == '#' + data[i].tags[j];
        })
      ) {
        hashTags.push('#' + data[i].tags[j]);
      }
    }
  }
  return hashTags;
};

// Display all media which has hash tag.
Find.prototype._displayTag = function() {
  this.infoUser.fadeOut();
  this.infoTag.fadeIn();
  $('.info__user').fadeOut();
  $('input:checkbox[name=order]').prop('checked', false);
  $('option').prop('selected', false);
// Remove first letter form o search query (this should be '#' symbol)
  var text = $('#search').val().slice(1);
  this.currentDatabase = []; 

// Make currentDatabase with media which has give tag
  var base = users.map(function (user) {
    return user.getMediaWithTag(text);
  });
  base.forEach(function (el) {
    if(el.length > 0) {
      this.currentDatabase = this.currentDatabase.concat(el);
    }
  }, this);
  this._sortBy();
  this._showPage(0);
//If there are media with given tag display info 
  if ( this.currentDatabase.length > 0) {
    $('.info__hash').html('#' + text);
    $('.info__tag-info').html(String(this.currentDatabase.length) + ' photos');
  } else {
    $('.info__hash').html('No results found');
  }
};

Find.prototype._displayUser = function(evt) {
  this.infoTag.fadeOut();
  this.infoUser.fadeIn();
  $('.info__tag').fadeOut();

  $('input:checkbox[name=order]').prop('checked', false);
  $('option').prop('selected', false);
  var curUser;
  var text = $('#search').val();
  for(var i in users) {
    if(users[i].username == text) {
      curUser = users[i];
      this.currentDatabase = users[i].getMyMedia();
      break;
    }
  }
  $('.info__user-img').attr({
    src: curUser.profile_picture,
    alt: curUser.full_name + 'profile picture'
  });
  $('.info__username').html(curUser.username);
  $('.info__name').html(curUser.full_name);
  $('.info__photos').html(curUser.counts.media + ' media');
  this._sortBy();
  this._showPage(0);
};

Find.prototype._find = function(evt) {
  if (!this.NoResultsFlag) {
    if ($('#search').val()[0] == '#') {
      this._displayTag(evt);
    } 
    else {
      this._displayUser(evt);
    }
  }
};

Find.prototype.refresh = function () {
  
};




// ------------------- FIND END ----------------------------------------------
