'use strict'
requirejs.config(configure.get('requirejsSettings'));

require([
    'backbone'
], function() {
    var AppRouter = Backbone.Router.extend({
        routes: {
            'room/:id': 'room',
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
                        url: '/room/unlike',
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
        room: function(){
            $('.js-more-comment').click(function(){
                var $el = $(this);
                var updateDatetime = $('.comments-list > li').last().data('updatedatetime');
                var roomId = $('#room').data('room-id');
                if (!updateDatetime) {
                    $el.remove();
                    return;
                }

                $.ajax({
                    type: 'GET',
                    url: '/room/comment',
                    data: {
                        room_id: roomId,
                        updateDatetime: updateDatetime
                    },
                    success: function(data){
                        if(!data.length) {
                            $el.remove();
                            return;    
                        }
                        var $ap = $('.comments-list');
                        var tpl = $('#template-comment').html();
                        _.each(data, function(d){
                            d._csrf = $('meta[name=csrf-token]').attr('content');
                            var out = _.template(tpl, d);
                            $ap.append(out);
                        });
                    },
                    error: function(){
                        $el.addClass('none');
                    }
                });
            });
            $('.js-delete').click(function(){
                if(!confirm('削除してよろしいですか？')){
                    return false;
                }
            });
        }
    });
    window.router = new AppRouter();
    Backbone.history.start({pushState: false, hashChange: false});
    // return new AppRouter();
});
