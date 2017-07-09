function allPhotoFun(){
  $(document).ready(function() {  
    navFun();
    var allPhoto= new AllPhoto($(".all-photo")[0]); 
  });
}

start(allPhotoFun);