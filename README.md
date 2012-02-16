jQuery appSettings
==================

Use [jStorage](http://www.jstorage.info/) to easily manage persistent settings for a desktop or mobile web application.


Configure like this:
--------------------
``` javascript
config = {
    // On/Off Toggle
    ready: {
        type:   'toggle'
      , selected: true
    }

    // Choose One, show with Radio Buttons
  , 'paper_or_plastic':   {
        type: 'choose_one'
      , selections: ['paper','plastic','other']
      , selected: 'paper'
    }
    
    // Choose Many, show with Checkbox
  , 'groceries':  {
        type: 'choose_many'
      , selections: ['eggs', 'waffles', 'beer', 'broccoli']
      , selected: ['beer', 'broccoli']
    } 

};
```
        

Initialize like this:
---------------------

``` javascript
$.appSettings.initialize({
    // The jStorage key
    _id:  'APP_SETTINGS_DEMO'

    // The settings for your application
  , config: config

  , options: {

      //  jQuery Mobile form, using flip switch for toggle
      //  http://jquerymobile.com/test/docs/forms/docs-forms.html
      mobile: true  
    }

});
```

Get an API on your settings like this:
--------------------------------------

``` javascript
// Get settings
// ----------------
$.appSettings.get('toggle_me')      // true
$.appSettings.get('choose_one'))    // 'option_b'
$.appSettings.get('choose_many')    // ['option_d', 'option_f']

// Make changes to settings, which persist across page loads.
// ----------------------------------------------------------
// Toggle and Choose One types:
$.appSettings.set('toggle_me', false);
$.appSettings.set('choose_one', 'option_c')
// Add/Remove choices for Choose Many type
$.appSettings.add('choose_many', 'option_e')
$.appSettings.remove('choose_many', 'option_e')
```

Best of all, get a UI for managing these settings:
--------------------------------------------------

``` javascript
// HTML Form, which will control the settings object.
// --------------------------------------------------
$.appSettings.getForm().appendTo('BODY');
```


