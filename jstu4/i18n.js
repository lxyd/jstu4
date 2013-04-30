// loading locales as files failed because of chromium's policy :(
var i18n = {};

/**
 * Each template is evaluated against an object containing the following fields:
 * - version - application version
 * - lang  - current language
 *
 * And a message-specific context (could be undefined)
 */

i18n['en'] = (function() {
    var t = { lang: 'en', texts: {}, templates: {}, ui: {} };

    t.texts['program'] = 'Program';
    t.texts['tape'] = 'Tape';

    t.ui['#btn-help'] = '?';
    t.ui['#btn-help@title'] = 'Help';
    t.ui['#btn-start'] = 'Start';
    t.ui['#btn-start@title'] = 'Begin program execution';
    t.ui['#btn-step'] = 'Step';
    t.ui['#btn-step@title'] = 'Perform the next step';
    t.ui['#btn-quick'] = 'Quick';
    t.ui['#btn-quick@title'] = 'Enter quick execution mode';
    t.ui['#btn-edit'] = 'Back to edit';
    t.ui['#btn-edit@title'] = 'Return to the "edit" mode';
    t.ui['#btn-totu4'] = 'To TU4';
    t.ui['#btn-totu4@title'] = 'Convert to TU4 format';
    t.ui['#btn-unmark'] = 'Unmark';
    t.ui['#btn-unmark@title'] = 'Unmark visited commands';

    t.templates['title'] = 'Turing machine emulator, v{{version}}';

    t.templates['error/parseError'] = 'Couldn\'t parse "{{text}}"';
    t.templates['error/programIsEmpty'] = 'Program is empty';
    t.templates['error/ambiguosCommand'] = 'Ambiguos transition for state "{{cmd.q}}" and symbol "{{cmd.a}}"';
    t.templates['error/targetStateDoesNotExist'] = 'Target state "{{cmd.w}}" does not exist';
    t.templates['error/initialStateDoesNotExist'] = 'Initial state "{{q}}" does not exist';
    t.templates['error/headIsOutOfTape'] = 'Head is out of tape';
    t.templates['error/noSuchCommand'] = 'Transition is undefined for state "{{q}}" and symbol "{{a}}"';

    t.templates['info/finished'] = 'The machine has successfully finished it\'s work';

    t.templates['warning/notNormal_SrcAltered'] = 'WARN: Source data not retained';
    t.templates['warning/notNormal_Misposition'] = 'WARN: Head should be positioned immediately after the result';

    t.templates['stats'] = 'Code size: <b>{{commandsCount}}</b> transitions. Message length: <b>{{initialDataLength}}</b>. Cells used: <b>{{maxDataLength}}</b>. Actions performed: <b>{{operationsCount}}</b>';

    return t;
})();

i18n['ru'] = (function() {
    var t = { lang: 'ru', texts: {}, templates: {}, ui: {}  };

    t.texts['program'] = 'Программа';
    t.texts['tape'] = 'Лента';

    t.ui['#btn-help'] = '?';
    t.ui['#btn-help@title'] = 'Справка';
    t.ui['#btn-start'] = 'Старт';
    t.ui['#btn-start@title'] = 'Запустить программу на выполнение';
    t.ui['#btn-step'] = 'Шаг';
    t.ui['#btn-step@title'] = 'Выполнить слещующий шаг программы';
    t.ui['#btn-quick'] = 'Быстро';
    t.ui['#btn-quick@title'] = 'Перейти в режим быстрого выполнения';
    t.ui['#btn-edit'] = 'Вернуться к правке';
    t.ui['#btn-edit@title'] = 'Вернуться в режим редактирования программы';
    t.ui['#btn-totu4'] = 'В формат TU4';
    t.ui['#btn-totu4@title'] = 'Преобразовать программу в формат TU4';
    t.ui['#btn-unmark'] = 'Сбросить метки';
    t.ui['#btn-unmark@title'] = 'Сбросить метки с использованных команд';

    t.templates['title'] = 'Эмулятор машины Тьюринга в четвёрках, v{{version}}';

    t.templates['error/parseError'] = 'Ошибка разбора текста "{{text}}"';
    t.templates['error/programIsEmpty'] = 'Программа пуста';
    t.templates['error/ambiguosCommand'] = 'Неоднозначный переход для состояния "{{cmd.q}}" и знака "{{cmd.a}}"';
    t.templates['error/targetStateDoesNotExist'] = 'Целевое состояние "{{cmd.w}}" не существует';
    t.templates['error/initialStateDoesNotExist'] = 'Начальное состояние "{{q}}" не существует';
    t.templates['error/headIsOutOfTape'] = 'Выход за границу ленты';
    t.templates['error/noSuchCommand'] = 'Не определён переход для состояния "{{q}}" и знака "{{a}}"';

    t.templates['info/finished'] = 'Машина успешно завершила работу';

    t.templates['warning/notNormal_SrcAltered'] = '!!! Затёрты/изменены исходные данные';
    t.templates['warning/notNormal_Misposition'] = '!!! Головка должна останавливаться после результата';

    t.templates['stats'] = 'Команд в программе <b>{{commandsCount}}</b>. Длина исходного сообщения: <b>{{initialDataLength}}</b>. Использовано ячеек: <b>{{maxDataLength}}</b>. Выполнено операций: <b>{{operationsCount}}</b>';

    return t;
})();
