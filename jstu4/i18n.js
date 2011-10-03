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
	var t = { lang: 'en' };

	t['text/title'] = 'Turing machine emulator, v{{version}}';
	t['text/program'] = 'Program';
	t['text/tape'] = 'Tape';

	t['button/help'] = 'Help';
	t['button/start'] = 'Start';
	t['button/step'] = 'Step';
	t['button/quick'] = 'Quick';
	t['button/finish'] = 'Finish';

	t['error/parseError'] = 'Couldn\'t parse {{text}} ...';
	t['error/ambiguosTransition'] = 'Ambiguos transition for state "{{q}}" and symbol "{{a}}"';
	t['error/targetStateDoesNotExist'] = 'Target state "{{w}}" does not exist';
	t['error/initialStateDoesNotExist'] = 'Initial state "{{q}}" does not exist';
	t['error/headIsOutOfTape'] = 'Head is out of tape';
    //t['error/stateNotExist'] = 'State "{{q}}" does not exist';
	t['error/noSuchTransition'] = 'Transition is undefined for state "{{q}}" and symbol "{{a}}"';

	t['info/finished'] = 'The machine has successfully finished it\'s work';

	return t;
})();

i18n['ru'] = (function() {
	var t = { lang: 'ru' };

	t['text/title'] = 'Эмулятор машины Тьюринга в четвёрках, v{{version}}';
	t['text/program'] = 'Программа';
	t['text/tape'] = 'Лента';

	t['button/help'] = 'Справка';
	t['button/start'] = 'Запуск';
	t['button/step'] = 'Шаг';
	t['button/quick'] = 'Быстро';
	t['button/finish'] = 'Закончить';

	t['error/parseError'] = 'Ошибка разбора: {{text}} ...';
	t['error/ambiguosTransition'] = 'Неоднозначный переход для состояния "{{q}}" и символа "{{a}}"';
	t['error/targetStateDoesNotExist'] = 'Целевое состояние "{{w}}" не существует';
	t['error/initialStateDoesNotExist'] = 'Начальное состояние "{{q}}" не существует';
	t['error/headIsOutOfTape'] = 'Выход за границу ленты';
	//t['error/stateNotExist'] = 'Состояние "{{q}}" не существует';
	t['error/noSuchTransition'] = 'Не определён переход для состояния "{{q}}" и символа "{{a}}"';

	t['info/finished'] = 'Машина успешно завершила работу';

	return t;
})();

// TODO: add another locales here
