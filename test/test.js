describe('MatchMediaManager', function(){
	describe('Internal Methods', function(){
		it('_t should test typeof correctly', function(){
			var _t = MatchMediaManager._internal._t;
			expect(_t({}, 'object')).to.be.ok();
			expect(_t(function(){}, 'function')).to.be.ok();
			expect(_t('string', 'string')).to.be.ok();
			expect(_t(1, 'number')).to.be.ok();
			expect(_t('1', 'string')).to.be.ok();
		});

		it('Callbacks should add and fire functions', function(){
			var Callbacks = MatchMediaManager._internal.Callbacks,
				c = Callbacks(),
				i = false;
			c.add(function(){
				i = true;
			});
			c.fire();
			expect(i).to.be.ok();
		});

		it('resize should attach events to the window.onresize event', function(){
			// Note: this test requires jQuery because window.resizeTo is disabled
			var resize = MatchMediaManager._internal.resize,
				i = false;
			resize(function(){
				i = true;
			});
			$(window).resize();
			expect(i).to.be.ok();
		});

		describe('MediaQuery', function(){

			it('setup a new instance', function(){
				var MediaQuery = MatchMediaManager._internal.MediaQuery,
					mq = new MediaQuery('screen');

				expect(mq).to.be.a(MediaQuery);
				expect(mq.query).to.be('screen');
				expect(mq.matches).to.be(false);
				expect(mq._on).to.be.a('object');
				expect(mq._off).to.be.a('object');
			});

			it('add callbacks to the \'on\' list', function(){
				var MediaQuery = MatchMediaManager._internal.MediaQuery,
					mq = new MediaQuery('screen'),
					f = function(){};
				mq.on(f);
				expect(mq._on.has(f)).to.be.ok();
			});

			it('add callbacks to the \'off\' list', function(){
				var MediaQuery = MatchMediaManager._internal.MediaQuery,
					mq = new MediaQuery('screen'),
					f = function(){};
				mq.off(f);
				expect(mq._off.has(f)).to.be.ok();
			});

			it('test the media query', function(){
				var MediaQuery = MatchMediaManager._internal.MediaQuery,
					mq = new MediaQuery('screen'),
					r = mq.test();
				expect(r).to.be.ok();
				mq = new MediaQuery('print');
				r = mq.test();
				expect(r).to.not.be.ok();
			});

			it('fire callbacks on the \'on\' list', function(){
				var MediaQuery = MatchMediaManager._internal.MediaQuery,
					mq = new MediaQuery('screen'),
					i = false;
				mq.on(function(){
					i = true;
				});
				mq.fireOn();
				expect(i).to.be.ok();

				i = false;
				mq.test();
				expect(i).to.be.ok();
			});

			it('fire callbacks on the \'off\' list', function(){
				var MediaQuery = MatchMediaManager._internal.MediaQuery,
					mq = new MediaQuery('print'),
					i = false;
				mq.off(function(){
					i = true;
				});
				mq.fireOff();
				expect(i).to.be.ok();

				mq.matches = true;
				i = false;
				mq.test();
				expect(i).to.be.ok();
			});

			it('not fire callbacks when false is passed to test', function(){
				var MediaQuery = MatchMediaManager._internal.MediaQuery,
					mq = new MediaQuery('screen'),
					i = true;
				mq.on(function(){
					i = false;
				});
				mq.test(false);
				expect(i).to.be.ok();
			});

		});

	});

	describe('External API', function(){

		it('return an instance with or without the new operator', function(){
			expect(MatchMediaManager()).to.be.a(MatchMediaManager);
			expect(new MatchMediaManager()).to.be.a(MatchMediaManager);
		});

		it('add media queires and callbacks passed on instantiation', function(){
			var f = function(){},
				f1 = function(){},
				mmm = MatchMediaManager({
					'screen' : f,
					'print' : {
						on : f,
						off: f1
					}
				});
			expect(mmm._mediaQueries['screen']._on.has(f)).to.be.ok();
			expect(mmm._mediaQueries['print']._on.has(f)).to.be.ok();
			expect(mmm._mediaQueries['print']._off.has(f1)).to.be.ok();
		});

		it('add individual media queries', function(){
			var mmm = MatchMediaManager(),
				f = function(){},
				f1 = function(){};
			mmm.addMediaQuery('screen', f);
			expect(mmm._mediaQueries['screen']._on.has(f)).to.be.ok();

			mmm.addMediaQuery('print', {
				on : f,
				off : f1
			});
			expect(mmm._mediaQueries['print']._on.has(f)).to.be.ok();
			expect(mmm._mediaQueries['print']._off.has(f1)).to.be.ok();
		});

		it('test all the media queries', function(){
			var screen = false,
				print = false,
				mmm = MatchMediaManager({
					'screen' : function(){
						screen = true;
					},
					'print' : {
						on : function(){
							print = false;
						},
						off : function(){
							print = true;
						}
					}
				});
				mmm.testQueries();
				expect(screen).to.be.ok();
				expect(print).to.be.ok();
		});

		it('fire callbacks on window resize', function(){
			var i = 0,
				mmm = MatchMediaManager({
					'screen' : function(){
						i++;
					}
				});
			mmm._mediaQueries['screen'].matches = false;
			$(window).resize();
			expect(i).to.be(2);
		});

		it('add additional JavaScript test to media query', function(){
			var mmm = MatchMediaManager(),
				testFnc = function(result){
					return result;
				};

			mmm.addMediaQuery('screen', function(){}, testFnc);
			expect(mmm._mediaQueries['screen']._additionalTests.has(testFnc)).to.be.ok();
		});

		it('pass the media query result to the additional test function', function(){
			var mmm = MatchMediaManager(),
				testFnc = function(result){
					expect(result).to.be(true);
					return result;
				},
				testFnc2 = function(result){
					expect(result).to.be(false);
					return result;
				};

			mmm.addMediaQuery('screen', function(){}, testFnc);
			mmm.addMediaQuery('print', function(){}, testFnc2);
		});

		it('alter the result inside an additional test function', function(){
			var mmm = MatchMediaManager(),
				t = true,
				f = true,
				testFnc = function(result){
					return !result;
				};

			mmm.addMediaQuery('screen', function(){
				t = false;
			}, testFnc);
			mmm.addMediaQuery('print', function(){
				f = false;
			}, testFnc);

			expect(t).to.be.ok();
			expect(f).to.not.be.ok();
		});

		it('add media queries with additional tests on instantiation', function(){
			var testFnc = function(){},
				mmm = MatchMediaManager({
					'screen' : {
						on : function(){},
						additionalTest : testFnc
					}
				});
			mmm._mediaQueries['screen']._additionalTests.has(testFnc);
		});

	});
});
