console.log("hello, follow me on twitter @MichaelCanlas7 https://twitter.com/michaelcanlas7");

/*

	PLEASE EXCUSE THIS CODE VOMIT.... THANKS :)

 */

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game'), 
	music,
	kraken,
	background,
	cherries,
	bomb,
	changes,
	bugs,
	lives,
	lives_text,
	bomb_text,
	fireButton,
	explosions,
	bombs,
	scoreText,
	life_count = 3,
	initialLife = 3,
	cherryLimit = 10,
	commandLimit = 30,
	cherryStart = 0,
	commandStart = 0,
	playersCherries = 0,
	playersCommand = 0,
	bombLimit = 5, // only 5 on the stage allowed
	playersBombs = 0,
	commandFill = 20,
	cherryFill = 1,
	font = { font: '34px Arial', fill: '#fff' },
	score = 0,
	scoreString = "Score : ",
	bombString = "Bombs : ";

// different states
game.state.add("start", { preload: start_preload, create: create_preload, update: update_preload });
game.state.add("game", { preload: preload, create: create, update: update });
game.state.start("start");

function start_preload() {
	game.load.image("kraken_big", "/assets/kraken/pixelKrakenBig.png");
}
function create_preload() {
	this.add.button(0,0, "kraken_big", function() {
		this.state.start("game");	
	}, this);
	var git_kraken = game.add.text(game.camera.width / 2, game.camera.height / 2, "GIT KRAKEN", font);
	var game_start = game.add.text(game.camera.width / 2, game.camera.height / 2, "-- click to start --", font);
    game_start.anchor.setTo(0.5, 0.5);
    git_kraken.anchor.setTo(0.5, 1.5);
    game_start.fixedToCamera = true;
    git_kraken.fixedToCamera = true;
}
function update_preload() {}

function preload() {
	game.load.image("kraken", "/assets/kraken/miniK.png");
	game.load.image("background", "/assets/kraken/background.jpg");
	// game.load.image("bomb", "/assets/kraken/bomb.png");
	game.load.image("bomb", "/assets/kraken/bomb1.png");
	// game.load.image("bomb", "/assets/kraken/bomb2.png");
	game.load.image("bug", "/assets/kraken/bug.png");
	game.load.image("cherry", "/assets/kraken/cherry.png");
	game.load.image("code", "/assets/kraken/code.png");
	game.load.image("add", "/assets/kraken/add.png");
	game.load.image("delete", "/assets/kraken/delete.png");
	game.load.image("changes", "/assets/kraken/changes.png");
	game.load.image("push", "/assets/kraken/push.png");
	game.load.spritesheet('kaboom', '/assets/kraken/explode.png', 128, 128);

	game.load.audio("music", "/assets/kraken/song.mp3");
	game.load.audio("music1", "/assets/kraken/song1.mp3");
}

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	game.world.setBounds(0, 0, 1920, 1200);
	music = game.add.audio("music1");
	music.loop = true;
	music.play();

	background = game.add.sprite(0,0, "code");
	background.width = 1920;
	background.height = 1200;

    //  Lives
    lives = game.add.group();
    lives_text = game.add.text( 690, 10, 'Lives : ', font);
    lives_text.fixedToCamera = true;
    lives_text.cameraOffset.setTo( 690, 10);

    // score text
	scoreText = game.add.text(10, 10, scoreString + score, font);
	scoreText.fixedToCamera = true;
    scoreText.cameraOffset.setTo( 10, 10);

    // bombs
    bomb_text = game.add.text( 300, 10, bombString + playersCherries, font);
	bomb_text.fixedToCamera = true;
    bomb_text.cameraOffset.setTo( 300, 10);



	bugs = game.add.physicsGroup();
	bugs.enableBody = true;

	commands = game.add.physicsGroup();
	commands.enableBody = true;

	cherries = game.add.physicsGroup();
	cherries.enableBody = true;

	bombs = game.add.physicsGroup();
	bombs.enableBody = true;

	explosions = game.add.group();

	setInterval(function(){
		createBugs(2);
	}, 4000);

	setInterval(function() {
		createCherries();
	}, 500);

	setInterval(function() {
		createCommands();
	}, 200);

	kraken = game.add.sprite(game.world.centerX, game.world.centerX, 'kraken');

	game.camera.follow(kraken);

	game.physics.arcade.enable(kraken);
	kraken.body.collideWorldBounds = true;

	cursors = game.input.keyboard.createCursorKeys();

	fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	detonateBomb = game.input.keyboard.addKey(Phaser.Keyboard.D);


	fireButton.onDown.add(function(){

		if ( playersCherries >= cherryFill && playersBombs !== bombLimit ) {
			createBomb();
		}

	}, this);

    for (var i = 0; i < initialLife; i++) {

        var kraken_life = lives.create( 0, 60, 'kraken');

	    kraken_life.fixedToCamera = true;
	    kraken_life.cameraOffset.setTo( 700 + (30 * i), 70 );
        kraken_life.anchor.setTo(0.5, 0.5);
        kraken_life.angle = 90;
        kraken_life.alpha = 0.4;
    }

}

