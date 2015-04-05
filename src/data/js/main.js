// Copyright 2013 LastLeaf, MIT LICENSE
'use strict';

// consts

var FPS = 32;
var WIDTH = 960;
var HEIGHT = 540;
var USE_ADVANCED_LOADING = false;
var STORAGE_ID = 'tomorrow';
var STORAGE_VERSION = VERSION;
var DEFAULT_SETTINGS = {
	version: STORAGE_VERSION,
	musicOn: true,
	volume: 100,
	curLevel: 0,
	levelReached: 0,
	difficulty: 1,
	langs: ''
};

// global vars

window.game = {};
game.settings = null;
game.stage = null;
game.curMusic = -1;
game.focused = true;
var initResource = null;

// global funcs

game.saveSettings = function(){
	localStorage[STORAGE_ID] = JSON.stringify(game.settings);
};

game.createTextButton = function(text, fontSize, background, centerX, centerY, clickFunc){
	var button = new createjs.Container();
	var t1 = new createjs.Text(text, fontSize+'px'+game.lang.titleFont, '#888');
	var t2 = new createjs.Text(text, fontSize+'px'+game.lang.titleFont, '#00d2ff');
	var bg = new createjs.Shape();
	var width = t1.getMeasuredWidth() + 5;
	var height = t1.getMeasuredHeight() + 5;
	bg.graphics.s(background).f(background).r(-width/2, -height/2, width, height);
	button.addChild(bg, t1, t2);
	t1.lineHeight = height;
	t2.lineHeight = height;
	t1.textAlign = 'center';
	t2.textAlign = 'center';
	t1.textBaseline = 'middle';
	t2.textBaseline = 'middle';
	t2.visible = false;
	button.x = centerX;
	button.y = centerY;
	button.addEventListener('mouseover', function(){
		t2.visible = true;
		t1.visible = false;
	});
	button.addEventListener('mouseout', function(){
		t1.visible = true;
		t2.visible = false;
	});
	button.addEventListener('click', clickFunc);
	return button;
};

// show cover

