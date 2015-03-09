'use strict'
requirejs.config(configure.get('requirejsSettings'));

require([
    'backbone',
    'jquery-bottom',
    'pager'
], function() {
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'index'
        },
        initialize: function() {
            $('#js-back').click(function(){
                history.back();
            });

            $(document).on('click', '.js-room-like', function(){
                var $el = $(this);
                if (!$el.hasClass('active')) {
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
        index: function(){
            $('.js-pager').click(function(){
                var $el = $(this);
                var lastRoomId = $('#room-feed > .col-md-4 > li').last().data('room-id');
                if (!lastRoomId) {
                    $el.addClass('none');
                    return;
                }

                $.ajax({
                    type: 'GET',
                    url: '/newarrivals',
                    data: {
                        offset: 1,
                        less_than_id: lastRoomId,
                    },
                    success: function(data){
                        var $ap = $('#room-feed');
                        var tpl = $('#template-room').html();
                        _.each(data, function(d){
                            var out = _.template(tpl, d);
                            $ap.append(out);
                        });
                        if(data.length < 9) $el.addClass('none');
                    },
                    error: function(){
                        $el.addClass('none');
                    }
                });
            });
        }
    });
    window.router = new AppRouter();
    Backbone.history.start({pushState: false, hashChange: false});
    // return new AppRouter();
});
