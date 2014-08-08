// assets to be used by the 'hapi-assets' module based on process.env.NODE_ENV
module.exports = {
    development: {
        js: ['js/jquery.js', 
        	'js/bootstrap.min.js',
        	'js/jquery-ui-1.9.2.custom.min.js',
        	'js/bootstrap-datepicker.js',
        	'js/fullcalendar/fullcalendar.min.js',
        	'js/jquery.ui.touch-punch.min.js', 
        	'js/jquery.dcjqaccordion.2.7.js', 
        	'js/jquery.scrollTo.min.js', 
        	'js/jquery.nicescroll.js',
            'js/jquery.notify.js', 
        	'js/common-scripts.js'
        ],
        css: ['css/bootstrap.css',
        	'css/font-awesome/css/font-awesome.css',
        	'css/datepicker.css',
            'css/notify.css',
        	'js/fullcalendar/bootstrap-fullcalendar.css',
        	'css/style.css', 
        	'css/style-responsive.css',
        	'css/to-do.css'
        ]
    },
    production: {
        js: ['js/scripts.js'],
        css: ['css/styles.css']
    }
}


    
    