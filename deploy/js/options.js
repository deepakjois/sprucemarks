//-----------
// Variables
//-----------
var s = {
    "action": {}, // will hold various action oriented functions
    "option": {}  // will be retrieved from the background.js page
}

//-----------
// Functions
//-----------
s.action.init = function() {
    var request = { 'request': 'options' }

    var init_resume = function(response) {
        var items, i

        s.option = response // all our options are based on background.js which should be considered authoritative

        s.action.restore_options()

        items = document.querySelectorAll('input[type=checkbox]')
        for (i = 0; i < items.length; i++) {
            items[i].addEventListener('change', function() {
                s.action.option_display_update(this)
            })
        }

        items = document.querySelectorAll('.true, .false')
        for (i = 0; i < items.length; i++) {
            items[i].addEventListener('click', function(e) {
                var checkbox = this.parentElement.parentElement.querySelector('input[type=checkbox]')
                if (!this.classList.contains(checkbox.checked.toString())) {
                    checkbox.checked = !checkbox.checked
                    checkbox.dispatchEvent(new Event('change'))
                }
            })
        }

        document.getElementById('save-button').addEventListener('click', function(e) {
            e.preventDefault()
            s.action.save_options()
        })
    }

    chrome.extension.sendMessage(request, init_resume)
} // s.action.init

s.action.option_display_update = function(t, animate) {
    if (animate !== false) {
        animate = true
    }

    var checkedClass = t.checked.toString()
    var choices = t.parentElement.parentElement.querySelectorAll('.true, .false')

    for (var i = 0; i < choices.length; i++) {
        if (animate) {
            choices[i].classList.remove('no-transition')
        } else {
            choices[i].classList.add('no-transition')
        }

        if (choices[i].classList.contains(checkedClass)) {
            choices[i].classList.add('active')
        } else {
            choices[i].classList.remove('active')
        }
    }
} // s.action.option_display_update

s.action.restore_options = function() {
    var element, i
    for (i in s.option) {
        element = document.getElementById(i)
        if (element.type === 'checkbox') {
            element.checked = s.option[i]
            s.action.option_display_update(element, false)
        } else {
            element.value = s.option[i]
        }
    }
} // s.action.restore_options

s.action.save_options = function() {
    var element, round_number

    for (var i in s.option) {
        element = document.getElementById(i)
        if (element.type === 'checkbox') {
            s.option[i] = element.checked // returns true or false
        } else if (element.type === 'number') {
            round_number = Math.abs(Math.round(element.value))
            s.option[i] = (isNaN(round_number)) ? '0' : round_number.toString()
        } else {
            s.option[i] = element.value
        }
    }

    var request = {
        'request': 'options_set',
        'option': s.option
    }

    var animate = function() {
        document.getElementById('options-saved').classList.add('saved-animation')
        setTimeout(function() {
            document.getElementById('options-saved').classList.remove('saved-animation')
        }, 5250) // 250 ms more than the CSS animation
    }

    chrome.extension.sendMessage(request, animate)
} // s.action.save_options

//------------
// Party Time
//------------
s.action.init()
