/*
 * MatchMediaManager
 * http://wesleytodd.com/
 *
 * Version 0.1
 *
 * Basic Usage:
 *
 * var mmm = MatchMediaManager({
 *	'(min-width: 500px)' : {
 *		on : function(){
 *			// More than 500px
 *		},
 *		off : function(){
 *			// less than 500px
 *		}
 * });
 *
 * mmm.addMediaQuery('screen and (max-width: 1000px)', function(){
 *	// less than 1000px and screen...even though i dont think javascript runs anywhere else...
 * });
 *
 */
var MatchMediaManager = (function($, _, MatchMediaManager) {

	/**
	 * typeof == obj wraper
	 */
	var _t = function(obj, type) {
		return typeof obj == type;
	};

	/**
	 * foreEach implementation
	 *
	 * Will use underscore's each function if it is present
	 */
	var each = (!_t(_, 'undefined')) ? _.each : function(obj, iterator, context){
		if(obj == null) return;
		if(Array.prototype.forEach && obj.forEach === Array.prototype.forEach){
			obj.forEach(iterator, context);
		}else if(Object.prototype.toString(obj) == '[object Array]' || !!(obj && hasOwnProperty.call(obj, 'callee'))){
			for(var i = 0, l = obj.length; i < l; i++){
				if(iterator.call(context, obj[i], i, obj) === {}) return;
			}
		} else {
			for(var key in obj){
				if(iterator.call(context, obj[key], key, obj) === {}) return;
			}
		}
	};

	/**
	 * Callbacks list
	 *
	 * Will use jQuery's $.Callbacks if it is present, otherwise it uses the custom minimal version needed
	 */
	var Callbacks = (!_t($, 'undefined')) ? $.Callbacks : function() {
		var list = [];
		return {
			add : function(fnc){
				list.push(fnc);
			},
			fire : function(){
				each(list, function(fnc){
					fnc.call();
				});
			}
		};
	};

	/**
	 * window.onResize
	 */
	var resize = (!_t($, 'undefined')) ? $(window).resize : function(fnc) {
		window.onresize = fnc;
	};

	/**
	 * MatchMediaManager constructor
	 */
	var MatchMediaManager = function(mediaQueries) {
		if ( !(this instanceof MatchMediaManager) ) {
			return new MatchMediaManager(mediaQueries);
		} else {
			var _me = this;
			this._mediaQueries = {};
			if (_t(mediaQueries, 'object')) {                                                                                                                                                                      
				each(mediaQueries, function(k, v) {
					_me.addMediaQuery(v, k);
				});
			}
			resize(function(){
				_me.testQueries();
			});
		}
    };

	/**
	 * Test all the attached Media Queries
	 */
    MatchMediaManager.prototype.testQueries = function() {
        each(this._mediaQueries, function(mq){
            mq.test();
        });
    };

	/**
	 * Add a media query to the manager
	 *
	 * @param string mediaQuery A valid media query string
	 * @param function|object callbacks Either a function to attach to the 'on' event, or a hash of event:callback
	 */
    MatchMediaManager.prototype.addMediaQuery = function(mediaQuery, callbacks) {

		// if the media query dosent already exist, create it
        if (_t(this._mediaQueries[mediaQuery], 'undefined')) {
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
			each(callbacks, function(fnc, e) {
				_mq[e](fnc);
			});

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
	 * Test the status of the media query
	 *
	 * @param bool fire Should the callbacks be fired? (true = yes, false = no)
	 */
    MediaQuery.prototype.test = function(fire) {

		// fire defaults to true
        fire = (typeof fire != 'undefined') ? fire : true;

		// test the media query using matchMedia (requires polyfill in non-supported browsers)
        var matches = matchMedia(this.query).matches;

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
	 * Reveal access to MatchMediaManager
	 */
	return MatchMediaManager;

})(window.jQuery, window._);
