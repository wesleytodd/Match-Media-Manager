/*
 * MatchMediaManager
 * http://wesleytodd.com/
 *
 * Version 1.0.0
 *
 * Basic Usage:
 *
 * var mmm = MatchMediaManager({
 *	'(min-width: 500px)' : {
 *		on : function(){
 *			// More than 500px
 *		},
 *		off : function(){
 *			// less than 501px
 *		}
 * });
 *
 * mmm.addMediaQuery('screen and (max-width: 1000px)', function(){
 *	// less than 1000px and screen...even though i dont think javascript runs anywhere else...
 * });
 *
 */
var MatchMediaManager = (function($, reveal) {

	/**
	 * typeof == obj wraper
	 */
	var _t = function(obj, type) {
		if (typeof type === 'undefined') type = 'undefined';
		return typeof obj == type;
	};

	/**
	 * Callbacks list
	 *
	 * Based on jQuery's $.Callbacks, just with the bare minimum functionality
	 */
	var Callbacks = function() {
		var list = [];
		return {
			add : function(fnc) {
				list.push(fnc);
			},
			fire : function() {
				var args = arguments[0],
					l = list.length;
				for (var i = 0; i < l; i++) {
					args = list[i].call(this, args);
				}
				return args;
			},
			has : function(fnc){
				if(_t(fnc)) return !!list.length;
				return list.indexOf(fnc) !== -1;
			}
		};
	};

	/**
	 * window.onResize
	 */
	var resize = function(fnc) {
		if (!_t($)) {
			$(window).resize(fnc);
		} else if (window.addEventListener) {
			window.addEventListener('resize', fnc);
		} else {
			window.attachEvent('onresize', fnc);
		}
	};

	/**
	 * MatchMediaManager constructor
	 */
	var MatchMediaManager = function(mediaQueries) {
		if ( !(this instanceof MatchMediaManager) ) {
			return new MatchMediaManager(mediaQueries);
		} else {
			this._mediaQueries = {};
			if (_t(mediaQueries, 'object')) {
				for (var k in mediaQueries) {
					var a,
						v = mediaQueries[k];
					if (!_t(v.additionalTest)) {
						a = v.additionalTest;
						delete v.additionalTest;
					}
					this.addMediaQuery(k, v, a);
				}
			}
			var me = this;
			resize(function(){
				me.testQueries();
			});
		}
	};

	/**
	 * Test all the attached Media Queries
	 */
	MatchMediaManager.prototype.testQueries = function() {
		for (var i in this._mediaQueries) {
			this._mediaQueries[i].test();
		}
	};

	/**
	 * Add a media query to the manager
	 *
	 * @param string mediaQuery A valid media query string
	 * @param function|object callbacks Either a function to attach to the 'on' event, or a hash of event:callback
	 */
	MatchMediaManager.prototype.addMediaQuery = function(mediaQuery, callbacks, additionalTest) {

		// if the media query dosent already exist, create it
		if (_t(this._mediaQueries[mediaQuery])) {
			this._mediaQueries[mediaQuery] = new MediaQuery(mediaQuery);
		}

		// the current media query being added
		var _mq = this._mediaQueries[mediaQuery];

		// what are we dealing with?
		if (_t(callbacks, 'function')) {

			// if callbacks is a function, then add it to the on list
			_mq.on(callbacks);

		} else if (_t(callbacks, 'object')) {

			// if callbacks is an object, loop through the properties and call associated functions to add callbacks
			for (var e in callbacks) {
				_mq[e](callbacks[e]);
			}

		}

		// if an additional test is provided, add it
		if (!_t(additionalTest, 'undefined')) {
			_mq.additionalTest(additionalTest);
		}

		// test the media query when it is added, but not the others already added
		var matches = _mq.test(false);
		if (matches && _t(callbacks, 'function')) {
			callbacks();
		} else if (matches) {
			callbacks.on();
		} else if (_t(callbacks.off, 'function')) {
			callbacks.off();
		}
	};

	/**
	 * Remove a media query from the manager
	 *
	 * @param string mediaQuery (optional) A valid media query string
	 */
	MatchMediaManager.prototype.removeMediaQuery = function(mediaQuery) {
		// If nothing provided, clear out all media queries
		if (_t(mediaQuery)) return this._mediaQueries = {};
		
		// If a mediaQuery is passed, clear out that media query
		delete this._mediaQueries[mediaQuery];
	};

	/**
	 * MediaQuery constructor
	 *
	 * This object manages an individual media querie's state
	 *
	 * @param string mediaQuery A valid media query string
	 */
	var MediaQuery = function(mediaQuery) {
		this.query = mediaQuery;
		this.matches = false;
		this._on = Callbacks();
		this._off = Callbacks();
		this._additionalTests = Callbacks();
	};

	/**
	 * Attach a callback to be fired when the media query matches
	 *
	 * @param function fnc Callback function
	 */
	MediaQuery.prototype.on = function(fnc) {
		this._on.add(fnc);
	};

	/**
	 * Attach a callback to be fired when the media query no longer matches
	 *
	 * @param function fnc Callback function
	 */
	MediaQuery.prototype.off = function(fnc) {
		this._off.add(fnc);
	};

	/**
	 * Attach an additional test to filter the media query results
	 *
	 * @param function fnc Callback function
	 */
	MediaQuery.prototype.additionalTest = function(fnc) {
		this._additionalTests.add(fnc);
	};

	/**
	 * Test the status of the media query
	 *
	 * @param bool fire Should the callbacks be fired? (true = yes, false = no)
	 */
	MediaQuery.prototype.test = function(fire) {

		// fire defaults to true
		fire = (!_t(fire)) ? fire : true;

		// test the media query using matchMedia (requires polyfill in non-supported browsers)
		var matches = matchMedia(this.query).matches;

		// Pass the original results to the additional tests
		if (this._additionalTests.has())
			matches = this.fireAdditionalTests(matches);

		// if firing callbacks and the status has changed, then fire away
		if (fire && this.matches !== matches) {
			if (matches) {
				this.fireOn();
			} else {
				this.fireOff();
			}
		}

		// update the matched status
		this.matches = matches;

		// return the matched status
		return matches;
	};

	/**
	 * Fires the 'on' callbacks
	 */
	MediaQuery.prototype.fireOn = function() {
		this._on.fire();
	};

	/**
	 * Fires the 'off' callbacks
	 */
	MediaQuery.prototype.fireOff = function() {
		this._off.fire();
	};

	/**
	 * Fires the additional tests
	 */
	MediaQuery.prototype.fireAdditionalTests = function(mqResult) {
		return this._additionalTests.fire(mqResult);
	};

	/**
	 * Reveal access to MatchMediaManager
	 */
	if (!_t(reveal) && reveal === true) {
		MatchMediaManager._internal = {
			_t : _t,
			resize : resize,
			Callbacks : Callbacks,
			MediaQuery : MediaQuery
		};
	}
	return MatchMediaManager;

})(window.jQuery, MatchMediaManager);
