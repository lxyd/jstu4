$(function() {

// prepare locale and templates

var getRequestParameter = function(name) {
	var re = new RegExp("(?:[?&]|^)" + encodeURIComponent(name) + "=([^?&]*)(?:[?&]|$)"),
		r = re.exec(window.location.search);
	if(r === null) return null;
	else return r[1];
};

var locale = i18n[getRequestParameter('lang') || 'en'] || i18n['en'];

for(var p in locale) {
	if(locale.hasOwnProperty(p) && p.indexOf('/') != -1) {
		$.HotMilk.$addTemplate(p, locale[p]);
	}
}

var constructTemplateContext = function(values) {
	var res = {
		'version': TM.version,
		'lang': locale.lang
	};
	
	if(values) {
		for(var k in values) {
			res[k] = values[k];
		}
	}
	
	return res;
};

document.title = $.HotMilk.text.title(constructTemplateContext());



});
