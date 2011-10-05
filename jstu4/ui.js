(function() {

var

/* Shortcut to the templating engine */
T = $.HotMilk,

/* locale */
L = (function(lang) {
    return $.extend(true,
        $.extend(true, { 'lang': lang }, i18n['en']),
        i18n[lang]);
})($.getRequestParameter('lang') || 'en'),

/** Construct a model for the template engine */
constructTemplateModel = function(values) {
    return $.extend({
        'version': TM.version,
        'lang': L.lang
    }, values);
},

/** Maximize the height of TEXTAREA.program and DIV.program */
deferredResizeProgramBlocks = function() {
    setTimeout(function() {
        $('.program').each(function() {
            var p = this.parentNode,
                m = parseFloat($(p).css('padding-bottom').replace('px', ''));
            $(this).css('height', 
                (p.clientHeight - this.offsetTop + p.offsetTop - m) + 'px');
        });
    }, 0);
},

/** TMRun instance of the currently running TM */
tmRun,

UIModes = {
    /** Edit program and tape */
    edit: 'edit',
    /** Run program step by step or quickly */
    run: 'run',
    /** Display compile error */
    error: 'error'
},

curUIMode = UIModes.edit,

setUIMode = function(mode) {
    var el;
    for(var m in UIModes) {
        el = el ? el.add('.mode-' + m) : $('.mode-' + m);
    }
    el.each(function() {
        if($(this).hasClass('mode-' + mode)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });

    curUIMode = mode;

    deferredResizeProgramBlocks();
},

charToHTML = function(c) {
    return c === '<' ? '&lt;' :
           c === '>' ? '&gt;' :
           c === '&' ? '&amp;' :
           c === ' ' ? '&nbsp;' :
           c === '\n' ? '<br/>' :
           c;
},

toHTML = function(text) {
    return text.replace(/[\s<>&]/g, charToHTML);
},

tapeToHTML = function(tape, pos) {
    while(tape.length <= pos) {
        tape += ' ';
    }
    return toHTML(tape.substring(0, pos)) + 
        '<span class="current">' + 
        charToHTML(tape.charAt(pos)) + '</span>' + 
        toHTML(tape.substring(pos + 1));
},

// controls
cDisplayProgram,
cInputProgram,
cDisplayTape,
cInputTape,

textareaCursorPosForced = null,

selectCommand = function(cmd) {
    $('.current', cDisplayProgram).addClass('visited')
        .removeClass('current');

    $('#command-' + cmd.data.id).addClass('current');

    textareaCursorPosForced = cmd.data.offset;
},

doStart = function() {
    var text = cInputProgram.val(),
        htmlParts = [],
        pos = 0,
        cmdID = 0,
        tm,
        success = true,
        scroll = cInputProgram.scrollTop(),
        callback = function(cmd) {
            // add whitespace to the html
            htmlParts.push(toHTML(text.substring(pos, cmd.data.offset)));

            cmd.data.id = cmdID++;
            htmlParts.push('<span id="command-' + cmd.data.id + '">' + 
                    toHTML(cmd.data.src) + '</span>');

            pos = cmd.data.offset + cmd.data.src.length;
        };
    
    try {
        tm = TM.compile(text, 0, callback);
    } catch(err) {
        if(err instanceof TM.CouldntParseError) {
            cDisplayProgram.html(
                    toHTML(text.substring(0, err.data.offset)) +
                    '<span class="error">' + charToHTML(text.charAt(err.data.offset)) + '</span>' +
                    toHTML(text.substring(err.data.offset + 1)));
            textareaCursorPosForced = err.data.offset;
        }
        setUIMode(UIModes.error);
        success = false;
        // first, scroll to the position we were during editing
        cDisplayProgram.scrollTo(scroll);
        // second, scroll to error if necessary
        cDisplayProgram.scrollTo('.error');
    }
    if(success) {
        cDisplayProgram.html(htmlParts.join(''));
        tmRun = tm.run(cInputTape.val());
        cDisplayTape.html(tapeToHTML(tmRun.tape(), tmRun.pos()));
        setUIMode(UIModes.run);
        cDisplayProgram.scrollTo(scroll);
        selectCommand(tmRun.nextCommand());
    }
},

doStep = function() {

},

doQuick = function() {

},

doEdit = function() {
    var scroll = cDisplayProgram.scrollTop();
    tmRun = null;
    setUIMode(UIModes.edit);
    if(textareaCursorPosForced !== null) {
        setTimeout(function() {
            cInputProgram.focus();
            cInputProgram.selectRange(
                textareaCursorPosForced,
                textareaCursorPosForced);
            textareaCursorPosForced = null;
        }, 10);
    }
    cInputProgram.scrollTo(scroll);
};

for(var k in L.templates) {
    T.$addTemplate(k, L.templates[k]);
}

$(function() {
    cDisplayProgram = $('#display-program');
    cInputProgram = $('#input-program');
    cDisplayTape = $('#display-tape');
    cInputTape = $('#input-tape');

    // draw localized texts
    var m = constructTemplateModel();

    document.title = T.title(m);
    $('.title').text(T.title(m));

    cInputTape.placeholder(L.texts.tape, 'placeholder-active');
    cInputProgram.placeholder(L.texts.program, 'placeholder-active');

    for(var k in L.ui) {
        var arr = k.split('@');
        if(arr.length == 1) {
            $(k).html(L.ui[k]);
        } else {
            $(arr[0]).attr(arr[1], L.ui[k]);
        }
    }

    deferredResizeProgramBlocks();
    $(window).resize(deferredResizeProgramBlocks);

    $('#btn-start').click(function() {
        doStart();
        return false;
    });
            
    $('#btn-edit').click(function() {
        doEdit();
        return false;
    });

    cDisplayProgram.click(function() {
        doEdit();
        return false;
    });

    cDisplayTape.click(function() {
        doEdit();
        return false;
    });

    cInputTape.click(function() {
        if(curUIMode != UIModes.edit) {
            doEdit();
        }
        return false;
    });

    setUIMode(UIModes.edit);
});

})();