game.showCover = function(){
	var res = initResource;

	//init
	createjs.Ticker.setFPS(FPS);
	game.stage.enableMouseOver(FPS);

	// show author logo
	var bottomBar = new createjs.Container();
	bottomBar.x = WIDTH/2;
	bottomBar.y = HEIGHT-30;
	game.stage.addChild(bottomBar);
	var lastleafLink = new createjs.Container();
	var bg = new createjs.Shape();
	bg.graphics.s('black').f('black').r(-5,-5,154,58);
	lastleafLink.addChild(bg,
		new createjs.Bitmap(res.getResult('lastleaf_grey')),
		new createjs.Bitmap(res.getResult('lastleaf'))
	);
	lastleafLink.getChildAt(1).alpha = 0.8;
	lastleafLink.getChildAt(2).visible = false;
	lastleafLink.x = 280;
	lastleafLink.y = -15;
	lastleafLink.scaleX = 0.6;
	lastleafLink.scaleY = 0.6;
	lastleafLink.addEventListener('mouseover', function(){
		lastleafLink.getChildAt(2).visible = true;
		lastleafLink.getChildAt(1).visible = false;
	});
	lastleafLink.addEventListener('mouseout', function(){
		lastleafLink.getChildAt(1).visible = true;
		lastleafLink.getChildAt(2).visible = false;
	});
	lastleafLink.addEventListener('click', function(){
		if(location.protocol !== 'resource:')
			window.open('http://lastleaf.me/');
	});
	bottomBar.addChild(lastleafLink);

	// show license link
	var licenseLink = game.createTextButton(game.str[3], 18, '#000', -320, 0, function(){
		if(location.protocol !== 'resource:')
			window.open('license_'+game.settings.lang+'.html');
		else
			location.href = 'license_'+game.settings.lang+'.html?showback';
	});
	bottomBar.addChild(licenseLink);

	// show about link
	var aboutLink = game.createTextButton('CREDIT', 18, '#000', -200, 0, function(){
		if(location.protocol !== 'resource:')
			window.open('change_logs.html');
		else
			location.href = 'change_logs.html?showback';
	});
	bottomBar.addChild(aboutLink);

	// show subtitle
	var subtitle = game.createTextButton(game.str[4], 18, '#000', 160, 0, function(){
		if(location.protocol !== 'resource:')
			window.open('http://github.com/LastLeaf/Tomorrow');
	});
	bottomBar.addChild(subtitle);

	// show title
	if(game.settings.lang === 'zh-CN')
		document.title = '明天 | LastLeaf';
	else
		document.title = 'Tomorrow | LastLeaf';
	var titleImg = new createjs.Bitmap(res.getResult('title'));
	game.stage.addChild(titleImg);
	titleImg.x = titleImg.cx = (WIDTH - titleImg.image.width) / 2;
	titleImg.y = titleImg.cy = 40;
	titleImg.alpha = 0.8;

	// show progress bar
	var progressBar = new createjs.Container();
	var p = new createjs.Shape();
	p.graphics.f('#222').r(0, 0, 800, 3);
	var progressShape = new createjs.Shape();
	var progress = progressShape.graphics;
	progress.f('#888').r(0, 0, 0, 3);
	var progressText = new createjs.Text(game.str[5], '20px'+game.lang.titleFont, '#888');
	progressText.textAlign = 'center';
	progressText.textBaseline = 'middle';
	progressText.x = 400;
	progressText.y = 53;
	progressBar.addChild(
		p,
		progressShape,
		progressText
	);
	game.stage.addChild(progressBar);
	progressBar.textAlign = 'center';
	progressBar.x = (WIDTH-800) / 2;
	progressBar.y = 277;
	progressBar.isAlphaUp = false;

	// animation
	var centeredMoving = function(cur, center, radius, acc){
		var dest = (Math.random()-0.5)*radius*2 + center;
		return (dest-cur)*acc + cur;
	};
	var titleAniCanPause = false;
	var titleAni = function(){
		titleImg.x = centeredMoving(titleImg.x, titleImg.cx, 8, 0.06);
		titleImg.y = centeredMoving(titleImg.y, titleImg.cy, 8, 0.06);
		titleImg.alpha = centeredMoving(titleImg.alpha, 0.75, 0.25, 0.25);
		if(progressBar.isAlphaUp) {
			progressBar.alpha += 0.02;
			if(progressBar.alpha >= 1) progressBar.isAlphaUp = false;
		} else {
			progressBar.alpha -= 0.02;
			if(progressBar.alpha <= 0.5) progressBar.isAlphaUp = true;
		}
		if(game.focused || !titleAniCanPause) {
			game.stage.update();
			if(game.mainResource) titleAniCanPause = true;
			else titleAniCanPause = false;
		}
	};
	createjs.Ticker.addEventListener('tick', titleAni);

	// loaded
	var resourceLoaded = function(e){
		var q = game.mainResource = e.target;
		progress.c().f('#888').r(0, 0, 800, 3);
		// update title for language changing
		if(game.settings.lang === 'zh-CN')
			document.title = '明天 | LastLeaf';
		else
			document.title = 'Tomorrow | LastLeaf';
		titleImg.image = q.getResult('tomorrow');
		// get results
		if(location.protocol !== 'file:' && location.protocol !== 'resource:') {
			game.maps = q.getResult('maps').split('\n');
			game.words = q.getResult('words');
			game.ctrl = q.getResult('ctrl');
		}
		// show language link
		var switchLang = function(newLang){
			game.settings.lang = newLang;
			game.saveSettings();
			game.lang = game.langs[newLang];
			game.str = game.lang.str;
			createjs.Ticker.removeAllEventListeners('tick');
			window.removeEventListener('keyup', coverKeyFunc);
			game.stage.removeAllChildren();
			game.mainResource = null;
			game.showCover();
		};
		if(game.settings.lang === 'zh-CN')
			var langLink = game.createTextButton('English', 20, '#000', WIDTH/2, 450, function(){
				switchLang('en');
			});
		else
			var langLink = game.createTextButton('简体中文', 20, '#000', WIDTH/2, 450, function(){
				switchLang('zh-CN');
			});
		// show difficulty button
		var difficultyButton = [
			game.createTextButton(game.str[6], 20, '#000', WIDTH/2, 410, function(){
				difficultyButton[0].visible = false;
				difficultyButton[1].visible = true;
				game.settings.difficulty = 1;
				difficultyButton[1].dispatchEvent('mouseover');
			}),
			game.createTextButton(game.str[7], 20, '#000', WIDTH/2, 410, function(){
				difficultyButton[1].visible = false;
				difficultyButton[2].visible = true;
				game.settings.difficulty = 2;
				difficultyButton[2].dispatchEvent('mouseover');
			}),
			game.createTextButton(game.str[8], 20, '#000', WIDTH/2, 410, function(){
				difficultyButton[2].visible = false;
				difficultyButton[3].visible = true;
				game.settings.difficulty = 3;
				difficultyButton[3].dispatchEvent('mouseover');
			}),
			game.createTextButton(game.str[9], 20, '#000', WIDTH/2, 410, function(){
				difficultyButton[3].visible = false;
				difficultyButton[0].visible = true;
				game.settings.difficulty = 0;
				difficultyButton[0].dispatchEvent('mouseover');
			})
		];
		difficultyButton[0].addEventListener('mouseover', function(){
			hint.show(game.str[10], 3000);
		});
		difficultyButton[1].addEventListener('mouseover', function(){
			hint.show(game.str[11], 3000);
		});
		difficultyButton[2].addEventListener('mouseover', function(){
			hint.show(game.str[12], 3000);
		});
		difficultyButton[3].addEventListener('mouseover', function(){
			hint.show(game.str[13], 3000);
		});
		difficultyButton[0].set({visible: false}).addEventListener('mouseout', hint.hide);
		difficultyButton[1].set({visible: false}).addEventListener('mouseout', hint.hide);
		difficultyButton[2].set({visible: false}).addEventListener('mouseout', hint.hide);
		difficultyButton[3].set({visible: false}).addEventListener('mouseout', hint.hide);
		difficultyButton[game.settings.difficulty].visible = true;
		// show music button
		var musicButtonOn = game.createTextButton(game.str[14], 20, '#000', WIDTH/2, 370, function(){
			musicButtonOn.visible = false;
			musicButtonOff.visible = true;
			game.settings.musicOn = false;
			musicButtonOff.dispatchEvent('mouseover');
		});
		var musicButtonOff = game.createTextButton(game.str[15], 20, '#000', WIDTH/2, 370, function(){
			musicButtonOff.visible = false;
			musicButtonOn.visible = true;
			game.settings.musicOn = true;
			musicButtonOn.dispatchEvent('mouseover');
		});
		var musicHint = function(){
			hint.show(game.str[16], 3000);
		};
		musicButtonOn.addEventListener('mouseover', musicHint);
		musicButtonOff.addEventListener('mouseover', musicHint);
		musicButtonOn.addEventListener('mouseout', hint.hide);
		musicButtonOff.addEventListener('mouseout', hint.hide);
		if(game.settings.musicOn) {
			musicButtonOff.visible = false;
			musicButtonOn.visible = true;
		} else {
			musicButtonOn.visible = false;
			musicButtonOff.visible = true;
		}
		// show start button
		if(game.settings.curLevel)
			var t = game.str[17];
		else
			var t = game.str[18];
		var startButton = game.createTextButton(t, 20, '#000', WIDTH/2, 330, function(){
			// save settings
			game.saveSettings();
			// remove key bindings
			window.removeEventListener('keyup', coverKeyFunc);
			// fade-out everything
			var b = new createjs.Shape();
			b.graphics.f('black').r(0,0,WIDTH,HEIGHT);
			b.alpha = 0.005;
			game.stage.addChild(b);
			createjs.Ticker.addEventListener('tick', function(){
				if(b.alpha >= 1) {
					createjs.Ticker.removeAllEventListeners('tick');
					game.stage.removeAllChildren();
					game.stage.update();
					hint.hide();
					game.start();
				}
				b.alpha += 0.1;
			});
		});
		startButton.addEventListener('mouseover', function(){
			if(game.settings.curLevel)
				hint.show(game.str[19].replace('%1', game.settings.curLevel), 3000);
			else
				hint.show(game.str[20], 3000);
		});
		startButton.addEventListener('mouseout', function(){
			hint.hide();
		});
		// button animation
		langLink.alpha = 0;
		difficultyButton[0].alpha = 0;
		difficultyButton[1].alpha = 0;
		difficultyButton[2].alpha = 0;
		difficultyButton[3].alpha = 0;
		musicButtonOn.alpha = 0;
		musicButtonOff.alpha = 0;
		startButton.alpha = 0;
		progressBar.removeChild(progressText);
		game.stage.addChild(
			langLink,
			difficultyButton[0],
			difficultyButton[1],
			difficultyButton[2],
			difficultyButton[3],
			musicButtonOn,
			musicButtonOff,
			startButton
		);
		createjs.Ticker.addEventListener('tick', function(){
			if(musicButtonOn.alpha >= 1) return;
			langLink.alpha += 0.1;
			difficultyButton[0].alpha += 0.1;
			difficultyButton[1].alpha += 0.1;
			difficultyButton[2].alpha += 0.1;
			difficultyButton[3].alpha += 0.1;
			musicButtonOn.alpha += 0.1;
			musicButtonOff.alpha += 0.1;
			startButton.alpha += 0.1;
		});
		// keyboard control
		var coverKeyFunc = function(e){
			if(e.keyCode === 32) {
				startButton.dispatchEvent('mouseover');
				startButton.dispatchEvent('click');
			} else if(e.keyCode === 77) {
				if(musicButtonOn.visible) {
					musicButtonOn.dispatchEvent('click');
				} else {
					musicButtonOff.dispatchEvent('click');
				}
			} else if(e.keyCode === 188) {
				if(game.settings.volume > 0)
					game.settings.volume -= 10;
				hint.show(game.str[22]+game.settings.volume, 1000);
			} else if(e.keyCode === 190) {
				if(game.settings.volume < 100)
					game.settings.volume += 10;
				hint.show(game.str[22]+game.settings.volume, 1000);
			} else if(e.keyCode === 82) {
				if(confirm(game.str[21])) {
					delete localStorage[STORAGE_ID];
					game.settings = DEFAULT_SETTINGS;
					game.stage.removeAllChildren();
					createjs.Ticker.removeAllEventListeners('tick');
					window.removeEventListener('keyup', coverKeyFunc);
					game.showCover();
				}
			} else
				return;
			e.preventDefault();
		};
		window.addEventListener('keyup', coverKeyFunc);
	};

	// start load main resource if needed
	if(game.mainResource) {
		resourceLoaded({target: game.mainResource});
	} else {
		var q =  new createjs.LoadQueue(USE_ADVANCED_LOADING, 'data/');
		q.installPlugin(createjs.Sound);
		q.addEventListener('progress', function(e){
			progress.c().f('#888').r(0, 0, e.progress*800, 3);
		});
		q.addEventListener('complete', resourceLoaded);
		if(location.protocol !== 'file:' && location.protocol !== 'resource:') {
			// advanced loading
			q.loadManifest([
				{id:'maps', type:'text', src:'maps.data?v='+VERSION},
				{id:'ctrl', src:'ctrl.json?v='+VERSION},
				{id:'words', src:'words_'+game.settings.lang+'.json?v='+VERSION},
				{id:'bgm1', src:'audio/the_start_of_night.ogg|audio/the_start_of_night.mp3'},
				{id:'bgm2', src:'audio/lighted_stories.ogg|audio/lighted_stories.mp3'},
				{id:'bgm3', src:'audio/tomorrow.ogg|audio/tomorrow.mp3'},
				{id:'bgm4', src:'audio/spreading_white.ogg|audio/spreading_white.mp3'},
				{id:'bgm5', src:'audio/lighted_stories_strings.ogg|audio/lighted_stories_strings.mp3'},
				{id:'bgm0', src:'audio/tomorrow_short.ogg|audio/tomorrow_short.mp3'},
				{id:'tomorrow', src:'image/title_'+game.settings.lang+'.png'},
				{id:'img6', src:'image/6.png'},
				{id:'img7', src:'image/7.png'},
				{id:'img8', src:'image/8.png'},
				{id:'img9', src:'image/9.png'},
				{id:'img10', src:'image/10.png'},
				{id:'img22', src:'image/22.png'},
				{src:'js/levels.js?v='+VERSION}
			]);
		} else {
			// load text data through xhr
			var xhr1 = new XMLHttpRequest();
			xhr1.addEventListener('load', function(){
				game.maps = xhr1.response.split('\n');
			}, false);
			xhr1.open('GET', 'data/maps.data', false);
			xhr1.overrideMimeType('text/plain; charset=utf8');
			xhr1.send();
			var xhr2 = new XMLHttpRequest();
			xhr2.addEventListener('load', function(){
				game.words = JSON.parse(xhr2.response);
			}, false);
			xhr2.open('GET', 'data/words_'+game.settings.lang+'.json', false);
			xhr2.overrideMimeType('text/plain; charset=utf8');
			xhr2.send();
			var xhr3 = new XMLHttpRequest();
			xhr3.addEventListener('load', function(){
				game.ctrl = JSON.parse(xhr3.response);
			}, false);
			xhr3.open('GET', 'data/ctrl.json', false);
			xhr3.overrideMimeType('text/plain; charset=utf8');
			xhr3.send();
			// load else
			q.loadManifest([
				{id:'bgm1', src:'audio/the_start_of_night.ogg|audio/the_start_of_night.mp3'},
				{id:'bgm2', src:'audio/lighted_stories.ogg|audio/lighted_stories.mp3'},
				{id:'bgm3', src:'audio/tomorrow.ogg|audio/tomorrow.mp3'},
				{id:'bgm4', src:'audio/spreading_white.ogg|audio/spreading_white.mp3'},
				{id:'bgm5', src:'audio/lighted_stories_strings.ogg|audio/lighted_stories_strings.mp3'},
				{id:'bgm0', src:'audio/tomorrow_short.ogg|audio/tomorrow_short.mp3'},
				{id:'tomorrow', src:'image/title_'+game.settings.lang+'.png'},
				{id:'img6', src:'image/6.png'},
				{id:'img7', src:'image/7.png'},
				{id:'img8', src:'image/8.png'},
				{id:'img9', src:'image/9.png'},
				{id:'img10', src:'image/10.png'},
				{id:'img22', src:'image/22.png'},
				{src:'js/levels.js'}
			]);
		}
	}

};

