$(function() {
    if (!('localStorage' in window) || window.localStorage == null) {
        return;
    }

    var key = 'jstu4-lastsave',
        input = $('#input-program'),
        lastsave = localStorage.getItem(key) || '';

    input.val(lastsave);

    input.keyup(function() {
        var newsave = input.val();

        if (newsave != lastsave) {
            localStorage.setItem(key, newsave);
            lastsave = newsave;
        }
    });
});
