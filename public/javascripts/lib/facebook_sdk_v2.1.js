window.fbAsyncInit = function() {
    var meta = document.getElementsByTagName('meta');
    var app_id = '1395993034016573';
    for(var i=0; i < meta.length; i++) {
        if(meta[i].getAttribute("property")=="fb:app_id") {
            app_id = meta[i].getAttribute("content");   
        }
    }

    FB.init({
        appId : app_id,
        xfbml : true,
        version : 'v2.1'
    });

    // ADD ADDITIONAL FACEBOOK CODE HERE
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
