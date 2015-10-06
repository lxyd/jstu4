$(document).ready(function() {
    //проверяем на доступность
     if (('localStorage' in window) && window.localStorage !== null){
         
         if(localStorage.getItem("jstu4-lastsave")==null){
             localStorage.setItem("jstu4-lastsave", "");
         }
         
    var lastsave = localStorage.getItem("jstu4-lastsave");
    var newsave = lastsave;
    //Загружаем в textarea программу из localstorage
    $('#input-program').val(lastsave);
    
    
    $('#input-program').keyup(function(){
        newsave = $('#input-program').val();
        //было ли изменение?
        if(newsave!=lastsave){
           localStorage.setItem("jstu4-lastsave", newsave);
           lastsave=newsave;
        }
    });
     }
});
