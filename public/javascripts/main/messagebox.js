'use strict'
requirejs.config(configure.get('requirejsSettings'));

require([
    'backbone',
    'jquery-bottom',
    'pager'
], function() {
    var AppRouter = Backbone.Router.extend({
        routes: {
            'message/message_box': 'message_box'
        },
        initialize: function() {
            $('#js-back').click(function(){
                history.back();
            });

            $(document).on('click', '.js-pager', function(){
                var $el = $(this);
            });
        },
        message_box: function(){
            $('.js-pager').click(function(){
                var $el = $(this);
                var _csrf = $('meta[name=csrf-token]').attr('content');
                var lastUpdateDatetime = $('.messageGroup-list > li').last().data('update-time');

                if (!lastUpdateDatetime) {
                    $el.addClass('none');
                    return;
                }   

                $.ajax({
                    type: 'POST',
                    url: '/message/more_user',
                    data: {
                        _csrf: _csrf,
                        lastUpdateDatetime: lastUpdateDatetime
                    },
                    success: function(data) {
                        if (data.messageGroupList.length) {                        
                            data.messageGroupList.forEach(function(messageGroup) {
                                var $ap = $('.messageGroup-list');

                                var _csrf = $('meta[name=csrf-token]').attr('content');

                                $ap.append(_.template($('#template-messagebox').text(), {
                                    messageGroupId: messageGroup.messageGroupId,
                                    updateDatetime: messageGroup.updateDatetime,
                                    _csrf: _csrf,
                                    imagePath: messageGroup.user.imagePath,
                                    toUserId: messageGroup.user.userId,
                                    username: messageGroup.user.username,
                                    newMessageFlag: messageGroup.user.newMessageFlag, 
                                    formatUpdateDatetime: messageGroup.formatUpdateDatetime,
                                    userId: messageGroup.user.userId
                                }));
                            });
                        } else {
                            $el.addClass('none');
                        }
                    },
                    error: function() {
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
