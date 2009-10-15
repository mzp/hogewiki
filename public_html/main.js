$(document).ready(function(){
    $(".twitter").each(function(_,e){
	var dom = $(e);
	dom.append("<div class='loading'>loading</div>");
	dom.twit(dom.attr("name"),{count:3});
    });
});
