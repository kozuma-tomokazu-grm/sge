$(function() {
    // オプションのproximityでbottom.jsを発生する位置を指定する
    $(window).bottom({proximity: 0.05});
    if ($('.js-pager').length) {
        $(window).bind('bottom', function() {

            var obj = $(this);

            // 「loading」がfalseの時に実行
            if (!obj.data('loading')) {

                // 「loading」をtrueにする
                obj.data('loading', true);

                // 追加したい処理を記述
                setTimeout(function() {

                    $('.js-pager').trigger('click');

                    // 処理が完了したら「loading」をfalseにする
                    obj.data('loading', false);

                }, 1500);
            }

        });
    }
});