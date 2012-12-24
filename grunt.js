module.exports = function(grunt){
	grunt.initConfig({
		pkg : '<json:package.json>',
		meta : {
			matchMediaBanner : '/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */',
			minBanner : '/* <%= pkg.name %> | Version <%= pkg.version %> | <%= pkg.repository.url %> */'
		},
		lint : {
			all : [
				'*.js',
				'test/*.js'
			]
		},
		watch : {
			files : '<config:lint.all>',
			tasks : 'lint'
		},
		jshint : {
			options : {
				
			},
			globals : {}
		},
		exServer : {
			port : 8000,
			root : './examples'
		}
	});

	grunt.registerTask('build', function(){
		var minSrc = grunt.config.get('meta.matchMediaBanner');
		minSrc += '\n' + grunt.helper('uglify', grunt.file.read('matchmedia/matchMedia.js'));
		minSrc += '\n' + grunt.template.process(grunt.config.get('meta.minBanner'));
		minSrc += '\n' + grunt.helper('uglify', grunt.file.read('matchMediaManager.js'));
		grunt.file.write('matchMediaManager.min.js', minSrc);
	});

	grunt.registerTask('default', 'lint');
};
