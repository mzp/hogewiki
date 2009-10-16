//<![CDATA[

/*
	name : friendfeed
	file : jquery.friendfeed.js
	author : gregory tomlinson
	site: http://gregorytomlinson.com/
	///////////////////////////
	///////////////////////////
	dependencies : jQuery 1.3.2
	///////////////////////////
	///////////////////////////

	The MIT License
	Copyright (c) 2009 Gregory Tomlinson
	http://www.opensource.org/licenses/mit-license.php

*/

(function($) {

    $.fn.friendfeed = function( user, options ) {

	/* declare INSTANCE specific variables and settings */
	/* extend the defaults to include all user specified options */
	var defaults = $.extend( true, $.friendfeed.defaults, options );

	defaults.user = user;
	var	success = function( jo ) {
	    if( !jo || !jo.entries ) { return false; }

	    // provide 'this' as the target container
	    this.text("");
	    var user = $("<div class='user' />").append(
		$("<a />").attr("href","http://friendfeed.com/"+jo.id).append(
		    $("<img />").attr("src","http://friendfeed-api.com/v2/picture/"+jo.id+"?size=medium")),
		$("<a />").attr("href","http://friendfeed.com/"+jo.id).text(jo.name))
	    user.appendTo(this);
	    $.friendfeed.render( this, jo.entries, defaults );
	},
	callback = $.friendfeed.delegate( success, this );

	/* connect to the remote data source: friendfeed */
	$.friendfeed.connector( defaults.url+user, defaults.params, callback );

	return this; /* jQuery default behavior, return container */
    };

    $.friendfeed = {

	dates : {
	    // time in milliseconds
	    "5days" : 432000000,
	    "2days" : 172800000,
	    "1day" : 86400000,
	    "1hour" : 1440000,
	    "1min" : 60000,
	    months : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	    days : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	    previousDay : "yesterday"
	},

	log : function( str ) {
	    if( !this.defaults.debug ) { return; }
	    try {
		console.log( str );
	    } catch(e){}
	},
	connector : function( src, params, callback ) {
	    var str = $.param(params);
	    $.ajax({
		dataType: 'jsonp',
		data : str,
		jsonp: 'callback',
		url : src,
		success: callback
	    });
	},
	formatDate : function( time, diff ) {
	    var d = this.dates, date = new Date( time ), response="";
	    if( diff >= d["5days"] ) {

		response = d.months[date.getMonth()] + " " +date.getDate() + ", " + date.getFullYear(); /* Jan 1, 1970 */
	    } else if( diff >= d["2days"] ) {

		response = d.days[ date.getDay() ]; /* Tuesday */
	    } else if( diff >= d["1day"] ) {

		response = d.previousDay; /* yesterday */
	    } else if( diff >= d["1hour"] ) {
		var tag = ( diff <= (d["1hour"]*2) ) ?  " hour ago" : " hours ago";
		response = Math.ceil( diff / 1000 / 60 / 60 ) + tag; /* N hours ago */
	    } else if( diff >= d["1min"] ) {
		var tag = ( diff < (d["1min"]*2) ) ?  " min ago" : " mins ago";
		response = Math.ceil( diff / 1000 / 60 ) + tag; /* N mins ago */
	    } else {

		response = "now";
	    }

	    //this.log( response );

	    return response;

	},
	parseDate : function( time_string ) {
	    //2009-09-18T13:39:17Z
	    //this.log( time_string );
	    time_string=time_string.slice(0, -1);
	    var d = time_string.split("T"), time = d.pop().split(":"),
	    date=d.pop().split("-"),
	    now = (new Date()).getTime(),
	    // have to adjust the months to start at 0
	    then = Date.UTC( date[0], date[1]-1, date[2], time[0], time[1], time[2] ),
	    diff = (now - then);

	    return this.formatDate( then, diff ) + " ";
	},
	render : function( container, items, defaults ) {
	    var css = defaults.css, bx = $('<ul />').addClass( css.bx );
	    this.log( 'Render Elements' );
	    for(var i=0; i<items.length; i++) {
		if( items[i].via ) {
		    var link = $('<a />').attr('href', items[i].via.url).html(items[i].via.name);
		    $('<li />').append(items[i].body,
				       " via ",
				       link).appendTo( bx );
		}else{
		    $('<li />').html( items[i].body ).appendTo( bx );
		}
	    }
	    bx.appendTo( container );
	},

	/* @private */
	renderComment : function( comments, css, el, link ) {
	    if( !comments || comments.length <= 0 ) { return false; }

	    for( var i=0; i<comments.length; i++ ) {

		var from = ( comments[i].from ) ? " -" + comments[i].from.name : "",
		p = $('<p />').addClass( css.comment ).appendTo( el );

		if( comments[i].placeholder ) {
		    $('<a />').attr('href', link).html( comments[i].body ).appendTo( p );
		} else {
		    p.html( comments[i].body + from );
		}


	    }

	    return true;

	},

	delegate : function( func, scope ) {
	    // fix scope to point where I say it
	    var fn = func;
	    return function() {
		fn.apply( scope, arguments );
	    }
	}
    }

    /* define defaults for override */
    $.friendfeed.defaults = {
	url : 'http://friendfeed-api.com/v2/feed/',
	user : '', debug : false,
	params : {
	    format : 'json',
	    locale:'en',
	    num : 3,
	    maxcomments : 3
	},
	css : {
	    bx : 'ff_box',
	    item : 'ff_item',
	    meta : 'ff_meta',
	    time : 'ff_time',
	    comment_link : 'comment_outlink',
	    comment : 'ff_comment'

	}
    };

})(jQuery);

//]]>