function update() {

    kraken.body.velocity.x = 0;
    kraken.body.velocity.y = 0;

    if (cursors.left.isDown) {
        kraken.body.velocity.x = -300;
    } else if (cursors.right.isDown) {
        kraken.body.velocity.x = 300;
    }

    if (cursors.up.isDown) {
        kraken.body.velocity.y = -300;
    } else if (cursors.down.isDown) {
        kraken.body.velocity.y = 300;
    }

	bugs.children.forEach(function(item){
		game.physics.arcade.moveToObject(item, kraken.body, 150);
		game.physics.arcade.collide(item, kraken, collisionHandler, null, this);
	}, game.physics.arcade, false, 200);


	detonateBomb.onDown.add(function() {
		bombs.children.forEach(function(bomb) {
			explodeBomb(bomb, bugs.children);
		});
	}, this);

	cherries.children.forEach(function(item) {
		game.physics.arcade.overlap(item, kraken, function(){
			foodCollision(item);
		}, null, this);
	});

	commands.children.forEach(function(item) {
		game.physics.arcade.overlap(item, kraken, function(){
			commandCollision(item);
		}, null, this);
	});



	game.physics.arcade.collide(bugs);

}

// lol
function createBugs(count) {

	for ( var i = 0; i < count; i++ ) {
    	var bug = bugs.create(game.world.randomX, game.world.randomY,'bug');
	}

}

function createCherries() {

	if ( cherryStart === cherryLimit ) { return; }

	var cherry = cherries.create(game.world.randomX, game.world.randomY, 'cherry');
	game.physics.arcade.enable(cherry);
	cherryStart += 1;

}

function createBomb() {

	if ( playersBombs === bombLimit ) { return; }
	var bomb = bombs.create(kraken.body.x, kraken.body.y, "bomb");
	game.physics.arcade.enable(bomb);
	playersBombs += 1;

	playersCherries -= 1;
	bomb_text.text = bombString + playersCherries;

}


function createCommands() {

	if ( commandLimit === commandStart ) { return; }

	var randomCommand = ["add", "push", "delete", "changes"];
	var item = randomCommand[Math.floor(Math.random()*randomCommand.length)];

	var command = commands.create(game.world.randomX, game.world.randomY, item);

	game.physics.arcade.enable(command);
	commandStart += 1;

}

function commandCollision(command) {
	command.kill();
	commandStart -= 1;
	playersCommand += 1;
	score += 5;
	scoreText.text = scoreString + score;

}

function foodCollision(cherry) {
	cherry.kill();
	cherryStart -= 1;
	playersCherries += 1;
	bomb_text.text = bombString + playersCherries;

}

function collisionHandler() {
	var life = lives.getFirstAlive(),
		gameOverText = " GAME OVER \n Looks like bugs got into the master branch :( \n Click to revert changes ",
		gameOver;

	if ( life ) {
		life.kill();
		life_count -= 1;
		kraken.body.x = game.world.centerX;
		kraken.body.y =  game.world.centerY;
		bugs.children.forEach(function(item){
			item.kill();
		}, game.physics.arcade, false, 200);
	}

	if ( life_count === 0 ) {
	    gameOver = game.add.text( game.camera.width / 2, game.camera.height / 2, gameOverText, font);
	    gameOver.anchor.setTo(0.5, 0.5);
	    gameOver.fixedToCamera = true;

		life.kill();
	    kraken.kill();
	    music.stop();

	    game.input.onTap.addOnce(function(){
	    	restart(gameOver);
	    }, this);
	}
}

function explodeBomb(bomb, bugs) {

	if ( bomb.body === null ) { return; }

	var explode = game.add.sprite(bomb.body.x - 33, bomb.body.y - 33, 'kaboom');
	var boom = explode.animations.add("boom")

	explode.animations.play("boom", 30, false);
	game.physics.arcade.enable(explode);

	bugs.forEach(function(item){
		var kill = checkOverlap(bomb, item);
		if ( kill ) {
			score += 10;
			scoreText.text = scoreString + score;
			item.destroy();
		}
	});

	bomb.destroy();
	playersBombs -= 1;

	setTimeout(function() {
		explode.destroy();
	}, 200);

}

function checkOverlap(spriteA, spriteB) {

    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);

}

function seniorDevMode(bugs) {
	console.log("HAVE TO DO");
}

function restart(gameOver) {

	//  A new level starts

	//resets the life count
	lives.callAll('revive');

	//  And brings the aliens back from the dead :)
	bugs.removeAll();

	//revives the player
	kraken.revive();

	score = 0;
	life_count = 3;
	scoreText.text = scoreString + score;
	music.play();

	//hides the text
	game.world.remove(gameOver);

}