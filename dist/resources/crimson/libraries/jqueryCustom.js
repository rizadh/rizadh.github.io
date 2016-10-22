(function($) {

    /* addClass shim
     ****************************************************/
    var addClass = $.fn.addClass;
    $.fn.addClass = function(value) {
        var orig = addClass.apply(this, arguments);

        var elem,
            i = 0,
            len = this.length;

        for (; i < len; i++) {
            elem = this[i];
            if (elem instanceof SVGElement) {
                var classes = $(elem).attr('class');
                if (classes) {
                    var index = classes.indexOf(value);
                    if (index === -1) {
                        classes = classes + " " + value;
                        $(elem).attr('class', classes);
                    }
                } else {
                    $(elem).attr('class', value);
                }
            }
        }
        return orig;
    };

    /* removeClass shim
     ****************************************************/
    var removeClass = $.fn.removeClass;
    $.fn.removeClass = function(value) {
        var orig = removeClass.apply(this, arguments);

        var elem,
            i = 0,
            len = this.length;

        for (; i < len; i++) {
            elem = this[i];
            if (elem instanceof SVGElement) {
                var classes = $(elem).attr('class');
                if (classes) {
                    var index = classes.indexOf(value);
                    if (index !== -1) {
                        classes = classes.substring(0, index) + classes.substring((index + value.length), classes.length);
                        $(elem).attr('class', classes);
                    }
                }
            }
        }
        return orig;
    };

    /* hasClass shim
     ****************************************************/
    var hasClass = $.fn.hasClass;
    $.fn.hasClass = function(value) {
        var orig = hasClass.apply(this, arguments);

        var elem,
            i = 0,
            len = this.length;

        for (; i < len; i++) {
            elem = this[i];
            if (elem instanceof SVGElement) {
                var classes = $(elem).attr('class');

                if (classes) {
                    if (classes.indexOf(value) === -1) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        }
        return orig;
    };
})(jQuery);

jQuery.fn.selectText = function() {
    var doc = document;
    var element = this[0];
    console.log(this, element);
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};