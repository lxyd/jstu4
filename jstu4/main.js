(function() {

/** Shortcut to the templating engine */
var T = $.HotMilk;

/** Construct a model for the template engine */
var constructTemplateModel = function(values) {
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

var locale = $.loadLocale($.getRequestParameter('lang'),
                          { 'baseName': 'locale.', 'fallbackLang': 'en' });

for(var k in locale) {
    T.$addTemplate(k, locale[k]);
}

$(function() {
    // draw localized texts
    var m = constructTemplateModel();
    document.title = T.text.title(m);
    
    $('.edit.tape').placeholder(T.text.tape(m), 'placeholder-active');
    $('.edit.program').placeholder(T.text.program(m), 'placeholder-active');
    $('.edit.program').autoSizeTextarea(5);
});

})();
