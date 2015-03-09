'use strict'
requirejs.config(configure.get('requirejsSettings'));

require([
    'backbone',
    'jquery-bottom',
    'pager',
    'bootstrap-tagsinput-angular',
    'bootstrap-tagsinput'
], function(Backbone) {
    var userId = $('#user-info').data('user_id');
    var AppRouter = Backbone.Router.extend({
        routes: {
            'user/:id': 'user',
            'user/:id/like': 'like',
            'user/:id/comment': 'comment',
            'user/edit': 'edit'
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

            $('#follow').click(function(){
                var csrf = $('meta[name=csrf-token]').attr('content');
                var tag = $(this);
                if (tag.hasClass('js-follow')) {
                    $.ajax({
                        type: 'post',
                        url: '/user_relation_ship/follow',
                        data: {
                            followedUserId: userId,
                            _csrf: csrf
                        },
                        success: function(data){
                            $('#follow').html('話してみたい✖︎');
                            $('#follow').removeClass('js-follow');
                            $('#follow').addClass('js-unfollow');
                            $('#follow').removeClass('label-primary');
                            $('#follow').addClass('label-info');
                            var followedCount = $('#followedCount').html();
                            $('#followedCount').html(parseInt(followedCount) + 1);
                        },
                        error: function(){
                            console.log('follow error');
                        }
                    });
                } else if (tag.hasClass('js-unfollow')) {
                    $.ajax({
                        type: 'post',
                        url: '/user_relation_ship/unfollow',
                        data: {
                            followedUserId: userId,
                            _csrf: csrf
                        },
                        success: function(data){
                            $('#follow').html('話してみたい');
                            $('#follow').removeClass('js-unfollow');
                            $('#follow').addClass('js-follow');
                            $('#follow').removeClass('label-info');
                            $('#follow').addClass('label-primary');
                            var followedCount = $('#followedCount').html();
                            $('#followedCount').html(parseInt(followedCount) - 1);
                        },
                        error: function(){
                            console.log('unfollow error');
                        }
                    });
                }
            });
        },
        user: function() {
            $('.js-pager').click(function() {
                var $el = $(this);
                var updateDatetime = $('#rooms >  .col-md-4 > li').last().data('updatedatetime');
                if (!updateDatetime) {
                    $el.remove();
                    return;
                }

                $.ajax({
                    type: 'GET',
                    url: '/user/post_pager',
                    data: {
                        user_id: userId,
                        updateDatetime: updateDatetime
                    },
                    success: function(roomList){
                        if (!roomList.length) {
                            $el.remove();
                            return;
                        }

                        var $ap = $('#rooms');
                        var template = _.template($('#template-room').html());
                        _.each(roomList, function(room){
                            $ap.append(template(room));
                        });
                    },
                    error: function(){
                        $el.remove();
                    }
                });
            });
        },
        like: function() {
            $('.js-pager').click(function() {
                var $el = $(this);
                var updateDatetime = $('#rooms >  .room > a > div').last().data('updatedatetime');
                if (!updateDatetime) {
                    $el.remove();
                    return;
                }

                $.ajax({
                    type: 'GET',
                    url: '/user/like_pager',
                    data: {
                        user_id: userId,
                        updateDatetime: updateDatetime,
                    },
                    success: function(likeList){
                        if (!likeList.length) {
                            $el.remove();
                            return;
                        }

                        var $ap = $('#rooms');
                        var template = _.template($('#template-like').html());
                        _.each(likeList, function(like){
                            $ap.append(template(like));
                        });
                    },
                    error: function(){
                        $el.remove();
                    }
                });
            });
        },
        comment: function() {
            $('.js-pager').click(function(){
                var $el = $(this);
                var updateDatetime = $('#rooms >  .col-md-4.col-lg-4 > li').last().data('updatedatetime');
                if (!updateDatetime) {
                    $el.remove();
                    return;
                }

                $.ajax({
                    type: 'GET',
                    url: '/user/comment_pager',
                    data: {
                        user_id: userId,
                        updateDatetime: updateDatetime,
                    },
                    success: function(roomList){
                        if (!roomList.length) {
                            $el.remove();
                            return;
                        }

                        var $ap = $('#rooms');
                        var template = _.template($('#template-comment').html());
                        _.each(roomList, function(room){
                            $ap.append(template(room));
                        });
                    },
                    error: function(){
                        $el.remove();
                    }
                });
            });
        },
        edit: function() {

        }
    });
    window.router = new AppRouter();
    Backbone.history.start({pushState: false, hashChange: false});
});
