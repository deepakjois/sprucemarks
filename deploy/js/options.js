var s = {
    "action": {}, // will hold various action oriented functions
    "option": {} // will be retreived from the background.js page
};

s.action.init = function() {
    var request = {'request': 'options'},
        init_resume = function(response) {
            s.option = response; // all our options are based on background.js which should be considred authoritative
            jQuery('input[type=checkbox]').bind('change', function() {
                s.action.option_display_update(this);
            });
            jQuery('.true, .false').on('click', function(e) {
                e.preventDefault();
                var t = jQuery(this);
                t.parents('.option').find('input[type=checkbox]').first().prop('checked', (t.prop('class') === 'true')).change();
            });
            s.action.restore_options();
            jQuery('#save-area').on('click', function(e) {
                e.preventDefault();
                s.action.save_options();
            });
        };
    if (chrome.extension.sendMessage === undefined) {
        // for Chrome 20+
        chrome.extension.sendRequest(request, init_resume);
    } else {
        // for Chrome 19 and lower
        chrome.extension.sendMessage(request, init_resume);
    }
};

s.action.option_display_update = function(t, speed) {
    t = jQuery(t);
    speed = (speed === undefined) ? 300 : 0;
    var checked = t.prop('checked').toString();
    t.parent().siblings('.option-example').children('.true, .false').each(function() {
        var $this = jQuery(this);
        if (checked === $this.prop('class')) {
            $this.stop(true).fadeTo(speed, 1);
        } else {
            $this.stop(true).fadeTo(speed, 0.2);
        }
    });
};

s.action.restore_options = function() {
    var i, j, type;
    for (i in s.option) {
        j = jQuery('#' + i);
        type = j.prop('type').toLowerCase();
        if (type === 'checkbox') {
            j.prop('checked', s.option[i]);
            s.action.option_display_update('#' + i, 'Faster, Pussycat! Kill! Kill!');
        } else {
            j.val(s.option[i]);
        }
    }
};

s.action.save_options = function() {
    var i, j, type, round_number,
        request = {
            'request': 'options_set',
            'option': s.option
        },
        animate = function() {
            jQuery('#options-saved').fadeIn(500).delay(3000).fadeOut(500); // Show options-saved text to please the humans
        };
    for (i in s.option) {
        j = jQuery('#' + i);
        type = j.prop('type').toLowerCase();
        if (type === 'checkbox') {
            s.option[i] = j.prop('checked'); // returns true or false
        } else if (type === 'number') {
            round_number = Math.abs(Math.round(j.val()));
            s.option[i] = (isNaN(round_number)) ? '0' : round_number.toString();
        } else {
            s.option[i] = j.val();
        }
    }
    console.log(s.option);
    if (chrome.extension.sendMessage === undefined) {
        // for Chrome 19 or lower
        chrome.extension.sendRequest(request, animate);
    } else {
        // for Chrome 20+
        chrome.extension.sendMessage(request, animate);
    }
};

jQuery(document).ready(function() {
    s.action.init();
});