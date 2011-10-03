/*
 * Условия лицензионного соглашения см. в файле jstu4.license
 */
//
// Немного допиливаем ядро яваскрипта и RightJS
//
RightJS.Element.include({
    text: function(content) {
        if(Browser.IE) {
            return (typeof(content) === 'undefined') ? this._.innerText : (this._.innerText = content);
        } else {
            return (typeof(content) === 'undefined') ? this._.textContent : (this._.textContent = content);
        }
    }
});
String.include({
    escapeHTML: function() {
        return this.replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    unescapeHTML: function() {
        return this.replace(/\&lt\;/g, '<').replace(/\&gt\;/g, '>').replace(/\&amp\;/g, '&');
    },

    toHTML: function() {
        return this.escapeHTML().replace(/\ /g, '&nbsp;').replace(/\r\n|\n|\r/g, '<br/>');
    },

    multiply: function(n) {
        var res = "";
        for(var i = 0; i<n; i++) {
            res += this;
        }
        return res;
    },

    adjustLeft: function(len, chr) { // т.е. expandToRight()
        chr = isString(chr) ? chr.charAt(0) : ' ';
        return this + chr.multiply(len - this.length);
    }
});

//
// Непосредственно начинаем реализацию машины Тьюринга
//

// Команда машины Тьюринга
var TMCommand = new Class(Object, {
    initialize: function(q,a,v,w) {
        this.q = TMCommand.parseState(q); // q  - текущее состояние
        this.a = a;                       // a  - читаемый символ
        this.v = v;                       // v  - команда или записываемый символ
        this.w = TMCommand.parseState(w); // q' - состояние, в которое переходим
    },
    // является ли команда - командой остановки машины
    isStop: function() {
        return (this.v === '#' || (this.q === this.w && this.a === this.v));
    },
    // является ли команда командой записи символа на ленту
    isWrite: function() {
        return (this.v !== '<' && this.v !== '>' && this.v !== '=' && this.v !== '#');
    },
    isLeft: function() {
        return this.v === '<';
    },
    isRight: function() {
        return this.v === '>';
    },
    elementId: function() {
        return escape('cmd_' + this.q + '_' + this.a);
    }
});
// проверяем, передали ли нам число, и если да - делаем состояние целочисленным
TMCommand.parseState = function(state) {
    if(/^\d*$/.test(state)) {
        return state.toInt(10);
    } else {
        return state.trim();
    }
};

// Лента машины Тьюринга (создаём класс для неё, хотя в любой момент времени будет лишь один его экземпляр)
var TMTape = new Class(Object, {
    initialize: function(str) {
        // обрезаем правые пробелы
        this.data = str.replace(/\s*$/, '');
        // ставим головку машины после данных
        this.pos = this.data.length;
    },
    left: function() {
        if(this.pos === 0) {
            throw new Error('Выход за границу ленты');
        }
        this.pos -= 1;
    },
    right: function() {
        this.pos += 1;
    },
    read: function() {
        return (this.pos >= this.data.length) ? " " : this.data.charAt(this.pos);
    },
    write: function(chr) {
        if(!isString(chr) || chr.length != 1) {
            throw new Error('Невозможно записать на ленту "' + chr + '"');
        }
        if(this.pos >= this.data.length) {
            this.data = this.data.adjustLeft(this.pos) + chr;
        } else {
            this.data = this.data.substring(0, this.pos) + chr + this.data.substring(this.pos + 1);
        }
    },
    toHTML: function() {
        if(this.pos >= this.data.length) {
            return this.data.adjustLeft(this.pos).toHTML() + "<span class='active'>&nbsp;</span>";
        } else {
            return this.data.substring(0, this.pos).toHTML() + "<span class='active'>" + this.data.charAt(this.pos).toHTML() + "</span>" + this.data.substring(this.pos + 1).toHTML();
        }
    }
});
var tmState = 0;
var tmTape = new TMTape("");
var tmProgram = {};
var tmRawProgram = [];
var tmTimer = null;
var tmRunning = false;
var toTU4 = function() {
    try {
        parseTM();
        
        var states = {}, i = 1;
        states[0] = 0; // нулевое состояние всегда нулевое
        tmRawProgram.each(function(cmd) {
            if(typeof(states[cmd.q]) === 'undefined' || states[cmd.q] === null) {
                states[cmd.q] = i;
                i++;
            }
        });
        
        tmRawProgram.each(function(cmd) {
            cmd.q = states[cmd.q];
            cmd.w = states[cmd.w];
        });
        
        if (i >= 100) { // слишком много состояний было (максимальный номер больше 99)
            tmRawProgram.each(function(cmd) {
                cmd.q = cmd.q.toString(16);
                cmd.w = cmd.w.toString(16);
            });
        } else {
            tmRawProgram.each(function(cmd) {
                cmd.q = cmd.q.toString(10);
                cmd.w = cmd.w.toString(10);
            });
        }
        tmRawProgram.each(function(cmd) {
            if (cmd.q.length === 1) cmd.q = "0" + cmd.q;
            if (cmd.w.length === 1) cmd.w = "0" + cmd.w;
        });

        var res = "";
        tmRawProgram.each(function(cmd) {
            res += cmd.q + "," + cmd.a + "," + cmd.v + "," + cmd.w + "\n";
        });
        $('txt-program').value(res);
    } catch(error) {
        setError(error.message);
    }
};
var parseTM = function() {
    // обнуляем программу
    tmProgram = {};
    tmRawProgram = [];

    // читаем её по одной команде из поля ввода
    var prg = $('txt-program').value(), prg_html = '';
    // разбираем программу регулярным выражением
    // при разборе получим массив:
    // ['выражение целиком, нам оно не интересно', 'пробелы/переносы строк ДО команды', 'команда целиком'
    //  'начальное состояние', 'читаемый символ', 'записываемый символ/команда', 'новое состояние']
    var re = /^(\s*)(([^\s]+),(.),(.),([^\s]+))/;

    var cmd, arr;
    while(prg.trim() != "") { // пока не выцарапали все команды из текста программы
        arr = re.exec(prg);
        // если текст не пуст, а при разборе не выдано ничего, то это где-то ошибка
        // выводим первые 20 символов, чтобы пользователь мог понять, где что-то не так
        if(arr == null) {
           throw new Error('Ошибка разбора: "' + prg.substring(0, 20).trim() + ' ..."'); 
        }
        // создаём команду машины из элементов результата
        cmd = new TMCommand(arr[3], arr[4], arr[5], arr[6]);
        // если команда для такой ситуации уже есть - ошибка
        if(defined(tmProgram[cmd.q]) && defined(tmProgram[cmd.q][cmd.a])) {
            throw new Error('Неоднозначная команда: состояние "' + cmd.q + '", символ "' + cmd.a + '"');
        }
        // сохраняем команду в программу
        tmRawProgram.push(cmd);
        if(!defined(tmProgram[cmd.q])) {
            tmProgram[cmd.q] = {};
        }
        tmProgram[cmd.q][cmd.a] = cmd;
        // обрезаем от программы текущую команду, чтобы перейти к разбору следующей
        prg = prg.replace(re, '');
        // к html-версии программы дописываем пробелы и переносы строк, преобразованные к html-виду
        // это нужно, чтобы программа в html-виде выглядела также как и в тексте
        prg_html += arr[1].toHTML();
        // также дописываем обёрнутую в span команду в её исходном виде (т.е. не заменяем циферные состояния на числа)
        prg_html += '<span id="' + cmd.elementId() + '">' + arr[2].toHTML() + '</span>';
    }
    
    return prg_html;
};
var runTM = function() {
    // сначала закончить, потом снова запускать
    if(tmRunning)
        return;

    setError('');
    setInfo('');
    try {
        // начальное состояние - 0
        tmState = 0;
        // заполняем данные ленты
        tmTape = new TMTape($('txt-tape').value());

        var prg_html = parseTM();
        
        $('div-program').html(prg_html);

        tmMode('run');
        
        stepTM(); // первый шаг делаем автоматически
    } catch(error) {
        setError(error.message);
    }
};
var doStepTM = function() {
    try {
        // отрисовываем текущее положение на ленте
        // это надо сделать до шага, чтобы выделенная команда соответствовала ситуации
        $('div-tape').html(tmTape.toHTML());

        var a = tmTape.read();
        if(!defined(tmProgram[tmState])) {
            throw new Error('Несуществующее состояние "' + tmState + '"');
        }
        if(!defined(tmProgram[tmState][a])) {
            throw new Error('Нет команды, соответствующей состоянию "' + tmState + '" и символу "' + a + '"');
        }
        var cmd = tmProgram[tmState][a];
        // подсвечиваем текущую команду
        $(cmd.elementId()).radioClass('active');
        // и обозначаем как посещённую
        $(cmd.elementId()).addClass('visited');
        // выполняем команду
        if(cmd.isStop()) {
            setInfo('Машина завершила своё выполнение');
            endFastTM();
            // оставляем tmRunning как было, т.к. оно нужно для различения режимов (edit/run)
            // тут же мы остаёмся в run
        } else if(cmd.isLeft()) {
            tmTape.left();
        } else if(cmd.isRight()) {
            tmTape.right();
        } else if(cmd.isWrite()) {
            tmTape.write(cmd.v);
        }
        // переходим в новое состояние
        tmState = cmd.w;
    } catch(error) {
        setError(error.message);
        endFastTM();
    }
};
var endFastTM = function() {
    if(tmTimer !== null) {
        tmTimer.stop();
        tmTimer = null;
    }
}
var stepTM = function() {
    // необходимо прервать быстрое выполнение машины
    endFastTM();
    doStepTM();
};
var fastTM = function() {
    // запускаем быстрое выполнение только если оно пока не идёт
    if(tmTimer === null) {
        tmTimer = function() { doStepTM(); }.periodical(100);
    }
};
var stopTM = function() {
    endFastTM();
    setError('');
    setInfo('');
    tmMode('edit');
};
var setError = function(err) {
    $('error').text(err);
};
var setInfo = function(info) {
    $('info').html(info);
};
var tmMode = function(mode) {
    if(mode === 'edit') {
        $$('.run').each('hide');
        $$('.edit').each('show');
        tmRunning = false;
    } else {
        $$('.run').each('show');
        $$('.edit').each('hide');
        tmRunning = true;
    }
};

var isCtrlPressed = false;

// подготовка элементов управления при окончании загрузки html.
$(window).onReady(function() {
    tmMode('edit');

    // под IE какие-то проблемы с кнопками - ну и перебьёмся :)
    if(!Browser.IE) {
        $('txt-tape').on({
            keypress: function(e) {
                if(e.which === 13 && !isCtrlPressed) {
                    runTM();
                    e.stop();
                }
            },
            focus: function() { if(!Browser.IE) {this.select();} }
        });
        $(document).on({
            keyup: function(e) {
                if(e.which === 17) { // Ctrl
                    isCtrlPressed = false;
                    e.stop();
                }
            },
            keydown: function(e) {
                if(e.which === 17) { // Ctrl
                    isCtrlPressed = true;
                    e.stop();
                } else if(e.which === 13 && isCtrlPressed) { // Ctrl+Enter
                    if(!tmRunning) {
                        runTM();
                    }
                    e.stop();
                } else if(e.which === 13 && !isCtrlPressed) { // Enter
                    if(tmRunning){
                        fastTM();
                        e.stop();
                    }
                } else if(e.which === 32 && !isCtrlPressed) { // Space
                    if(tmRunning){
                        stepTM();
                        e.stop();
                    }
                } else if(e.which === 67 && isCtrlPressed) {  // Ctrl+C
                    if(tmRunning) {
                        stopTM();
                        $('txt-tape').focus();
                        e.stop();
                    }
                }
            }
        });
    }

    $('div-tape').on({
        click: stopTM
    });
    $('div-program').on({
        click: stopTM
    });

    $('btn-run').on({
        click: runTM
    });
    $('btn-stop').on({
        click: stopTM
    });
    $('btn-fast').on({
        click: fastTM
    });
    $('btn-step').on({
        click: stepTM
    });
    $('btn-uncheck').on({
        click: function() {
            $$('#div-program span').each('removeClass', 'visited');
        }
    });
    $('btn-totu4').on({
        click: toTU4
    });


    var toggleHelp = function() {
        $('container').toggle();
        $('div-help').toggle();
    }
    $('btn-help').on({
        click: toggleHelp
    });
    $('div-help').on({
        dblclick: toggleHelp
    });

    $('txt-program').select();
});
