(function($) {
var datPlaceholder = 'placeholder',
    origVal = $.fn.val,
    focusHandler = function() {
        var self = $(this),
            data = self.data(datPlaceholder);
        if(data.enabled) {
            origVal.call(self, '');
        }
        data.enabled = false;
        if(data.cssClass) {
            self.removeClass(data.cssClass);
        }
        self.data(datPlaceholder, data);
    },
    blurHandler = function() {
        var self = $(this),
            data = self.data(datPlaceholder);
        if(origVal.call(self) === '') {
            data.enabled = true;
            if(data.cssClass) {
                self.addClass(data.cssClass);
            }
            origVal.call(self, data.text);
        }
        self.data(datPlaceholder, data);
    };

$.fn.val = function(value) {
    var data = $(this).data(datPlaceholder);
    if(typeof(value) === 'undefined' && data.enabled) {
        // Return empty string when
        // 1. we are getting a value
        // 2. element has data(datPlaceholderEnabled)
        // 3. this data is true
        return '';
    } else if(typeof(value) === 'undefined') {
        return origVal.call(this);
    } else {
        // Otherwise return original val
        return origVal.call(this, value);
    }
};

/**
 * Put a placeholder text to input elements like input/text or textarea
 * - phText - text to write as a placeholder [optional]
 *            if not set or is null, the 'placeholder' attribute will be
 *            considered
 * - cssClass - class to assign when placeholder is active [optional]
 */
$.fn.placeholder = function(phText, cssClass) {
    this.each(function() {
        var self = $(this),
            text = phText || self.attr('placeholder'),
            data = {
                enabled: false,
                text: text,
                cssClass: cssClass
            };

        if(!text) {
            return;
        }

        // Don't let browser handle placeholders
        self.removeAttr('placeholder');

        // Initially, enable placeholder when value is equal
        // to the placeholder text
        // That's necessary for properly handling 'back' button
        if(origVal.call(self) === '' || origVal.call(self) === data.text) {
            if(data.cssClass) {
                self.addClass(data.cssClass);
            }
            origVal.call(self, data.text);
            data.enabled = true;
        }

        // store text, enabled-state and cssClass to placeholdered element's data
        self.data(datPlaceholder, data);

        self.blur(blurHandler);
        self.focus(focusHandler);
    });
};
})(jQuery);


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
