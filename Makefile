closure:
	@echo "/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */" > matchMediaManager.min.js
	@java -jar ~/scripts/closure/compiler.jar --js matchmedia/matchMedia.js >> matchMediaManager.min.js
	@echo "/* MatchMediaManager | Version 0.1 | http://wesleytodd.com/ */" >> matchMediaManager.min.js
	@java -jar ~/scripts/closure/compiler.jar --js matchMediaManager.js >> matchMediaManager.min.js

.PHONY: closure
