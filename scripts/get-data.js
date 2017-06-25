//ID's of users who gave access to their accounts
var users = [5604673568, 5611812646, 5612036694, 5617349057];
// Instagram's access token
var token = '5604673568.7436976.80a61fbf539244dbab7f434b32ece141';
// In Sandbox mode we can only load maximum 20 media an one request
var numPhotos = 20;
// List of data we obtain from instagram API 
var mediaList = [];
var relevanceInterval = 1800000;

// MAke an ajax request for single user last media
function getUserMedias(userId) {
  return $.ajax({
    url: 'https://api.instagram.com/v1/users/' + userId + '/media/recent',
    dataType: 'jsonp',
    type: 'GET',
    data: {access_token: token, count: numPhotos}
  });
}

// Save received media at array
function saveMedias(data) {
  for(var i in data){
      for(var j in data[i].data){
        if(data[i].data[j].type == "image" || data[i].data[j].type == "carousel"){
          mediaList.push(data[i].data[j]);
        }
      }
    }
//Sort media according to the creatied time
  mediaList.sort(function(a, b){
    return b.created_time - a.created_time;
  });
  if (typeof(Storage) !== "undefined") {
    sessionStorage.setItem("photoAlbum", JSON.stringify(mediaList));
    sessionStorage.setItem("timestamp", String(Date.now()));
  } 
  else {
    alert("Sorry! No Web Storage support..");
    return;
  }
  console.log(mediaList);
}

// Make ajax request for all users in parallel after receiveng all data invoke main function
function getData(fun) {
  Promise.all(users.map(getUserMedias)).then(
    function (data) {
      saveMedias(data);
      fun();
    },
    function(error){
      console.log(error);
    }
  );
}