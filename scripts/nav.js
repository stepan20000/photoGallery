function navFun() {
  // Toggle visibility of the dropdowns
  $('.nav .nav__list .nav__list-li > .nav__link:not(:only-child)').click(function(e) {
    e.stopPropagation();
    $(this).siblings('.nav__dropdown').toggle();
  });
// Hide the dropdowns if clicked anywhere
  $('html').click(function() {
      $('.nav__dropdown').hide();
    });
// Toggle the .active span
  $('#nav-toggle').on('click', function() {
    this.classList.toggle('active');
  });
  
  $('#nav-toggle').click(function() {
    $('.nav .nav__list').toggle();
  });
  
  
  $('#nav-login').on('click', function () {
    if(noLoacalStorage) {
      alert('Sorry you can not Log in and uppload image because your browser does not support localStorage')
    } else {
      if(loggedUser) {
        loggedDialog();
      } else {
        loginDialog();
      }
    }
  });
// Event listener for closing of the dialog window  
  $('.dialog-window').on('click', function (evt) {
    switch(evt.target) {
      case $('#dialog-window-close')[0]:
        $('.dialog-window').fadeOut();
        break;
    }
  });
  
}