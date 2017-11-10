
BasicGame.Game = function (game) {

	//	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game = game;	//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
    this.player = new BasicGame.Player(this.game, 100, 100, 5);
    
    this.monsterEnemies = [];
    
    this.enemiesAlive = 0;
    
    this.spawnCounter = 0;
    this.maxSpawnCounter = 0;
};

BasicGame.Game.prototype = {

    create: function () {

        //	Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!            
        this.game.world.setBounds(0, 0, 2000, 2000);
        this.ground = this.game.add.tileSprite(0, 0, 800, 600, 'groundConcrete');
        this.ground.fixedToCamera = true;
        
        this.physics.startSystem(Phaser.Physics.ARCADE);
        
        this.player.create();
        
        // ENEMY CREATION
        this.monsterAntSpawner = this.game.rnd.integerInRange(10, 50);
        this.monsterScorpionSpawner = this.game.rnd.integerInRange(4, 10);
        this.monsterSpiderSpawner = this.game.rnd.integerInRange(7, 15);
        this.monsterTurretSpawner = this.game.rnd.integerInRange(5, 10);
        this.monsterBossSpawner = this.game.rnd.integerInRange(1, 1);
        // Enemies need these variables: game, enemyType, additionalPart (can be null),
        // player, health, name, projectiles (can be null), damage, speed
        // NOTE: enemySpawner function needs array to hold the enemies
        //  and the number of spawns. Name is already given in the function.
        this.enemySpawner(this.monsterEnemies, this.monsterAntSpawner, this.game, 
            'monsterAnt', null, this.player, 1, null, 0.5, 200);
        this.enemySpawner(this.monsterEnemies, this.monsterScorpionSpawner, this.game, 
            'monsterScorpion', null, this.player, 10, null, 1.5, 100);
        this.enemySpawner(this.monsterEnemies, this.monsterSpiderSpawner, this.game, 
            'monsterSpider', null, this.player, 3, null, 1.5, 150);
        /* Turret and Boss spawning not working correctly
        this.enemySpawner(this.monsterEnemies, this.monsterTurretSpawner, this.game, 
            'turretBase', 'turretGun', this.player, 20, 'turretBullet', 1, 0);
        this.enemySpawner(this.monsterEnemies, this.monsterBossSpawner, this.game,
            'monsterBoss_HeadPortion', 'monsterBoss_BodyPortion', this.player, 1, null, 3, 50);
        */
        // ENEMY CREATION ENDS HERE
        
        this.healthText = this.game.add.text(8, 545, 'Health: ' + this.player.sprite.health, 
            {fontSize: '20px', fill: '#000'});
        this.healthText.fixedToCamera = true;
        this.healthText.cameraOffset.setTo(8, 545);        
        
        this.fireModeText = this.game.add.text(8, 570, 'Firemode: ' + this.player.fireModeName, 
            {fontSize: '20px', fill: '#000'});
        this.fireModeText.fixedToCamera = true;
        this.fireModeText.cameraOffset.setTo(8, 570);        
        
        this.game.camera.follow(this.player.sprite);
        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 300, 100);
        this.game.camera.focusOnXY(0, 0);
    },
    
    enemySpawner: function (enemies, enemySpawns, game, enemyType, additionalPart,
         player, health, projectiles, damage, speed) {
        
        this.maxSpawnCounter += enemySpawns;
        for(this.spawnCounter; this.spawnCounter < this.maxSpawnCounter; this.spawnCounter++) {
            
            enemies.push(new BasicGame.Enemy(game, enemyType, additionalPart, 
                player, health, this.spawnCounter, projectiles, damage, speed));
            enemies[this.spawnCounter].create();
        }
    },
    
    update: function () {

        //	Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        this.player.update();
        
        this.enemiesAlive = 0;
        
        for(var i = 0; i < this.monsterEnemies.length; i++) {
            
            if(this.monsterEnemies[i].alive) {
                
                this.enemiesAlive++;
                this.game.physics.arcade.collide(this.player.sprite, 
                    this.monsterEnemies[i].sprite);
                this.game.physics.arcade.overlap(this.player.sprite, 
                    this.monsterEnemies[i].sprite, this.enemyHitPlayer, null, this);
                this.game.physics.arcade.overlap(this.player.bullets, 
                    this.monsterEnemies[i].sprite, this.playerHitEnemy, null, this);
                this.monsterEnemies[i].update();
            }
        }
        
        this.fireModeText.text = 'Firemode: ' + this.player.fireModeName;
        
        this.ground.tilePosition.x = -this.game.camera.x;
        this.ground.tilePosition.y = -this.game.camera.y;
        
        this.escKey = this.game.input.keyboard.addKey(Phaser.KeyCode.ESC);
        this.escKey.onDown.add(this.pauseGame, this);
        
        if(!this.player.alive && this.input.activePointer.isDown) {
                this.quitGame();
            }
        
        if(this.enemiesAlive === 0) {
            this.gameoverText = this.game.add.text(50, 200, 'Congratulations! \n All enemies killed! \n Click to quit', 
            {fontSize: '70px', fill: '#000'});
            this.gameoverText.fixedToCamera = true;
            this.gameoverText.cameraOffset.setTo(210, 200);
            
            if(this.input.activePointer.isDown) {
                this.quitGame();
            }
        }
    },
    
    enemyHitPlayer: function (player, enemy) {
        
        player.damage(this.monsterEnemies[enemy.name].damage);
        this.healthText.text = 'Health: ' + Math.floor(this.player.sprite.health);
        
        if(player.health <= 0) {
            
            this.player.alive = false;
            
            this.gameoverText = this.game.add.text(210, 200, 'Game Over', 
            {fontSize: '72px', fill: '#000'});
            this.gameoverText.fixedToCamera = true;
            this.gameoverText.cameraOffset.setTo(210, 200);                        
        }
    },
    
    playerHitEnemy: function (enemy, bullet) {
        
        bullet.kill();
        this.monsterEnemies[enemy.name].damaged();
    },
    
    // Pause game toggle
    pauseGame: function () {
        
        this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
        
        if(this.game.physics.arcade.isPaused) {
            
            this.pauseText = this.game.add.text(280, 200, 'Paused', 
            {fontSize: '72px', fill: '#000'});
            this.pauseText.fixedToCamera = true;
            this.pauseText.cameraOffset.setTo(280, 200);
        } else {
            this.pauseText.text = "";
        }
    },

    quitGame: function (pointer) {

        //	Here you should destroy anything you no longer need.
        //	Stop music, delete sprites, purge caches, free resources, all that good stuff.
        
        /* TESTING STUFF
        this.player.alive = true;
        this.player.sprite.health = this.player.health;
        
        for(var i = 0; i < this.monsterEnemies; i++) {
            
            this.monsterEnemies[i].alive = true;
            this.monsterEnemies[i].sprite.health = this.monsterEnemies[i].health;
        }
        
        // Sprite destroying
        this.player.sprite.destroy();
        for(var i = 0; i < this.monsterEnemies; i++) {
            
            this.monsterEnemies[i].sprite.destroy();
        }
        */
        //	Then let's go back to the main menu and clear the world but not cache
        this.state.start('MainMenu', true, false);        
    }

};
