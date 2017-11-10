BasicGame.Enemy = function(game, enemyType, additionalPart, player, health, 
    name, projectiles, damage, speed) {
    
    this.x = game.world.randomX;
    this.y = game.world.randomY;
    
    this.game = game;
    this.enemyType = enemyType;
    this.additionalPart = additionalPart;
    this.player = player;
    this.health = health;
    this.name = name;  
    this.projectiles = projectiles;
    this.damage = damage;
    this.speed = speed;
    
    this.nextFire = 0;
    this.fireRate = 800;
    this.alive = true;
};

BasicGame.Enemy.prototype = {
    
    create: function() {
        
        // Making sure enemies won't spawn near player at the start
        if(this.x <= 300 || this.y <= 300) {
            
            this.x = this.game.rnd.integerInRange(800, 2000);
            this.y = this.game.rnd.integerInRange(800, 2000);
        }
        
        if(this.enemyType === 'monsterAnt' || this.enemyType === 'monsterScorpion'
                || this.enemyType === 'monsterSpider') {
            this.sprite = this.game.add.sprite(this.x, this.y, this.enemyType);
            this.sprite.anchor.setTo(0.5, 0.5);
            this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
            this.sprite.body.immovable = false;
            this.sprite.angle = this.game.rnd.angle();
            this.sprite.health = this.health;       
            this.sprite.name = this.name.toString();
            this.sprite.body.collideWorldBounds = true;
            // turret creation not working correctly yet
        } else if(this.enemyType === 'turretBase') {
            this.turretBase = this.game.add.sprite(this.x, this.y, this.enemyType);
            this.turretBase.anchor.setTo(0.5, 0.5);
            this.turretGun = this.game.add.sprite(this.x, this.y, this.additionalPart);
            this.turretGun.anchor.setTo(0.3, 0.5);
            this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
            this.turretBase.body.immovable = true;
            this.turretBase.health = this.health;
            this.turretGun.health = this.health;  
            this.turretBase.name = this.name.toString();
            // boss spawning not working correctly yet
        } else if(this.enemyType === 'monsterBoss_HeadPortion') {
            this.monsterBossHead = this.game.add.sprite(this.x, this.y, this.enemyType);
            this.monsterBossHead.anchor.setTo(0.5, 0.5);
            this.monsterBossBodySection = new Array();
            this.monsterBossPath = new Array();
            this.numMonsterBodySections = 10;
            this.monsterBossSpacer = 6;
            this.game.physics.enable(this.monsterBossHead, Phaser.Physics.ARCADE);
            this.monsterBossHead.body.immovable = false;
            
            for(var i = 1; i <= this.numMonsterBodySections-1; i++) {
                
                this.monsterBossBodySection[i] = this.game.add.sprite(
                        this.x, this.y, this.additionalPart);
                this.monsterBossBodySection[i].anchor.setTo(0.5, 0.5);
                this.monsterBossBodySection[i].health = this.health;
            }
            
            for(var i = 0; i <= this.numMonsterBodySections * this.monsterBossSpacer; i++) {
                
                this.monsterBossPath[i] = new Phaser.Point(this.x, this.y);
            }
            
            this.monsterBossHead.health = this.health;
            this.monsterBossHead.name = this.name.toString();
            this.monsterBossHead.body.collideWorldBounds = true;
        }
            
    },
    
    update: function() {
        
        this.sprite.rotation = this.game.physics.arcade.angleBetween(
                this.sprite, this.player.sprite);
        
        if(this.game.physics.arcade.distanceBetween(
                this.sprite, this.player.sprite) < 800) {
            
            this.game.physics.arcade.moveToObject(
                    this.sprite, this.player.sprite, this.speed);
        }
        
        if(this.enemyType === 'turretBase') {

            this.turretGun.rotation = this.game.physics.arcade.angleBetween(
                    this.turretGun, this.player.sprite);

            if (this.game.physics.arcade.distanceBetween(
                    this.turretBase, this.player) < 500) {
                
                if (this.game.time.now > this.nextFire && 
                        this.projectiles.countDead() > 0) {
                    
                    this.nextFire = this.game.time.now + this.fireRate;

                    var projectile = this.projectiles.getFirstDead();

                    projectile.reset(this.turret.x, this.turret.y);

                    projectile.rotation = this.game.physics.arcade.moveToObject(
                            projectile, this.player.sprite, this.speed);
                }
            }
        }
        
        if(this.enemyType === 'monsterBoss_HeadPortion') {
            
            // Still need to implement movement and squash any possible bugs
            
            this.monsterBossHead.body.velocity(0, 0);
            this.monsterBossHead.body.angularVelocity = 0;
            
            this.part = this.monsterBossPath.pop();            
            this.part.setTo(this.monsterBossHead.x, this.monsterBossHead.y);
            this.monsterBossPath.unshift(this.part);
            
            for(var i = 1; i <= this.numMonsterBodySections - 1; i++) {
                
                this.monsterBossBodySection[i].x = 
                        (this.monsterBossPath[i * this.monsterBossSpacer]).x;
                this.monsterBossBodySection[i].y = 
                        (this.monsterBossPath[i * this.monsterBossSpacer]).y;
            }
        }
        
    },
    
    damaged: function() {
        
        
        
        if(this.enemyType === 'turretBase') {
            
            this.turretBase.damage(this.player.damage);
            this.turretGun.damage(this.player.damage);
            
            if(this.turretGun.health <= 0) {
                
                this.alive = false;
                this.turretGun.kill();
                
                return true;
            }
            
            return false;
        } else {
            
            this.sprite.damage(this.player.damage);
        
            if(this.sprite.health <= 0) {

                this.alive = false;

                this.sprite.kill();

                return true;
            }
        }
        return false;
    }
};