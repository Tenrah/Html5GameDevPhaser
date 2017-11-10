BasicGame.Player = function(game, x, y, health) {
    
    this.game = game;
    this.x = x;
    this.y = y;
    this.health = health;
    this.sprite = null;
    
    this.currentSpeed = 0;
    this.currentFireMode = 1;
    this.fireModeName = null;
    
    this.bullets;
    this.damage = 1;
    this.fireRate = 200;    
    this.bulletSpeed = 600;
    this.nextFire = 0;
    
    this.alive = true;
};

BasicGame.Player.prototype = {
    
    create: function() {
                
        this.sprite = this.game.add.sprite(this.x, this.y, 'player');
        this.sprite.anchor.setTo(0.5, 0.5);
        
        /* WEAPON PLUGIN tested here
           this.normalShot = this.game.add.weapon(10, 'playerBulletNormal');
           this.powerShot = this.game.add.weapon(1, 'playerBulletPower');
                                
           this.normalShot.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
           this.normalShot.bulletSpeed = 400;
           this.normalShot.fireRate = 120;
        
           this.powerShot.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
           this.powerShot.bulletSpeed = 300;
           this.powerShot.fireRate = 60;
        */
        
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(20, 'playerBulletNormal', 0, false);
        this.bullets.setAll('anchor.x', -1.3);
        this.bullets.setAll('anchor.y', -0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);

        this.fireModeName = "Normal Shot";
                
        this.sprite.health = this.health;
        
        this.game.physics.arcade.enable(this.sprite);

        this.sprite.body.collideWorldBounds = true;
        
        /* WEAPON PLUGIN sprite tracking tested here
           couldn't get to work when sprite rotated
           bullets offset the gun barrel
        NOTE: tested with only keyboard controls
           this.normalShot.trackSprite(this.sprite, 42, 7, true);
           this.powerShot.trackSprite(this.sprite, 42, 7, true);
        */
       
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.wKey = this.game.input.keyboard.addKey(Phaser.KeyCode.W);
        this.aKey = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
        this.sKey = this.game.input.keyboard.addKey(Phaser.KeyCode.S);
        this.dKey = this.game.input.keyboard.addKey(Phaser.KeyCode.D);       
        this.changeFireModeKey = this.game.input.keyboard.addKey(Phaser.KeyCode.SHIFT);
        this.changeFireModeKey.onDown.add(this.nextFireMode, this);
    },
    
    nextFireMode: function() {
        
        this.currentFireMode++;
        
        if(this.currentFireMode > 2) {
            
            this.currentFireMode = 1;
        }
        
        if(this.currentFireMode === 1) {
            
            this.damage = 1;                
            this.fireRate = 200;
            this.bulletSpeed = 600;
            
            this.bullets = this.game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.bullets.createMultiple(20, 'playerBulletNormal', 0, false);
            this.bullets.setAll('anchor.x', -1.3);
            this.bullets.setAll('anchor.y', -0.5);
            this.bullets.setAll('outOfBoundsKill', true);
            this.bullets.setAll('checkWorldBounds', true);
        
            this.fireModeName = "Normal Shot";
            
        } else if(this.currentFireMode === 2) {
            
            this.damage = 2;                
            this.fireRate = 2000;
            this.bulletSpeed = 300;

            this.bullets = this.game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.bullets.createMultiple(20, 'playerBulletPower', 0, false);
            this.bullets.setAll('anchor.x', -1.2);
            this.bullets.setAll('anchor.y', 0.1);
            this.bullets.setAll('outOfBoundsKill', true);
            this.bullets.setAll('checkWorldBounds', true);
            
            this.fireModeName = "Power Shot";
        }
    },
    
    update: function() {
        
        // PLAYER MOVEMENT //
        this.sprite.body.velocity.x = 0;
        this.sprite.body.velocity.y = 0;
        
        /* STRAFING TO BE IMPLEMENTED HERE
        if(this.cursors.left.isDown || this.aKey.isDown) {
            
        }
        if(this.cursors.right.isDown || this.dKey.isDown) {
            
        }
        */
        if(this.cursors.up.isDown || this.wKey.isDown) {
            this.currentSpeed = 100;
        } else {
            if(this.currentSpeed > 0) {
               this.currentSpeed = -4;
            }
        }
        if(this.cursors.down.isDown || this.sKey.isDown) {
            this.currentSpeed = -80;
        } else {
            if(this.currentSpeed < -5) {
               this.currentSpeed = -4;
            }
        }        
        
        if(this.currentSpeed > 0) {
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation,
             this.currentSpeed, this.sprite.body.velocity);
        }
        else if(this.currentSpeed < -5) {           
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation,
             this.currentSpeed, this.sprite.body.velocity);
        }
        // PLAYER MOVEMENT ENDS HERE //
        
        // Player sprite rotation based on where mousepointer is
        // and making it only work when game is NOT paused
        if(!this.game.physics.arcade.isPaused) {
            this.sprite.rotation = this.game.physics.arcade.angleToPointer(this.sprite);
        }
        // Player firing when pressing mouse
        if (this.game.input.activePointer.isDown) {
            
            if(this.alive && !this.game.physics.arcade.isPaused) {
                this.fire();
            }
        }
    },
    
    fire: function () {
        
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                       
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.bullets.getFirstExists(false);

            bullet.reset(this.sprite.x, this.sprite.y);

            bullet.rotation = this.game.physics.arcade.moveToPointer(
                    bullet, this.bulletSpeed, this.game.input.activePointer);
        }
    }
};