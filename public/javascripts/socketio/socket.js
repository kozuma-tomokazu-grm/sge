$(function() {
    var sessionUserId = $('meta[name=sessionUserId]').attr('content');
    var notificationSpace = io.connect('/notification/' + sessionUserId);
    notificationSpace.on('new_message', function(newMessageCount) {
        var $ap = $('.glyphicon.glyphicon-comment');
        var $badge = $('.redbadge');
        if ($badge) {
            $badge.remove();
        }

        $ap.append(_.template($('#template-badge').text(), {
            newMessageCount: newMessageCount
        }));
    });
    notificationSpace.on('disconnect', function(messsage) {
        console.log('切断されました');
    });

    var messageNameSpace = io.connect(location.href);

    messageNameSpace.on('emit_from_server', function(message) {
        var $ap = $('.comments-list');

        message._csrf = $('meta[name=csrf-token]').attr('content');
        var sessionddUserId = $('meta[name=sessionUserId]').attr('content');

        if(message.fromUserId == sessionUserId) {
            message.delete_form = true;
        } else {
            message.delete_form = false;
        }

        $ap.prepend(_.template($('#template-message').text(), message));

        var newMessageCount = $('#messageBadge').val();

    });

    messageNameSpace.on('delete_message', function(data) {
        $('[data-comment-id="' + data.messageId + '"]').remove();
    });

    messageNameSpace.on('disconnect', function(messsage) {
        $('.comments-list').append($('<li>').text('切断されました'));
    });
});
