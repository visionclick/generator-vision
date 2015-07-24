'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');


var YawaGenerator = module.exports = function YawaGenerator(args, options, config) {
	yeoman.generators.Base.apply(this, arguments);

	// setup the test-framework property, Gruntfile template will need this
	this.testFramework = options['test-framework'] || 'mocha';

	// for hooks to resolve on mocha by default
	if (!options['test-framework']) {
		options['test-framework'] = 'mocha';
	}

	// resolved to mocha by default (could be switched to jasmine for instance)
	this.hookFor('test-framework', {
		as: 'app'
	});

	this.mainCoffeeFile = 'console.log "\'Allo from CoffeeScript!"';

	this.on('end', function() {
		this.installDependencies({
			bower: true,
			npm: true,
			skipInstall: false,
			callback: function () {
				console.log('Everything is ready!');
			}
		});
	});

	this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(YawaGenerator, yeoman.generators.Base);

YawaGenerator.prototype.askFor = function askFor() {
	var cb = this.async();

	// welcome message
	if (!this.options['skip-welcome-message']) {
		console.log(this.yeoman);
		console.log('Out of the box I include HTML5 Boilerplate and jQuery');
	}

	var prompts = [{
		type: 'list',
		name: 'uiframework',
		message: 'Yo Homie! What framework you want?',
		choices: [ {
			name: 'Bootstrap',
			value: 'bootstrap'
		}, {
			name: 'None',
			value: false
		}]
	}, {
		type: 'checkbox',
		name: 'features',
		message: 'What more would you like?',
		choices: [{
			name: 'RequireJS',
			value: 'includeRequireJS',
			checked: false
		}, {
			name: 'Modernizr',
			value: 'includeModernizr',
			checked: false
		}, {
			name: 'Assemble',
			value: 'includeAssemble',
			checked: true
		}]
	}];

	this.prompt(prompts, function(answers) {
		var features = answers.features;
		var uiframework = answers.uiframework;

		function hasFeature(feat) {
			return features.indexOf(feat) !== -1;
		}

		// manually deal with the response, get back and store the results.
		// we change a bit this way of doing to automatically do this in the self.prompt() method.
		this.compassBootstrap = (uiframework === 'bootstrap');
		this.groundworkCSS = (uiframework === 'groundwork');
		this.includeRequireJS = hasFeature('includeRequireJS');
		this.includeModernizr = hasFeature('includeModernizr');
		this.includeAssemble = hasFeature('includeAssemble');

		cb();
	}.bind(this));
};

YawaGenerator.prototype.gruntfile = function gruntfile() {
	this.template('Gruntfile.js');
};

YawaGenerator.prototype.packageJSON = function packageJSON() {
	this.template('_package.json', 'package.json');
};

YawaGenerator.prototype.git = function git() {
	this.copy('gitignore', '.gitignore');
	this.copy('gitattributes', '.gitattributes');
};

YawaGenerator.prototype.bower = function bower() {
	this.copy('bowerrc', '.bowerrc');
	this.copy('_bower.json', 'bower.json');
};

YawaGenerator.prototype.jshint = function jshint() {
	this.copy('jshintrc', '.jshintrc');
};

YawaGenerator.prototype.editorConfig = function editorConfig() {
	this.copy('editorconfig', '.editorconfig');
};

YawaGenerator.prototype.h5bp = function h5bp() {
	this.copy('favicon.ico', 'app/favicon.ico');
	if (this.includeAssemble) {
		this.copy('404.hbs', 'app/templates/pages/404.hbs');
		// this.copy('layout.hbs', 'app/templates/layouts/default.hbs');
		// this.copy('index.hbs', 'app/templates/pages/index.hbs');
	} else {
		this.copy('404.html', 'app/404.html');
	}
	this.copy('robots.txt', 'app/robots.txt');
};

YawaGenerator.prototype.mainStylesheet = function mainStylesheet() {
	if (this.compassBootstrap) {
		this.copy('bootstrap.scss', 'app/styles/main.scss');
		this.copy('_helpers.scss', 'app/styles/_helpers.scss');
		this.copy('_textures.scss', 'app/styles/_textures.scss');
		this.copy('_vars.scss', 'app/styles/_vars.scss');

		this.copy('_flex.scss', 'app/styles/lib/_flex.scss');
		this.copy('_animations.scss', 'app/styles/lib/_animations.scss');
		this.copy('_placeholders.scss', 'app/styles/lib/_placeholders.scss');
		this.copy('_mixins.scss', 'app/styles/lib/_mixins.scss');

		this.copy('_broswehappy.scss', 'app/styles/components/_browsehappy.scss');
		this.copy('_styleguide.scss', 'app/styles/pages/_styleguide.scss');
		this.copy('_shame.scss', 'app/styles/_shame.scss');

		this.copy('styleguide.hbs', 'app/templates/pages/styleguide.hbs');
		this.copy('styleguide.js', 'app/scripts/styleguide.js');

	} else if (this.groundworkCSS) {
		this.copy('groundwork.scss', 'app/styles/main.scss');
		this.copy('groundwork_settings.scss', 'app/styles/_settings.scss');
		this.copy('groundwork_app.scss', 'app/styles/_app.scss');
	} else {
		this.copy('main.scss', 'app/styles/main.scss');
		this.copy('_helpers.scss', 'app/styles/_helpers.scss');
		this.copy('_textures.scss', 'app/styles/_textures.scss');

		this.copy('_flex.scss', 'app/styles/lib/_flex.scss');
		this.copy('_animations.scss', 'app/styles/lib/_animations.scss');
		this.copy('_placeholders.scss', 'app/styles/lib/_placeholders.scss');
		this.copy('_mixins.scss', 'app/styles/lib/_mixins.scss');

		this.copy('_broswehappy.scss', 'app/styles/components/_browsehappy.scss');
		this.copy('_styleguide.scss', 'app/styles/pages/_styleguide.scss');
		this.copy('_shame.scss', 'app/styles/_shame.scss');
		this.copy('styleguide.hbs', 'app/templates/pages/styleguide.hbs');
	}
};

YawaGenerator.prototype.writeIndex = function writeIndex() {
	if (this.includeAssemble) {
		this.layoutFile = this.readFileAsString(path.join(this.sourceRoot(), 'layout.hbs'));
		this.layoutFile = this.engine(this.layoutFile, this);

		this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.hbs'));
		this.indexFile = this.engine(this.indexFile, this);

		if (!this.includeRequireJS && !this.compassBootstrap) {

			//this.layoutFile = this.appendFiles({
			//	html: this.layoutFile,
			//	fileType: 'js',
			//	optimizedPath: 'scripts/coffee.js',
			//	sourceFileList: ['scripts/hello.js'],
			//	searchPath: '.tmp'
			//});

			// wire default
			this.layoutFile = this.appendScripts(this.layoutFile, 'scripts/main.js', [
				'scripts/styleguide.js',
				'scripts/main.js'
			]);
		}

		if (!this.includeRequireJS) {
			if (this.compassBootstrap) {
				// wire Bootstrap plugins
				this.layoutFile = this.appendScripts(this.layoutFile, 'scripts/plugins.js', [
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/affix.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/alert.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/dropdown.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/tooltip.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/modal.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/transition.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/button.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/popover.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/carousel.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/scrollspy.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/collapse.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/tab.js'
				]);
				// wire default
				this.layoutFile = this.appendScripts(this.layoutFile, 'scripts/main.js', [
					'scripts/styleguide.js',
					'scripts/main.js'
				]);

			} else if (this.groundworkCSS) {
				// wire Groundwork plugins
				this.layoutFile = this.appendScripts(this.layoutFile, 'scripts/plugins.js', [
					'bower_components/groundwork/js/plugins/jquery-placeholderText.js',
					'bower_components/groundwork/js/plugins/jquery-responsiveTables.js',
					'bower_components/groundwork/js/plugins/jquery-responsiveText.js',
					'bower_components/groundwork/js/plugins/jquery-truncateLines.js',
					'bower_components/groundwork/js/components/dismissible.js',
					'bower_components/groundwork/js/components/equalizeColumns.js',
					'bower_components/groundwork/js/components/forms.js',
					'bower_components/groundwork/js/components/menus.js',
					'bower_components/groundwork/js/components/tabs.js',
					'bower_components/groundwork/js/components/checklists.js',
					'bower_components/groundwork/js/components/navigation.js'
				]);
			}
		}
	} else {
		this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
		this.indexFile = this.engine(this.indexFile, this);

		if (!this.includeRequireJS) {
			this.layoutFile = this.appendScripts(this.layoutFile, 'scripts/main.js', [
				'scripts/styleguide.js',
				'scripts/main.js'
			]);

			//this.indexFile = this.appendFiles({
			//	html: this.indexFile,
			//	fileType: 'js',
			//	optimizedPath: 'scripts/coffee.js',
			//	sourceFileList: ['scripts/hello.js'],
			//	searchPath: '.tmp'
			//});
		}

		if (!this.includeRequireJS) {
			if (this.compassBootstrap) {
				// wire Bootstrap plugins
				this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/affix.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/alert.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/dropdown.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/tooltip.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/modal.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/transition.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/button.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/popover.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/carousel.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/scrollspy.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/collapse.js',
					'bower_components/bootstrap-sass/assets/javascripts/bootstrap/tab.js'
				]);
			} else if (this.groundworkCSS) {
				// wire Groundwork plugins
				this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
					'bower_components/groundwork/js/plugins/jquery-responsiveTables.js',
					'bower_components/groundwork/js/plugins/jquery-responsiveText.js',
					'bower_components/groundwork/js/plugins/jquery-tooltip.js',
					'bower_components/groundwork/js/plugins/jquery-truncateLines.js',
					'bower_components/groundwork/js/components/disabled.js',
					'bower_components/groundwork/js/components/dismissible.js',
					'bower_components/groundwork/js/components/equalizeColumns.js',
					'bower_components/groundwork/js/components/forms.js',
					'bower_components/groundwork/js/components/menus.js',
					'bower_components/groundwork/js/components/modals.js',
					'bower_components/groundwork/js/components/pagination.js',
					'bower_components/groundwork/js/components/tabs.js',
					'bower_components/groundwork/js/components/tiles.js',
					'bower_components/groundwork/js/components/tooltips.js'
				]);
			}
		}
	}
};

