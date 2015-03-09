
/*
 * information page.
 */

exports.init = function(app){

    app.get('/information/about', function(req, res){
        res.render('information/about');
    });

    app.get('/information/terms', function(req, res){
        res.render('information/terms');
    });

    app.get('/information/company', function(req, res) {
        res.render('information/company');
    });

    app.get('/information/koukoku', function(req, res) {
        res.render('information/koukoku');
    });

    app.get('/information/userpolicy', function(req, res) {
        res.render('information/userpolicy');
    });

    app.get('/information/privacypolicy', function(req, res) {
        res.render('information/privacypolicy');
    }); 

    app.get('/information/tokutei', function(req, res) {
        res.render('information/tokutei');
    });
};
