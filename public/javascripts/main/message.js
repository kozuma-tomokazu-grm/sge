'use strict'
requirejs.config(configure.get('requirejsSettings'));

require([
    'backbone',
    'jquery-bottom',
    'pager'
], function() {
    var AppRouter = Backbone.Router.extend({
        routes: {
            'message/:id': 'message'
        },
        initialize: function() {
            $('#js-back').click(function(){
                history.back();
            });

            $(document).on('click', '.js-pager', function(){
                var $el = $(this);
            });
        },
        message: function(){
            $('.js-pager').click(function(){
                var $el = $(this);
                var _csrf = $('meta[name=csrf-token]').attr('content');
                var messageGroupId = $('.comments-list > li').last().data('group-id');
                var lastUpdateDatetime = $('.comments-list > li').last().data('update-time');
    
                if (!lastUpdateDatetime) {
                    $el.addClass('none');
                    return;
                }

                $.ajax({
                    type: 'POST',
                    url: '/message/more_message',
                    data: {
                        _csrf: _csrf,
                        messageGroupId: messageGroupId,
                        lastUpdateDatetime: lastUpdateDatetime
                    },
                    success: function(messageList) {
                        if (messageList) {                        
                            messageList.forEach(function(message) {
                                var $ap = $('.comments-list');

                                message._csrf = $('meta[name=csrf-token]').attr('content');
                                var sessionUserId = $('meta[name=sessionUserId]').attr('content');

                                if(message.fromUserId == sessionUserId) {
                                    message.delete_form = true;
                                } else {
                                    message.delete_form = false;
                                }
                                $ap.append(_.template($('#template-message').text(), message));
                            });
                            if (messageList.length < 9) $el.addClass('none');
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
