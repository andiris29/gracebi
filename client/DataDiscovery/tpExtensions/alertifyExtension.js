alertify.reset = function() {
    alertify.set({
        'labels' : {
            'ok' : 'OK',
            'cancel' : 'Cancel'
        },
        'delay' : 5000,
        'buttonReverse' : false,
        'buttonFocus' : 'ok'
    });
};
