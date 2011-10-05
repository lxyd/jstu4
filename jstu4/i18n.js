// loading locales as files failed because of chromium's policy :(
var i18n = {};

/**
 * Each template is evaluated against an object containing the following fields:
 * - version - application version
 * - lang  - current language
 *
 * And a command context (could be undefined):
 * - src - command source code
 * - q - current state
 * - a - current symbol on tape
 * - v - command or symbol to write
 * - w - new state
 *
 * Parse errors are also provided with:
 * - text - data that caused the error
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
	t.ui['#btn-edit'] = 'Edit';
	t.ui['#btn-edit@title'] = 'Return to the "edit" mode';
    t.ui['#btn-totu4'] = 'To TU4';
    t.ui['#btn-totu4@title'] = 'Convert to TU4 format';
    t.ui['#btn-unmark'] = 'Unmark';
    t.ui['#btn-unmark@title'] = 'Unmark visited commands';

	t.templates['title'] = 'Turing machine emulator, v{{version}}';

	t.templates['error/parseError'] = 'Couldn\'t parse {{text}} ...';
	t.templates['error/ambiguosTransition'] = 'Ambiguos transition for state "{{q}}" and symbol "{{a}}"';
	t.templates['error/targetStateDoesNotExist'] = 'Target state "{{w}}" does not exist';
	t.templates['error/initialStateDoesNotExist'] = 'Initial state "{{q}}" does not exist';
	t.templates['error/headIsOutOfTape'] = 'Head is out of tape';
	t.templates['error/noSuchTransition'] = 'Transition is undefined for state "{{q}}" and symbol "{{a}}"';

	t.templates['info/finished'] = 'The machine has successfully finished it\'s work';

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
	t.ui['#btn-edit'] = 'Править';
	t.ui['#btn-edit@title'] = 'Вернуться в режим редактирования программы';
    t.ui['#btn-totu4'] = 'В формат TU4';
    t.ui['#btn-totu4@title'] = 'Преобразовать программу в формат TU4';
    t.ui['#btn-unmark'] = 'Сбросить метки';
    t.ui['#btn-unmark@title'] = 'Сбросить метки с использованных команд';

	t.templates['title'] = 'Эмулятор машины Тьюринга в четвёрках, v{{version}}';

	t.templates['error/parseError'] = 'Ошибка разбора: {{text}} ...';
	t.templates['error/ambiguosTransition'] = 'Неоднозначный переход для состояния "{{q}}" и символа "{{a}}"';
	t.templates['error/targetStateDoesNotExist'] = 'Целевое состояние "{{w}}" не существует';
	t.templates['error/initialStateDoesNotExist'] = 'Начальное состояние "{{q}}" не существует';
	t.templates['error/headIsOutOfTape'] = 'Выход за границу ленты';
	t.templates['error/noSuchTransition'] = 'Не определён переход для состояния "{{q}}" и символа "{{a}}"';

	t.templates['info/finished'] = 'Машина успешно завершила работу';

	return t;
})();

