(function() {

var

/** Shortcut to the templating engine */
T = $.HotMilk,

/** Locale */
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

/** Timer for quick run */
tmTimer = null,
tmTimeout,

stats = {},

leaveQuickMode = function() {
    if(tmTimer) {
        clearInterval(tmTimer);
        tmTimer = null;
    }
},

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

    // every time we switch mode we also stop the quick run
    leaveQuickMode();
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
cLog,
cStats,

/**
 * Forced program textarea cursor position
 * Need this to be able to scroll the textarea
 * to the specified error or command
 */
textareaCursorPosForced = null,

selectCommand = function(cmd) {
    $('.current', cDisplayProgram).addClass('visited')
        .removeClass('current');

    if(cmd) {
        cDisplayProgram.scrollTo('#command-' + cmd.data.id);
        $('#command-' + cmd.data.id).addClass('current');
        textareaCursorPosForced = cmd.data.offset;
    }
},

log = function(text, isError) {
    if (isError == 'warning') {
        cLog.removeClass('info warning error').addClass('warning');
    } else if(isError) {
        cLog.removeClass('info warning error').addClass('error');
    } else {
        cLog.removeClass('info warning error').addClass('info');
    }
    cLog.html(text || '');
},

doCompile = function() {
    var text = cInputProgram.val(),
        htmlParts = [],
        pos = 0,
        cmdID = 0,
        res = {
            tm: null,
            html: '',
            commandsCount: 0
        },
        scroll = cInputProgram.scrollTop(),
        callback = function(cmd) {
            res.commandsCount++;

            // add whitespace to the html
            htmlParts.push(toHTML(text.substring(pos, cmd.data.offset)));

            cmd.data.id = cmdID++;
            htmlParts.push('<span id="command-' + cmd.data.id + '">' +
                    toHTML(cmd.data.src) + '</span>');

            pos = cmd.data.offset + cmd.data.src.length;
        };

    try {
        res.tm = TM.compile(text, 0, callback);
        htmlParts.push(toHTML(text.substring(pos)));
        res.html = htmlParts.join('');

        return res;
    } catch(err) {
        if(err instanceof TM.CouldntParseError) {
            cDisplayProgram.html(
                    toHTML(text.substring(0, err.data.offset)) +
                    '<span class="error">' + charToHTML(text.charAt(err.data.offset)) + '</span>' +
                    toHTML(text.substring(err.data.offset + 1)));
            textareaCursorPosForced = err.data.offset;
            log(T.error.parseError(constructTemplateModel(err.data)), true);

            setUIMode(UIModes.error);
            // first, scroll to the position we were during editing
            cDisplayProgram.scrollTo(scroll);
            // second, scroll to error if necessary
            cDisplayProgram.scrollTo('.error');
        } else if(err instanceof TM.EmptyProgramError) {
            cDisplayProgram.html(toHTML(text));
            log(T.error.programIsEmpty(constructTemplateModel(err.data)), true);

            setUIMode(UIModes.error);
        } else if(err instanceof TM.AmbiguosCommandError) {
            cDisplayProgram.html(htmlParts.join(''));

            textareaCursorPosForced = err.data.cmd.offset;
            log(T.error.ambiguosCommand(constructTemplateModel(err.data)), true);

            $('#command-' + err.data.original.data.id).addClass('error');
            $('#command-' + err.data.cmd.data.id).addClass('error');

            setUIMode(UIModes.error);
            // first, scroll to the position we were during editing
            cDisplayProgram.scrollTo(scroll);
            // second, scroll to errors if necessary
            cDisplayProgram.scrollTo('.error[0]');
            cDisplayProgram.scrollTo('.error[1]');
        } else if(err instanceof TM.NonexistentTargetState) {
            cDisplayProgram.html(htmlParts.join(''));

            textareaCursorPosForced = err.data.cmd.offset;
            log(T.error.targetStateDoesNotExist(constructTemplateModel(err.data)), true);

            $('#command-' + err.data.cmd.data.id).addClass('error');

            setUIMode(UIModes.error);
            // first, scroll to the position we were during editing
            cDisplayProgram.scrollTo(scroll);
            // second, scroll to error if necessary
            cDisplayProgram.scrollTo('.error');
        } else if(err instanceof TM.NonexistentInitialState) {
            cDisplayProgram.html(htmlParts.join(''));

            log(T.error.initialStateDoesNotExist(constructTemplateModel(err.data)), true);

            setUIMode(UIModes.error);
            // first, scroll to the position we were during editing
            cDisplayProgram.scrollTo(scroll);
            // second, scroll to error if necessary
            cDisplayProgram.scrollTo('.error');
        } else {
            throw err;
        }
    }
    return null;
},

doStart = function() {
    var scroll,
        compileResult = doCompile();

    if(compileResult) {
        scroll = cInputProgram.scrollTop()
        cDisplayProgram.html(compileResult.html);
        tmRun = compileResult.tm.run(cInputTape.val());
        cDisplayTape.html(tapeToHTML(tmRun.tape(), tmRun.pos()));
        setUIMode(UIModes.run);
        cDisplayProgram.scrollTo(scroll);
        selectCommand(tmRun.nextCommand());
        log(null);
        // reset stats
        stats = {
            commandsCount: compileResult.commandsCount,
            operationsCount: 0,
            initialDataLength: tmRun.tape().length,
            maxDataLength: tmRun.tape().length
        }
        cStats.html(T.stats(constructTemplateModel(stats)));
    }
},

doStep = function() {
    if(!tmRun.isRunning()) {
        return false;
    }

    try {
        tmRun.step();
        // update stats
        stats.operationsCount++;
        stats.maxDataLength = tmRun.tape().length > stats.maxDataLength ? tmRun.tape().length : stats.maxDataLength;
        cStats.html(T.stats(constructTemplateModel(stats)));
    } catch(err) {
        cDisplayTape.html(tapeToHTML(tmRun.tape(), tmRun.pos()));
        if(err instanceof TM.NoSuchCommandError) {
            log(T.error.noSuchCommand(err.data), true);
        } else if(err instanceof TM.OutOfTapeError) {
            log(T.error.headIsOutOfTape(err.data), true);
        } else {
            throw err;
        }
        return false;
    }

    cDisplayTape.html(tapeToHTML(tmRun.tape(), tmRun.pos()));
    selectCommand(tmRun.nextCommand());

    if(tmRun.isRunning()) {
        log(null);
        return true;
    }

    // check normality
    var src = tmRun.initialTape()
      , cur = tmRun.tape()
      , pos = tmRun.pos();

    if(cur.substring(0, src.length).replace(/\s*$/, '') != src.replace(/\s*$/, '')) {
        log(T.warning.notNormal_SrcAltered(constructTemplateModel()), 'warning');
    } else if(cur.replace(/\s*$/, '').length != pos) {
        log(T.warning.notNormal_Misposition(constructTemplateModel()), 'warning');
    } else {
        log(T.info.finished(constructTemplateModel()));
    }
    return true;
},

quickTimerFunction = function() {
    if(!doStep()) {
        leaveQuickMode();
    }
},

doQuick = function() {
    if(tmTimer) {
        clearInterval(tmTimer);
        tmTimeout = 80 - tmTimeout;
    } else {
        tmTimeout = 70;
    }
    tmTimer = setInterval(quickTimerFunction, tmTimeout);
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
    log(null);
},

doUnmark = function() {
    $('.visited', cDisplayProgram).removeClass('visited');
},

doToTU4 = function() {
    var cmds,
        res,
        states,
        statenum,
        compileResult,
        /** Convert integer state number to string sutable for tu4 */
        intStateToString = function(s) {
            var res;
            // tu4 programs can contain up to 99 decimal or 256 hex states
            // try to use decimal names if possible
            if(statenum >= 100) {
                res = s.toString(16);
            } else {
                res = s.toString(10);
            }
            if(res.length == 1) {
                res = '0' + res;
            }
            return res;
        };

    compileResult = doCompile();
    if(compileResult) {
        cmds = compileResult.tm.commands();
        cmds.sort(function(a, b) {
            return a.data.offset - b.data.offset;
        });

        states = {};
        states[0] = 0; // first state is zeroth one always
        statenum = 1;
        for(var i = 0; i < cmds.length; i++) {
            if(typeof(states[cmds[i].q()]) === 'undefined' || states[cmds[i].q()] === null) {
                states[cmds[i].q()] = statenum ++;
            }
        }

        res = [];
        for(var i = 0; i < cmds.length; i++) {
            res.push(new TM.Command(
                            intStateToString(states[cmds[i].q()]),
                            cmds[i].a(),
                            cmds[i].v(),
                            intStateToString(states[cmds[i].w()])
                         ).toString());
        }

        cInputProgram.val(res.join('\n'));
    }
};

for(var k in L.templates) {
    T.$addTemplate(k, L.templates[k]);
}
T.$addTemplate('helpURL', 'help-{{lang}}.html');

$(function() {
    cDisplayProgram = $('#display-program');
    cInputProgram = $('#input-program');
    cDisplayTape = $('#display-tape');
    cInputTape = $('#input-tape');
    cLog = $('#log');
    cStats = $('#stats');

    // draw localized texts
    var m = constructTemplateModel();

    document.title = T.title(m);
    $('.title').text(T.title(m));

    cInputTape.placeholder(L.texts.tape, 'placeholder-active');
    cInputProgram.placeholder(L.texts.program, 'placeholder-active');

    $('#btn-help').attr('href', T.helpURL(m));

    for(var k in L.ui) {
        var arr = k.split('@');
        if(arr.length == 1) {
            $(k).html(L.ui[k]);
        } else {
            $(arr[0]).attr(arr[1], L.ui[k]);
        }
    }

    // resize program textarea
    deferredResizeProgramBlocks();

    // bind events

    $(window).resize(deferredResizeProgramBlocks);

    $('#btn-start').click(function() {
        doStart();
        return false;
    });

    $('#btn-edit').click(function() {
        leaveQuickMode();
        doEdit();
        return false;
    });

    $('#btn-step').click(function() {
        leaveQuickMode();
        doStep();
        return false;
    });

    $('#btn-unmark').click(function() {
        leaveQuickMode();
        doUnmark();
        return false;
    });

    $('#btn-quick').click(function() {
        doQuick();
        return false;
    });

    $('#btn-totu4').click(function() {
        doToTU4();
        return false;
    });

    (function() {
    var mods = {
            ctrl: false
        },
        keys = {
            ctrl: function(k) { return k == 17; },
            enter: function(k) { return k == 13 || k == 10; },
            space: function(k) { return k == 32; },
            escape: function(k) { return k == 27; }
        };

    $(document).keydown(function(ev) {
        if(keys.ctrl(ev.keyCode)) {
            mods.ctrl = true;
        }
    }).keyup(function(ev) {
        if(keys.ctrl(ev.keyCode)) {
            mods.ctrl = false;
        }
    }).keypress(function(ev) {
        var key = ev.which || ev.keyCode || ev.charCode;
        if(curUIMode == UIModes.edit) {
            if(mods.ctrl && keys.enter(key)) { // ctrl+enter
                setTimeout(doStart, 0);
                return false;
            }
        } else if(curUIMode == UIModes.run) {
            if(keys.enter(key)) { // ctrl+enter, enter
                setTimeout(function() {
                    if(tmTimer) {
                        leaveQuickMode();
                    } else if(tmRun.isRunning()) {
                        doQuick();
                    } else {
                        doEdit();
                        setTimeout(function() {
                            cInputTape.focus();
                        }, 10);
                        /* sometimes we get cInputProgram focused, so
                        deffer this 10ms */
                    }
                }, 0);
                return false;
            } else if(keys.space(key)) { // space
                setTimeout(function() {
                    leaveQuickMode();
                    doStep();
                }, 0);
                return false;
            } else if(keys.escape(key)) { // escape
                setTimeout(function() {
                    if(tmTimer) {
                        leaveQuickMode();
                    } else {
                        doEdit();
                        setTimeout(function() {
                            cInputTape.focus();
                        }, 10);
                        /* sometimes we get cInputProgram focused, so
                        deffer this 10ms */
                    }
                }, 0);
                return false;
            }
        } else if(curUIMode == UIModes.error) {
            if(keys.enter(key) || keys.escape(key)) {
                setTimeout(function() {
                    doEdit();
                    setTimeout(function() {
                        cInputProgram.focus();
                    }, 10);
                    /* sometimes we get cInputProgram focused, so
                    deffer this 10ms */
                }, 0);
                return false;
            }
        }
    });

    cInputTape.keypress(function(ev) {
        var key = ev.which || ev.keyCode || ev.charCode;
        if(keys.enter(key)) {
            doStart();
            cDisplayProgram.focus();
            return false;
        }
    });

    cInputProgram.keypress(function(ev) {
        var key = ev.which || ev.keyCode || ev.charCode;
        if(mods.ctrl && keys.enter(key)) {
            doStart();
            cDisplayProgram.focus();
            return false;
        }
    });

    })();

    cDisplayProgram.click(function() {
        leaveQuickMode();
        doEdit();
        return false;
    });

    cDisplayTape.click(function() {
        leaveQuickMode();
        doEdit();
        return false;
    });

    cInputTape.click(function() {
        if(curUIMode != UIModes.edit) {
            doEdit();
        }
        return false;
    });

    // enter the edit mode
    setUIMode(UIModes.edit);
});

})();
