'use strict'
requirejs.config(configure.get('requirejsSettings'));

require([
    'backbone',
    'jquery-bottom',
    'pager',
], function() {
    var AppRouter = Backbone.Router.extend({
        routes: {
            'follow_feed': 'follow_feed'
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
        follow_feed : function() {
            $('.js-pager').click(function(){
                var $el = $(this);
                var lastRoomId = $('#room-feed > .col-md-4 > li').last().data('room-id');
                if (!lastRoomId) {
                    $el.addClass('none');
                    return;
                }
    
                $.ajax({
                    type: 'GET',
                    url: '/follow_feed/follow_feed_pager',
                    data: {
                        less_than_id: lastRoomId,
                    },
                    success: function(roomList){
                        var $ap = $('#room-feed');
                        var template = _.template($('#template-room').html());
                        _.each(roomList, function(room){
                            $ap.append(template(room));
                        });
                        if(roomList.length < 9) $el.remove();
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