// TODO(mklabs): to be put in a subgenerator like rjs:app
YawaGenerator.prototype.requirejs = function requirejs() {
	if (!this.includeRequireJS) {
		return;
	}

	this.layoutFile = this.appendScripts(this.layoutFile, 'scripts/main.js', ['bower_components/requirejs/require.js'], {
		'data-main': 'scripts/main'
	});

	// add a basic amd module
	this.write('app/scripts/app.js', [
		'/*global define */',
		'define([], function () {',
		'    \'use strict\';\n',
		'    return \'\\\'Allo \\\'Allo!\';',
		'});'
	].join('\n'));

	this.template('require_main.js', 'app/scripts/main.js');
};

YawaGenerator.prototype.app = function app() {
	this.mkdir('app');
	this.mkdir('app/scripts');
	this.mkdir('app/styles');
	this.mkdir('app/styles/components');
	this.mkdir('app/styles/objects');
	this.mkdir('app/images');
	this.mkdir('app/fonts');
	if (this.includeAssemble) {
		this.mkdir('app/templates');
		this.mkdir('app/templates/pages');
		this.mkdir('app/templates/layouts');
		this.mkdir('app/templates/partials');
		this.write('app/templates/layouts/default.hbs', this.layoutFile);
		this.write('app/templates/pages/index.hbs', this.indexFile);
	} else {
		this.write('app/index.html', this.indexFile);
	}
	this.write('app/scripts/hello.coffee', this.mainCoffeeFile);
	if (!this.includeRequireJS) {
		this.write('app/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
	}
};
