/**
 * Twit
 *  jQuery Plugin to Display Twitter Tweets on a Blog.
 *  http://code.google.com/p/jquery-twit/
 *
 * Copyright (c) 2009 Yusuke Horie
 *
 * Released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Since  : 0.1.1 - 08/26/2009
 * Version: 0.1.1 - 08/31/2009
 */
(function(jQuery){

  var _i = 0;

  /** public methods **/

  jQuery.fn.twit = function (user, options) {
    if (typeof user != 'string') return this;

    var
      opts = jQuery.extend({}, jQuery.fn.twit.defaults, options),
      c = jQuery.isFunction(opts.callback) ? opts.callback: _callback,
      url = 'http://twitter.com/statuses/user_timeline/' + user + '.json',
      params = {};

    opts.user = user;
    params.count = opts.count;

    return this.each(function(i, e) {
      var $e = $(e);
      if (!$e.hasClass('twit')) $e.addClass('twit');

      jQuery.ajax({
        url: url,
        data: params,
        dataType: 'jsonp',
        success: function (o) {
	  $e.text("");
          c.apply(this, [(o.results) ? o.results: o, e, opts]);
        }
      });
    });
  };

  jQuery.fn.twit.defaults = {
    user: null,
    callback: null,
    icon: true,
    username: true,
    text: true,
    count: 200,
    limit: 7,
    label: 'Twitter',
    title: ''
  };

  /** private method **/

  var _callback = function (o, e, opts) {
    var $this = $(e);
    if (!o || o.length == 0 || $this.length == 0) return false;
    $this.data('_inc', 1);
    _i++;

    var username = o[0].user.screen_name,
        icon = o[0].user.profile_image_url;

    var h = "";
    if (opts.icon || opts.username) {
	h += '<div class="user">';
      if (opts.icon)
        h +=
          ' <a href="http://twitter.com/' + username + '/">' +
          '  <img src="' + icon + '" alt="' + username + '" title="' + username + '" style="vertical-align:middle;" />' +
          ' </a>&nbsp;&nbsp;';
      if (opts.username)
        h += '<a href="http://twitter.com/' + username + '/">' + username + '</a>';
      h += '</div>';
    }
    h += '<ul>' + _build(o, $this, opts) + '</ul>';

    $this.html(h);

    $('#twitList' + _i + ' a.twitEntryShow').live('click.twitEntryShow' + _i, function (event) {
      event.preventDefault();
      var $t = $(this);

      $t.parent().fadeOut(400, function () {
        var i = $this.data('_inc');
        i++;
        $this.data('_inc', i);

        if ($t.hasClass('twitEntryAll')) {
          $t.die('click.twitEntryShow' + _i);
          var start = (i*opts.limit) - opts.limit;
          $(this).after(_build(o, $this, opts, start, o.length)).remove();
        } else {
          $(this).after(_build(o, $this, opts)).remove();
        }
      });
    });

  };

  var _build = function (o, $t, opts, s, e) {
    var
      h = '',
      inc = $t.data('_inc'),
      start = s || (inc*opts.limit) - opts.limit,
      end = e || ((o.length > start + opts.limit) ? start + opts.limit: o.length);

    for (var i=start; i<end; i++) {
      var
        t = o[i],
        username = t.user.screen_name,
        icon = t.user.profile_image_url;

      h += '<li>';
      if (opts.text) {
        var text = t.text
          .replace(/(https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/, function (u) {
            var shortUrl = (u.length > 30) ? u.substr(0, 30) + '...': u;
            return '<a href="' + u + '">' + shortUrl + '</a>';
          })
          .replace(/@([a-zA-Z0-9_]+)/g, '@<a href="http://twitter.com/$1">$1</a>')
          .replace(/(?:^|\s)#([^\s\.\+:!]+)/g, function (a, u) {
            return ' <a href="http://twitter.com/search?q=' + encodeURIComponent(u) + '">#' + u + '</a>';
          });
          h += text;
      }

      h += '</li>';
    }
    return h;
  };

})(jQuery);