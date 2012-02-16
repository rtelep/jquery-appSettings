
function run_tests () {


    module('');
    test('', function(){
        
        config = {

                // On/Off Toggle, show with an on/off slider
                toggle_me:      {
                        type:   'toggle'
                    ,   selected: true
                }
  
                // Choose One, show with Radio Buttons
            ,   choose_one:     {
                        type: 'choose_one'
                    ,   selections: ['option_a', 'option_b', 'option_c']
                    ,   selected: 'option_b'
                }
                
                // Choose Many, show with Checkbox
            ,   choose_many:    {
                        type:   'choose_many'
                    ,   selections: ['option_d', 'option_e', 'option_f']
                    ,   selected: ['option_d', 'option_f']
                } 

        };
        
        $.appSettings.initialize({
                _id:    'GET_FORM_TEST'
            ,   config: config
            ,   options: options
        });
    
        var form = $.appSettings.getForm();
        $('#test_form').append(form);

        equals('ok', 'ok');

        as = $.appSettings._app_settings

    });
    
}


