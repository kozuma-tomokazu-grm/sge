// user page
$('#js-profile-tab-photo').click(function(){
  userTabClicked($(this))
});

// user page
$('#js-profile-tab-like').click(function(){
  userTabClicked($(this))
});

// user page
$('#js-profile-tab-comment').click(function(){
  userTabClicked($(this))
});

var userTabClicked = function($element){
  if(!$element.parent().hasClass('active')){
    $('#user-tab > li').removeClass('active');
    $element.parent().addClass('active');
    $('#rooms').children().remove();
  }
};
