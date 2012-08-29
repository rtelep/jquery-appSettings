/*
 *  jQuery appSettings
 *
 *  Copyright (c) 2012 Knotbird
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a
 *  copy of this software and associated documentation files (the "Software"),
 *  to deal in the Software without restriction, including without limitation
 *  the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *  and/or sell copies of the Software, and to permit persons to whom the
 *  Software is furnished to do so, subject to the following conditions:
 *  The above copyright notice and this permission notice shall be included
 *  in all copies or substantial portions of the Software.
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 *  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 *  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 *  USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 *  <pre>
 *  // Configure
 *  // ---------
 *  var d = {
 *          // On/Off Toggle, show with an on/off slider
 *          toggle_me:      {
 *                  type:   'toggle'
 *              ,   selected: true
 *          }
 *  
 *          // Choose One, show with Radio Buttons
 *      ,   choose_one:     {
 *                  type: 'choose_one'
 *              ,   selections: ['option_a', 'option_b', 'option_c']
 *              ,   selected: 'option_b'
 *          }
 *
 *          // Choose One, show with Select Element
 *      ,   choose_one_using_select:     {
 *                  type: 'choose_one'
 *              ,   selections: ['option_a', 'option_b', 'option_c']
 *              ,   selected: 'option_b'
 *              ,   form_element: 'select' // default is 'radio'
 *          }
 *          
 *          // Choose Many, show with Checkbox
 *      ,   choose_many:    {
 *                  type:   'choose_many'
 *              ,   selections: ['option_d', 'option_e', 'option_f']
 *              ,   selected: ['option_d', 'option_f']
 *          } 
 *  
 *  };
 *  
 *  $.appSettings.initialize({
 *          _id:    'EXAMPLE_APP_SETTINGS'
 *      ,   config: config
 *      ,   options:    {
 *                  mobile: true
 *              ,   mini: true
 *              ,   onReady: function(){}
 *          }
 *  });
 *
 *  // Use the settings
 *  // ----------------
 *  $.appSettings.get('toggle_me')      // true
 *  $.appSettings.get('choose_one'))    // 'option_b'
 *  $.appSettings.get('choose_many')    // ['option_d', 'option_f']
 *
 *  // Reset the settings
 *  // ------------------
 *  $.appSettings.reset();
 *  
 *  // Make changes to settings, which persist across page loads.
 *  // ----------------------------------------------------------
 *
 *  // Toggle and Choose One types:
 *  $.appSettings.set('toggle_me', false);
 *  $.appSettings.set('choose_one', 'option_c')
 *
 *  // Add/Remove choices for Choose Many type
 *  $.appSettings.add('choose_many', 'option_e')
 *  $.appSettings.remove('choose_many', 'option_e')
 *
 *  // HTML Form, which will control the settings object.
 *  // --------------------------------------------------
 *  $.appSettings.getForm().appendTo('BODY');
 *  
 *  </pre>
 */

