var fs = require('fs');
var marked = require('marked');
// This is the base controller. Used for base routes, such as the default index/root path, 404 error pages, and others.
module.exports = {
    index: {
        handler: function(request, reply){
            var scripts = "";
            var page = 'dashboard';

            var markdown = fs.readFileSync(__dirname+'/../../../README.md', {encoding: 'utf8'});
            
            // Render the view with the custom greeting
            reply.view('index', {
                title: 'Hapi Dash - Boiler Plate Dashboard',
                scripts: scripts,
                page: page,
                text: marked(markdown)
            });
        },
        app: {
            name: 'index'
        },
        auth: {
            strategy: 'session'
        }
    },
    page: {
        handler: function(request, reply){
            var page = request.params.path;
            // Custom page specific scripts
            var scripts = "";    
            switch(page) {
                case "chat":
                    scripts += "<script src=\"js/chat.js\"></script>";
                    break;
                case "watable":
                    scripts += "<link rel=\"stylesheet\" href=\"js/watable/watable.css\" type=\"text/css\" />";
                    scripts += "<script src=\"js/watable/jquery.watable.js\"></script>";
                    scripts += "<script src=\"js/watable/demo.watable.js\"></script>";
                    break;
                case "gallery":
                    scripts += "<link rel=\"stylesheet\" href=\"js/fancybox2/jquery.fancybox.css\" type=\"text/css\" media=\"screen\" />";
                    scripts += "<script src=\"js/fancybox2/jquery.fancybox.pack.js\"></script>";
                    scripts += "<script>$(document).ready(function() { $(\".fancybox\").fancybox(); });</script>";
                    break;
                case "chartjs":
                    scripts += "<script src=\"js/chartjs-conf.js\"></script>";
                    break;
                case "morris":
                    scripts += "<link rel=\"stylesheet\" href=\"http://cdn.oesmith.co.uk/morris-0.4.3.min.css\">\n"; 
                    scripts += "<script src=\"http://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js\"></script>";
                    scripts += "<script src=\"http://cdn.oesmith.co.uk/morris-0.4.3.min.js\"></script>";
                    scripts += "<script src=\"js/morris-conf.js\"></script>";
                    break;
                case "form-components":
                    scripts += "<script src=\"js/bootstrap-switch.js\"></script>\n";
                    scripts += "<script src=\"js/jquery.tagsinput.js\"></script>\n";
                    scripts += "<script src=\"js/form-component.js\"></script> \n";
                    break;
                case "to-do":
                    scripts += "<script src=\"http://code.jquery.com/ui/1.10.3/jquery-ui.js\"></script>\n"
                    scripts += "<script src=\"js/tasks.js\"></script>\n"
                    scripts += "<script>jQuery(document).ready(function() { TaskList.initTaskWidget(); });\n $(function() { $( \"#sortable\" ).sortable(); $( \"#sortable\" ).disableSelection(); }); </script>"
                    break;
                case "panels":
                    scripts += "<script src=\"js/jquery.sparkline.js\"></script>\n";
                    scripts += "<script src=\"js/sparkline-chart.js\"></script>\n";
                    break;
                case "calendar":
                    scripts += "<script src=\"js/calendar-conf-events.js\"></script>\n";
                    break;
                default:
                    scripts += "<script>$(function(){$('select.styled').customSelect();});</script>";
            } 

        
            if(fs.existsSync(__dirname +'/../views/'+page+'.html')) {
                reply.view(page, {
                    title: 'Hapi Dash - Boiler Plate Dashboard',
                    scripts: scripts,
                    page: page
                });
            } else {
                reply.view('404', {
                    title: 'No page found!'
                }).code(404);
            }  
        },
        app: {
            name: 'about'
        },
        auth: {
            strategy: 'session'
        }
    }
}