// wrapper resize

var startResizeWrapper = function(){
	var wrapper = document.getElementById('wrapper');
	var mainCanvas = document.getElementById('main_canvas');
	var resizeWrapper = function(){
		wrapper.style.height = document.documentElement.clientHeight + 'px';
		var r = 1;
		if(document.documentElement.clientHeight < HEIGHT)
			var r = document.documentElement.clientHeight / HEIGHT;
		if(document.documentElement.clientWidth < WIDTH) {
			var t = document.documentElement.clientWidth / WIDTH;
			if(r > t) r = t;
		}
		if(r >= 1) {
			mainCanvas.style.width = WIDTH + 'px';
			mainCanvas.style.height = HEIGHT + 'px';
		} else {
			mainCanvas.style.width = Math.round(WIDTH*r) + 'px';
			mainCanvas.style.height = Math.round(HEIGHT*r) + 'px';
		}
	};
	window.onresize = resizeWrapper;
	resizeWrapper();
};

// start function

document.bindReady(function(){

	// read settings
	try {
		game.settings = JSON.parse(localStorage[STORAGE_ID]);
		if(game.settings.version !== STORAGE_VERSION) {
			// update settings
			for(var k in DEFAULT_SETTINGS)
				if(typeof(game.settings[k]) === 'undefined')
					game.settings[k] = DEFAULT_SETTINGS[k];
			game.settings.version = STORAGE_VERSION;
			game.saveSettings();
		}
	} catch(e) {
		game.settings = DEFAULT_SETTINGS;
	}

	// determine langs
	if(!game.settings.lang) {
		if(navigator.language === 'zh-CN' || navigator.userLanguage === 'zh-CN')
			game.settings.lang = 'zh-CN';
		else
			game.settings.lang = 'en';
	}
	game.lang = game.langs[game.settings.lang];
	game.str = game.lang.str;

	// check compatibility
	hint.show(game.str[0]);
	if(!HTML5Compatibility.supportAll()) {
		hint.showLink(game.str[1], GAME_HOME_PAGE[game.settings.lang]);
		return;
	}
	try {
		game.saveSettings();
		var t = JSON.parse(localStorage[STORAGE_ID]);
	} catch(e) {
		hint.showLink(game.str[27], location.href);
		return;
	}

	// window focus status
	window.addEventListener('focus', function(){
		game.focused = true;
	}, false);
	window.addEventListener('blur', function(){
		game.focused = false;
	}, false);

	// init canvas
	document.getElementById('wrapper').innerHTML = '<canvas id="main_canvas" width="'+WIDTH+'" height="'+HEIGHT+'"></canvas>';
	startResizeWrapper();
	game.stage = new createjs.Stage('main_canvas');
	createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);

	// load title resource
	hint.show(game.str[2]);
	var q = new createjs.LoadQueue(USE_ADVANCED_LOADING, 'data/');
	q.addEventListener('complete', function(){
		hint.hide();
		initResource = q;
		game.showCover();
	});
	q.loadManifest([
		{id:'title', src:'image/title_'+game.settings.lang+'.png'},
		{id:'lastleaf', src:'image/lastleaf.png'},
		{id:'lastleaf_grey', src:'image/lastleaf_grey.png'}
	]);

});
