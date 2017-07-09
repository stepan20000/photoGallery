function mediaContainer (target) {
  this.target = target;
}

mediaContainer.prototype.resetCurrentDatabase = function () {
  return users.map(function (user) {
    return user.getMyMedia();
  }).reduce(function (acc, userMedia, index, arr) {
    return acc.concat(userMedia);
  }, []).sort(function (a, b) {
    return b.created_time - a.created_time;
  });
}


mediaContainer.prototype.showBigMedia = function (container, media) {
  if(media.type == 'carousel') {
    this.showBigCarousel(container, media);
  } else {
    this.showBigImage(container, media);
  }
}

mediaContainer.prototype.showBigImage = function (container, media) {
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
  
  like.data('media', media);
  like.html(media.likes.count);
  if(!media.user_has_liked) {
    like.addClass('like_active');
  }
  
  like.on('click', function () {
    media.makeLike();
    like.html(media.likes.count);
    like.toggleClass('like_active');
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
}

mediaContainer.prototype.showBigCarousel = function (container, media) {
  container.html('');
// get images for slider
   var images = media.getCarouselImageAsLinks('slider__slide', 'slider__img');
  console.log(images);
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
  
} 



//------------------- MEDIACONTAINER END ------------------------
// ------------------- ALLPHOTO --------------------------------------
function AllPhoto(target){
  mediaContainer.call(this, target);
  var _this = this;
// Make media's database 
  this.database = this.resetCurrentDatabase();
  console.log(users);
  console.log(this.database);
  this.lastItDisplayed = undefined;
  this._addItems();

  $("#load-more").on("click", function(evt){
    _this._addItems();
  });

  $('.all-photo').on('click', function (evt) {
    _this.showBigMedia($('#bigMediaContainer'), $(evt.target).parent().data('media'));
    $('#bigMediaContainer').slideDown();
  });
}

AllPhoto.prototype = Object.create(mediaContainer.prototype);
AllPhoto.prototype.constructor = AllPhoto;

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
    if(this.database[i].type == 'carousel') {
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
}

// ------------------- ALLPHOTO END  --------------------------------------

// ------------------- FIND -------------------------------------------------

function Find(target) {
  var _this = this;
  mediaContainer.call(this, target);

// currentDatabase is a list of media to display, at this moment it is all user's media 
  this.currentDatabase = this.resetCurrentDatabase(); 

  this.pageShown = 0;
  this.itemsOnPage = 5;
  this.mql = window.matchMedia('all and (min-width: 768px)');

  this.hashTags = this.takeHashTags();
  this.usernames = users.map(function (user) {
    return user.username;
  });
  this.autoCompleteSource = 'usernames';

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
    _this._reset();
  });

  this.autoCompleteArr = this.usernames;
  this.NoResultsLabel = 'No Results';
  _this.NoResultsFlag = false;
  $('#search').autocomplete({
    source: function(request, response) {
      var results = $.ui.autocomplete.filter(
        _this.autoCompleteArr,
        request.term
      );
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

  $('#search').on('change', function(evt) {
    _this._find(evt);
  });

  $('#search-btn').on('click', function(evt) {
    _this._find(evt);
  });
}

Find.prototype = Object.create(mediaContainer.prototype);
Find.prototype.constructor = Find;


Find.prototype._showPage = function(page) {
  //Clear page
  $(this.target).html('');

  if (this.currentDatabase.length === 0) {
    console.log('No data loaded, or can not find such user');
    $('.pag').fadeOut();
    return;
  }
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
//    $(
//      "<figure class='find__item'><img class='find__img' src=" +
//        this.currentDatabase[i].getImageLink('standard') + " alt='" + this.currentDatabase[i].getTags().join(' ') +
//        "'></figure>"
//    ).appendTo(this.find);
    var item = $('<div class="find__item"></div>');
  
    $(this.target).append(item);
        this.showBigMedia(item, this.currentDatabase[i]);


  }
  $('.close').remove();
  this._adjustPag(page);
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

Find.prototype._reset = function() {
  $('input:checkbox[name=order]').prop('checked', false);
  $('option').prop('selected', false);
  this._resetCurrentDatabase();
  this._showPage(0);
};

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

Find.prototype._displayTag = function(evt) {
  $('.info').fadeIn();
  $('.info__user').fadeOut();
  $('input:checkbox[name=order]').prop('checked', false);
  $('option').prop('selected', false);
  var text = $('#search').val().slice(1);
  this.currentDatabase = []; 

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
  if (base.length > 0) {
    $('.info__hash').html('#' + text);
    $('.info__tag-info').html(String(this.currentDatabase.length) + ' photos');
  } else {
    $('.info__hash').html('No results found');
  }
};

Find.prototype._displayUser = function(evt) {
  $('.info').fadeIn();
  $('.info').html('');

  $('input:checkbox[name=order]').prop('checked', false);
  $('option').prop('selected', false);
  var text = $('#search').val();
  for(var i in users) {
    if(users[i].username == text) {
      this.currentDatabase = users[i].getMyMedia();
      break;
    }
  }
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




// ------------------- FIND END ----------------------------------------------
