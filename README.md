# Match Media Manager #

[Example Page](http://match-media-manager.wesleytodd.com/)

`MatchMediaManager` is a library to assist with javascript callbacks based on Media Queries.  For example, if a link opens a light-box when on a large screen, but you need to re-direct that to a single page version of the content for small screens, you can do something like (jQuery is not required):

	MatchMediaManager({
		'(min-width: 500px)' : {
			on : function(){
				$('a.my-link').on('click.my-namespace', function(e){
					// dont open the new page
					e.preventDefault();
					// open lightbox instead
				});
			},
			off : function(){
				$('a.my-link').off('click.my-namespace');
			}
		}
	});

This same technique can be used to move elemnts around the page, setup plugins or fork code for anything that you can test with a Media Query.

The library requires the [matchMedia pollyfill](https://github.com/paulirish/matchMedia.js) for support beyond VERY modern browsers, but defaults to native support.  It is included in the minified version by default, but if you are already loading it for another reason, feel free to remove it. The library will also delegate parts of it's functionality to jQuery and Underscore if they are present.

## Usage ##

You only get two methods, `MatchMediaManager` and `addMediaQuery`.  The first creates an instance of the library. (Note: the `new` operator is optional):

	var mmm = MatchMediaManager();

The second can be used to add new Media Queries to the list on the fly:

	mmm.addMediaQuery('(max-width: 150em)', function(){
		// less than 150em
	});

You can also remove media queries using `removeMediaQuery`, with no arguments it clears all media queries:

	mmm.removeMediaQuery();

Or with a media query string to remove just the callbacks on that media query:

	mmm.removeMediaQuery('(max-width: 150em');
