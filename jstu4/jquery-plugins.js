/** Return a url query parameter with the given name */
jQuery.getRequestParameter = function(name) {
    var re = new RegExp("(?:[?&]|^)" +
            encodeURIComponent(name) + "=([^?&]*)(?:[?&]|$)"),
        res = re.exec(window.location.search);
    if(res === null) return null;
    else return res[1];
};

/** Scrolls to specified position or to show specified element */
jQuery.fn.scrollTo = function(value) {
    var self = $(this);
    setTimeout(function() {
        if(typeof(value) === 'number') {
            self.scrollTop(value);
        } else if(typeof(value) === 'string') {
            var el = $(value);
            if(el.length == 0) {
                return;
            }
            var elTop = el.position().top,
                elH = el.height(),
                selfTop = self.position().top,
                selfH = self.height();

            if(elTop < selfTop) {
                self.scrollTop(self.scrollTop() - (selfTop - elTop));
            } else if(elTop + elH > selfTop + selfH) {
                self.scrollTop(self.scrollTop() + (elTop + elH) - (selfTop + selfH));
            }
        }
    }, 0);
};

/**
 * Set text selection range in textarea or input
 * CODE FROM HERE: http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
 */
jQuery.fn.selectRange = function(start, end) {
    return this.each(function() {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};