var _app_Settings = function(_options){
    
    var App = this;
    if (! $.jStorage) throw('appSettings requires jStorage');
    if (! _options) throw('Supply an options hash');
    if (! _options._id) throw('Supply an _id key in options');
    
    App.user_config = {
            config:     {}
        ,   options:    {}
    };

    $.extend(App.user_config, _options);    

    App._id = App.user_config._id;

    App._init = function(){
        // Try to look up persistent object
        App.d = $.jStorage.get(App._id);
        if (! App.d){
            // Doesn't exists, reset to a copy of default object
            App.d = $.extend({}, App.user_config.config);
            // Save it.
            $.jStorage.set(App._id, App.d);
        };
        
    }

    App.get = function(key){
        var item = App.d[key];
        if (! item){
            throw('Cannot get selected value for '+key);
        }
        return item.selected;
    };
    
    App.set = function(key, value){
        if (App.d[key] == undefined) throw(key + ' is not a key in settings for this application.')
        if (App.d[key].type == 'choose_many') throw('Use add(), and remove() for Choose Many types');
        App.d[key].selected = value;
        $.jStorage.set(App._id, App.d);
    };

    App.add = function(key, value){
        if (App.d[key].type != 'choose_many') throw('Use set() for Toggle and Choose One');
        if ($.inArray(value, App.d[key].selections) == -1) throw(value + ' is not among selections for this Choose Many');
        if ($.inArray(value, App.d[key].selected) != -1) throw(value + ' is already selected for this Choose Many');
        App.d[key].selected.push(value);
        $.jStorage.set(App._id, App.d);
    };

    App.remove = function(key, value){
        if (App.d[key].type != 'choose_many') throw('Use set() for Toggle and Choose One');
        if ($.inArray(value, App.d[key].selections) == -1) throw(value + ' is not among selections for this Choose Many');
        if ($.inArray(value, App.d[key].selected) == -1) throw(value + ' not currently selected for this Choose Many');
        App.d[key].selected.remove(App.d[key].selected.indexOf(value));
        $.jStorage.set(App._id, App.d);
    };

    App.reset = function(){
        $.jStorage.deleteKey(App._id);
        App._init();
    };
    
    App.getForm = function(){
        /**
         *  Form Level
         *  ----------
         *  form                <- The form element
         *  selector_prefix     <- big long prefix for ids and classes
         *  input_class         <- class of INPUT elements class
         *  wrapper_class       <- class of DIV to wrap groups of inputs
         *  input_wrapper_class <- class of DIV to wrap
         *
         *  Selections Group Level
         *  ----------------------
         *  item        <- The boolean, or array
         *  type        <- 'toggle', 'choose_one', 'choose_many'
         *  key         <- underscore-separated name of this item
         *  group_name  <- space-separated name of this item 
         *  wrapper     <- DIV wrapper for this group
         *
         *  Selection Items Level
         *  ---------------------
         *  this_key        <- underscore-sep. name of this selection during iteration over item.selections
         *  id              <- id of INPUT for this selection
         *  input_wrapper   <- DIV wrapper for this selection's INPUT and LABEL
         */

        var form = $('<form action="#" method="post"></form>');
        var selector_prefix = 'APP_SETTINGS_FORM_';
        var input_class = selector_prefix + '__INPUT__';
        var wrapper_class = selector_prefix + '__WRAPPER__';
        var input_wrapper_class = selector_prefix + '__INPUT__WRAPPER__';

        for (var key in App.d){

            var item = App.d[key];
            type = item.type;
            var group_name = key.split('_').join(' ').capitalize();

            var wrapper = $('<div></div>')
                .attr('class', wrapper_class)
                .append('<h1>'+group_name+'</h1>');


            // Toggle
            // ------
            if (type=='toggle'){
                
                // For Mobile, we use SELECT for a flip switch to toggle
                // http://jquerymobile.com/test/docs/forms/switch/index.html
                
                if (App.user_config.options.mobile){
                    var input_wrapper = $('<div />')
                        .addClass(input_wrapper_class);
                    
                    var label = $('<label />')
                        .attr('for', selector_prefix + key)
                        .appendTo(input_wrapper);
                        
                    var select = $('<select />')
                        .addClass(input_class)
                        .attr('name', key)
                        .attr('selection_type', 'toggle')
                        .attr('data-role', 'slider')
                        .attr('id', selector_prefix + key)
                        .appendTo(input_wrapper);
                    
                    var option_off = $('<option />')
                        .attr('name', key)
                        .attr('value', 'off')
                        .html('off')
                        .appendTo(select);
                        
                    var option_on = $('<option />')
                        .attr('name', key)
                        .attr('value', 'on')
                        .html('on')
                        .appendTo(select);

                    if (App.get(key)){
                        select.val('on');
                    } else {
                        select.val('off');
                    }
                        
                    input_wrapper.appendTo(wrapper);                

                // If not Mobile, we use a checkbox to toggle.
                } else {
                    var input_wrapper = $('<div />')
                        .addClass(input_wrapper_class);
                        
                    var input = $('<input />')
                        .attr('type', 'checkbox')
                        .attr('selection_type', 'toggle')
                        .attr('class', input_class)
                        .attr('id', selector_prefix + key)
                        .attr('name', key)
                        .attr('value', key)
                        .prop('checked', App.get(key))
                        .appendTo(input_wrapper);
    
                    var label = $('<label />')
                        .attr('for', selector_prefix + key)
                        .html(group_name)
                        .appendTo(input_wrapper);
                
                    input_wrapper.appendTo(wrapper);
                                
                }
                
            // Choose One
            // ----------
            } else if (type=='choose_one'){

                // Use a Select element?
                if (item.form_element === 'select'){

                    var input_wrapper = $('<div />')
                        .addClass(input_wrapper_class);

                    var label = $('<label />')
                        .attr('for', selector_prefix + key)
                        .appendTo(input_wrapper);

                    var select = $('<select />')
                        .attr('class', input_class)
                        .attr('selection_type', 'choose_one')
                        .attr('name', key)
                        .attr('id', key)
                        .appendTo(input_wrapper);
                    
                    $.each(item.selections, function(n, this_key){
                        $('<option>')
                            .attr('value', this_key)
                            .html(this_key)
                            .attr('selected', App.get(key)==this_key)
                            .appendTo(select);
                    });
                
                    input_wrapper.appendTo(wrapper);

                }                


                // Default to Radio Buttons for Choose One
                else {
                    $.each(item.selections, function(n, this_key){
                        var input_wrapper = $('<div />')
                            .addClass(input_wrapper_class);
                        
                        var input = $('<input />')
                            .attr('type', 'radio')
                            .attr('selection_type', 'choose_one')
                            .attr('class', input_class)
                            .attr('id', selector_prefix + this_key)
                            .attr('name', key)
                            .attr('value', this_key)
                            .prop('checked', App.get(key)==this_key)
                            .appendTo(input_wrapper);
        
                        var label = $('<label />')
                            .attr('for', selector_prefix + this_key)
                            .html(this_key.split('_').join(' ').capitalize())
                            .appendTo(input_wrapper);
                    
                        input_wrapper.appendTo(wrapper);
        
                    });
                }
                
            }

            // Checkbox
            // --------
            else if (type=='choose_many'){
                $.each(item.selections, function(n, this_key){
                    var input_wrapper = $('<div />')
                        .addClass(input_wrapper_class);
                        
                    var input = $('<input />')
                        .attr('type', 'checkbox')
                        .attr('selection_type', 'choose_many')
                        .attr('class', input_class)
                        .attr('id', selector_prefix + this_key)
                        .attr('name', key)
                        .attr('value', this_key)
                        .prop('checked', ($.inArray(this_key, App.get(key)) != -1))
                        .appendTo(input_wrapper);
                    
                    var label = $('<label />')
                        .attr('for', selector_prefix + this_key)
                        .html(this_key.split('_').join(' ').capitalize())
                        .appendTo(input_wrapper);
                
                    input_wrapper.appendTo(wrapper);

                });
            }
            
            
            form.append(wrapper);
        
        };

        form.find('.'+input_class).change(function(e){
            
            var input = $(this);
            var selection_type = input.attr('selection_type');
            var name = input.attr('name');
            var value = input.attr('value');

            // toggle            
            if (selection_type == 'toggle') {
                // the toggle is a checkbox
                var checked = input.prop('checked');
                if (checked == undefined){
                    // the toggle is a flip switch, for mobile
                    checked = (value=='on');
                }
                App.set(name, checked);

            // choose one
            } else if (selection_type == 'choose_one'){
                App.set(name, value);

            // choose many                
            } else if (selection_type == 'choose_many'){
                if (input.prop('checked')) {
                    App.add(name, value);
                } else {
                    App.remove(name, value);
                }
            }
        });
        

        if (App.user_config.options.mobile){
            
            // http://jquerymobile.com/test/docs/forms/docs-forms.html
            form.find('.'+input_wrapper_class).attr('data-role', 'fieldcontain');
        
            // http://jquerymobile.com/test/docs/forms/forms-all-mini.html
            if (App.user_config.options.mini){    
                form.find('INPUT').attr('data-mini', 'true');
                form.find('SELECT').attr('data-mini', 'true');
            }
        }
                    
        return form;
        
    };

    App._init();

    return true;
    
};





// jQuery-ish API
// --------------
$.appSettings = {};
$.appSettings.initialize = function(options){
    $.appSettings._app_settings = new _app_Settings(options);
    if (typeof options.options.onReady === 'function'){
        options.options.onReady();
    }
}
$.appSettings.get = function(key){
    return $.appSettings._app_settings.get(key);
};
$.appSettings.set = function(key, value){
    return $.appSettings._app_settings.set(key, value);
};
$.appSettings.add = function(key, value){
    return $.appSettings._app_settings.add(key, value);
};
$.appSettings.remove = function(key, value){
    return $.appSettings._app_settings.remove(key, value);
};
$.appSettings.reset = function(){
    return $.appSettings._app_settings.reset();
};
$.appSettings.getForm = function(){
    return $.appSettings._app_settings.getForm();
}




// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/string/capitalize [v1.0]
String.prototype.capitalize = function(){ //v1.0
    return this.replace(/\w+/g, function(a){
        return a.charAt(0).toUpperCase() + a.substr(1).toLowerCase();
    });
};
