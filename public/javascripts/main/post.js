'use strict'
requirejs.config(configure.get('requirejsSettings'));

require([
    'backbone',
    'jquery-ui-core',
    'jquery-ui-datepicker',
    'jquery-ui-slider-access',
    'jquery-timepicker-addon',
    'datepicker',
    'slider'
], function() {
    var AppRouter = Backbone.Router.extend({
        routes: {
            'post': 'post',
            'post/edit/:id': 'post'
        },
        initialize: function() {
            $('#js-back').click(function(){
                history.back();
            });

            $(document).on('click', '.js-room-like', function(){
                var $el = $(this);
                if(!$el.hasClass('active')){
                    $.ajax({
                        type: 'POST',
                        url: '/room/like',
                        data: {
                            _csrf: $('meta[name=csrf-token]').attr('content'),
                            room_id: $el.data('room_id')
                        },
                        success: function(data) {
                            $el.addClass('active');
                            var count = parseInt($el.children('.count').html());
                            $el.children('.count').html(count + 1);
                        },
                        error: function() {
                        }
                    });
                } else {
                    $.ajax({
                        type: 'POST',
                        url: '/room/like',
                        data: {
                            _csrf: $('meta[name=csrf-token]').attr('content'),
                            room_id: $el.data('room_id')
                        },
                        success: function(data) {
                            $el.removeClass('active');
                            var count = parseInt($el.children('.count').html());
                            $el.children('.count').html(count - 1);
                        },
                        error: function(){
                        }
                    });
                }
            });
        },
        post: function(){
            var file;

            $('#select-file').click(function(){
                $("#upload-file").click();
            }),
            $('#upload-file').change(function(){
                var $box = $('#select-file');
                var $text = $box.find('.text');
                var $img = $box.find('img');
                if(!this.files.length){
                    $text.removeClass('none');
                    $img.addClass('none');
                    return;
                }

                file = this.files[0];
                var fileReader = new FileReader();
                fileReader.onload = function(event) {
                    $text.addClass('none');
                    $img.removeClass('none');
                    $img.attr('src', event.target.result);
                    $('#textarea').focus();
                };
                fileReader.readAsDataURL(file);
            }),
            $('#submit').click(function(){
                $("#submit").val('アップロード中...');
            });
        }
    });
    window.router = new AppRouter();
    Backbone.history.start({pushState: false, hashChange: false});
});