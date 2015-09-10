(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.managers.PopUpManager');

    var PopUpManager = grace.managers.PopUpManager;

    PopUpManager.createPopUp = function(popUp, modal) {
        var $body = $('body');
        var $document = $(document);
        var $layer = $('<div/>').addClass('grace-popup-layer').appendTo($body);
        if (modal) {
            $layer.width($document.width());
            $layer.height($document.height());
        }
        var $popUp = $(popUp.dom());
        $popUp.appendTo($layer);
        return popUp;
    }
    PopUpManager.removePopUp = function(popUp) {
        var $popUp = $(popUp.dom());
        $popUp.parent().detach();
    }
    PopUpManager.centerPopUp = function(popUp) {
        var $popUp = $(popUp.dom());
        var $body = $('body');
        var $root = $body.children().eq(0)
        $popUp.css({
            'left' : ($root.width() - $popUp.width()) / 2 + 'px',
            'top' : ($root.height() - $popUp.height()) / 2 - 36 + 'px'
        });
    }
})(jQuery);
