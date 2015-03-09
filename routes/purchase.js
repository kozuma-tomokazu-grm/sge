var WebPay = require('webpay');

exports.init = function(app) {

    app.post('/purchare', function(req, res) {
        var data = req.body;
        console.log(data);

        //var webpey = new WebPay('test_secret_0tgco269cehdcC57jW7nY4dP');
        //
        //webpay.charge.create({
        //    amount: 400,
        //    currency: "jpy",
        //    card: {
        //        number: "4242-4242-4242-4242",
        //        exp_month: 11,
        //        exp_year: 2014,
        //        cvc: "123",
        //        name: "KEI KUBO"
        //    },
        //    capture: false
        //}, function(error, res) {
        //    if (error) {
        //        console.log(error);
        //    }
        //    
        //});
        res.redirect('/');
    });
});
