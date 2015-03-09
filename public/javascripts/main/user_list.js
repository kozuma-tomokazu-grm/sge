'use strict'
requirejs.config(configure.get('requirejsSettings'));

require([
    'backbone',
    'jquery-bottom',
    'pager',
    'bootstrap-tagsinput-angular',
    'bootstrap-tagsinput'
], function(Backbone) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            'user_list/': 'user_list'
        },
        initialize: function() {
            $('#js-back').click(function(){
                history.back();
            });

            $('.follow').click(function(){
                var csrf = $('meta[name=csrf-token]').attr('content');
                var tag = $(this);
                var userId = tag.data('user_id');

                if (tag.hasClass('js-follow')) {
                    $.ajax({
                        type: 'post',
                        url: '/user_relation_ship/follow',
                        data: {
                            followedUserId: userId,
                            _csrf: csrf
                        },
                        success: function(data){
                            tag.html('話してみたい✖︎');
                            tag.removeClass('js-follow');
                            tag.addClass('js-unfollow');
                            tag.removeClass('label-primary');
                            tag.addClass('label-info');
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
                            tag.html('話してみたい');
                            tag.removeClass('js-unfollow');
                            tag.addClass('js-follow');
                            tag.removeClass('label-info');
                            tag.addClass('label-primary');
                        },
                        error: function(){
                            console.log('unfollow error');
                        }
                    });
                }
            });

            $('.js-pager').click(function(){
                var $el = $(this);
                var updateDatetime = $('#user >  ul > .user-info > li').last().data('updatedatetime');
                if (!updateDatetime) {
                    $el.remove();
                    return;
                }

                $.ajax({
                    type: 'get',
                    url: '/user_list_pager',
                    data: {
                        updateDatetime: updateDatetime
                    },
                    success: function(data){
                        var $ap = $('#userList');
                        var tpl = $('#template-userList').html();

                        if (data && data.userList && !data.userList.length) {
                            $el.remove();
                            return;
                        }

                        _.each(data.userList, function(user){
                            user.followMap = data.followMap;
                            var out = _.template(tpl, user);
                            $ap.append(out);
                        });
                    },
                    error: function(){
                        $el.remove();
                    }
                });
            });
        }
    });
    window.router = new AppRouter();
    Backbone.history.start({pushState: false, hashChange: false});
});
