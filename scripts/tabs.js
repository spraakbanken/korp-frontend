// tabs - jQuery plugin for accessible, unobtrusive tabs by Klaus Hartl
// http://stilbuero.de/tabs/
// Free beer and free speech. Enjoy!
$.tabs = function(containerId, start) {
    var ON_CLASS = 'on';
    var id = '#' + containerId;
    var i = (typeof start == "number") ? start - 1 : 0;
    $(id + '>div:lt(' + i + ')').add(id + '>div:gt(' + i + ')').hide();
    $(id + '>ul>li:nth-child(' + i + ')').addClass(ON_CLASS);
    $(id + '>ul>li>a').click(function() {
        if (!$(this.parentNode).is('.' + ON_CLASS)) {
            var re = /([_\-\w]+$)/i;
            var target = $('#' + re.exec(this.href)[1]);
            if (target.size() > 0) {
                $(id + '>div:visible').hide();
                target.show();
                $(id + '>ul>li').removeClass(ON_CLASS);
                $(this.parentNode).addClass(ON_CLASS);
            } else {
                alert('There is no such container.');
            }
        }
        return false;
    });
};