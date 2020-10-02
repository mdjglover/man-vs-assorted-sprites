(function() {
    /*
        Attributions
            
            Any code that I did not write has been marked with a comment giving credit to
            its origin.
            All assets used in this game fall under a Creative Commons licence and are
            available for reuse. 
            The following are lists of all assets used:
        
        Sprite Attribution
        
            Most sprites used in this game are sourced from http://opengameart.org/ 
            
            playerPistol.png : Top Down Runner by tokka (https://opengameart.org/content/top-down-runner)
            enemy1.png : Zombie Sprite by Riley Gombart (http://opengameart.org/content/top-down-animated-zombie-set)
            enemy2.png : Warlock's Gauntlet artists - rAum, jackFlower, DrZoliparia, Neil2D (http://opengameart.org/content/top-down-troll-animated)
            enemy3.png : Warlock's Gauntlet artists - rAum, jackFlower, DrZoliparia, Neil2D (http://opengameart.org/content/top-down-pigeared-monster-animated)
            enemy1Dead.png : Zombie Sprite by Riley Gombart (http://opengameart.org/content/top-down-animated-zombie-set)
            enemy2Dead.png : Warlock's Gauntlet artists - rAum, jackFlower, DrZoliparia, Neil2D (http://opengameart.org/content/top-down-dead-things)
            enemy3Dead.png : Warlock's Gauntlet artists - rAum, jackFlower, DrZoliparia, Neil2D (http://opengameart.org/content/top-down-dead-things)
            pistol.png : 2D Modern Items by Justin Nichol (http://opengameart.org/content/2d-modern-items)
            shotgun.png : 2D Modern Items by Justin Nichol (http://opengameart.org/content/2d-modern-items)
            uzi.png : 2D Modern Items by Justin Nichol (http://opengameart.org/content/2d-modern-items)
            wall.png : Davit Masia (https://kronbits.itch.io/matriax-free-cg-textures)
            marble_floor.png : Davit Masia (https://kronbits.itch.io/matriax-free-cg-textures)
            grass.png : athile (http://opengameart.org/content/seamless-grass-texture-ii)
    
        Sound Attribution
        
            All sound sourced from https://www.freesound.org/ 
            
            enemyShot.mp3 : laser3 by nsstudios (https://www.freesound.org/people/nsstudios/sounds/344276/)
            pistolShot.mp3 : Pistol Shot by LeMudCrab (https://www.freesound.org/people/LeMudCrab/sounds/163456/)
    */
    
    
    
    var canvas;
    var context;
    var canvasWidth;
    var canvasHeight;
    var blockWidth = 64;
    var blockHeight = 64;
    var mouseX;
    var mouseY;
    var player;
    var enemy;
    var enemies = [];
    
    // Bullet pools
    var playerBullets = [];
    var enemyBullets = [];
    
    // Weapon and hurt sound lists that are cycled through and variables to control
    // when they sound
    var pistolSound = [];
    var shotgunSound = [];
    var uziSound = [];
    var enemyShotSound = [];
    var pistolFired = false;
    var shotgunFired = false;
    var uziFired = false;
    var enemyFired = false;
    var shotCount = 0;
    var uziShotCount = 0;
    var enemyShotCount = 0;
    
    var playerHurtSound;
    var enemyDeadSound;
    var playerHurt = false;
    var enemyDead = false;
    
    // Keeps tracked of buttons pressed
    var keyMap = {};
    
    // Variables that control what is displayed on canvas
    var menuTimer = 0;
    var IN_GAME = false;
    var IN_MENU = true; 
    var SELECTION = false;
    
    var MAIN_MENU = true;
    var LEVEL_SELECT = false;
    var HOW_TO_PLAY = false;
    var DIFFICULTY_SELECT = false;
    var SCORE_SCREEN = false;
    var NEXT_LEVEL_MENU = false;
    var GAME_OVER = false;
    var GAME_COMPLETE = false;
    
    var NEW_GAME = false;
    var NEW_LEVEL = false;
    var NEW_ROOM = false;
    
    var hardMode = false;
    var hardModeUnlocked = 0;
    
    var level;
    var levelList = ['level1', 'level2'];
    var levelCount = 0;
    var maxLevel = 1;
    var lastLevel = 1;
    var curLevel = 'level1';
    var curRoom = '';
    var mapItems = [];
    
    var username;
    var savedMaxLevel;
    var savedHardMode;
    
    // Constructor functions
            
    var GeneratePlayer = function(context, filename) {
        this.model = new Image();
        this.model.src = filename;
        
        this.score = 0;
        this.numShotsFired = 0;
        this.numShotsHit = 0;
        this.accuracy = 0;
        this.totalScore = 0;
        
        this.x = null;
        this.y = null;
        this.tilemapX = null;
        this.tilemapY = null;
        this.width = Math.round(blockWidth*1.3);
        this.height = Math.round(blockHeight*1.3);
        this.centreX = simpleCentre(this.x, this.width);
        this.centreY = simpleCentre(this.y, this.height);
        this.radians = null;
        
        this.radius = 20;
        this.health = 100;
        this.speed = 4;
        this.moveDir = null;
        
        this.weaponChange = false;
        this.hasShotgun = false;
        this.hasUzi = false;
        
        this.weapon = 'pistol';
        this.damage = 20;
        this.shoot = false;
        this.cooldown = 12;
        this.cooldownTimer = 0;
        
        this.mouseFollow = function (mouseX, mouseY){
            // Adapted from a JavaScript tutorial at:
            // https://youtu.be/I3Ik81Ku3lA?t=1224
            this.centreX = simpleCentre(this.x, this.width);
            this.centreY = simpleCentre(this.y, this.height);
            var xy = xyToTileIndices(this.centreX, this.centreY);
            this.tilemapX = xy.tilemapX;
            this.tilemapY = xy.tilemapY;
            var deltaX = mouseX - this.centreX;
            var deltaY = mouseY - this.centreY;
            this.radians = Math.atan2(deltaY, deltaX);
            
            context.save();
            
            context.translate(this.centreX, this.centreY);
            context.rotate(this.radians);
            context.drawImage(this.model, -(this.width / 2), -(this.height/2), this.width, this.height);
            
            context.restore();          
        }
        
        this.die = function(){
            enemyDeadSound.play()
            IN_GAME = false;
            IN_MENU = true;
            GAME_OVER = true;
        }
    };
    
    
    
    var GenerateEnemy = function (context, enemyName, enemyStats) {
        this.alive = true;
        
        this.model = new Image();
        this.model.src = enemyStats['filename'];
        this.deadModel = new Image();
        this.deadModel.src = enemyStats['deadModel'];
        
        this.score = enemyStats['score']
        this.x = 0;
        this.y = 0;
        this.width = enemyStats['width'];
        this.height = enemyStats['height'];
        this.deadWidth = enemyStats['deadWidth'];
        this.deadHeight = enemyStats['deadHeight'];
        this.centreX = simpleCentre(this.x, this.width);
        this.centreY = simpleCentre(this.y, this.height);
        this.radians = null;
        this.radius = enemyStats['radius'];
        this.health = enemyStats['health'];
        this.speed = enemyStats['speed'];
        this.damage = enemyStats['damage'];
        this.moveDir = null;
        this.cooldown = enemyStats['cooldown'];
        this.cooldownTimer = 0;
        
        if (hardMode){
            this.health = Math.floor(this.health * 1.3);
            this.speed += 1;
            this.damage = Math.floor(this.damage * 2);
            this.cooldown -= 10;
        }
        
        this.playerFollow = function(playerX, playerY) {
            // Adapted from a JavaScript tutorial at:
            // https://youtu.be/I3Ik81Ku3lA?t=1224
            this.centreX = simpleCentre(this.x, this.width);
            this.centreY = simpleCentre(this.y, this.height);
            var deltaX = playerX - this.centreX;
            var deltaY = playerY - this.centreY;
            this.radians = Math.atan2(deltaY, deltaX);
            
            context.save();
            
            context.translate(this.centreX, this.centreY);
            context.rotate(this.radians);
            context.drawImage(this.model, -(this.width / 2), -(this.height/2), this.width, this.height);
            
            context.restore();          
        }
        
        if (enemyStats['AIType'] === 'chase'){
            this.AI = function(){
                if (this.alive){
                    this.playerFollow(player.centreX, player.centreY);
                    this.cooldownTimer += 1;
                    var newX = this.x + this.speed * Math.cos(this.radians);
                    var newY = this.y + this.speed * Math.sin(this.radians);
                    var newCentreX = simpleCentre(newX, this.width);
                    var newCentreY = simpleCentre(newY, this.height);
                    if (!tilemapCollision(newCentreX, newCentreY)) {
                        if (distanceTo(this.centreX, this.centreY, player.centreX, player.centreY) < this.radius + player.radius){
                            if (this.cooldownTimer > this.cooldown){
                                player.health -= this.damage;
                                playerHurt = true;
                                if (player.health <= 0) {
                                    player.die();
                                }
                                
                                this.cooldownTimer = 0;
                            }
                        } else {
                            this.x = newX;
                            this.y = newY;
                        }
                    }
                } else {
                    context.drawImage(this.deadModel, this.x, this.y, this.deadWidth, this.deadHeight);
                }
            }
        } else if (enemyStats['AIType'] === 'standshoot'){
            this.AI = function(){
                if (this.alive){
                    this.playerFollow(player.centreX, player.centreY);
                    this.cooldownTimer += 1;
                    if (this.cooldownTimer > this.cooldown){
                        var bullet = new GenerateBullet(this, this.radians, 5, 8, 'red');
                        enemyBullets.push(bullet);
                        enemyFired = true;
                        this.cooldownTimer = 0;
                    }
                } else {
                    context.drawImage(this.deadModel, this.x, this.y, this.deadWidth, this.deadHeight);
                }
            }
        } else if (enemyStats['AIType'] === 'moveshoot') {
            this.moveCount = 0;
            this.needMove = true;
            this.moveList = ['U', 'R', 'D', 'L', 'UR', 'DR', 'DL', 'UL']
            this.AI = function(){
                if (this.alive){
                    if (this.needMove){
                        var num = getRandomNumber(0, 7);
                        this.moveDir = this.moveList[num];
                        this.needMove = false;
                    }
                    updateEnemyPosition(this);
                    this.playerFollow(player.centreX, player.centreY);
                    this.moveCount += 1;
                    if (this.moveCount > 50){
                        this.needMove = true;
                        this.moveCount = 0;
                    }
                    this.cooldownTimer += 1;
                    if (this.cooldownTimer > this.cooldown){
                        var bullet = new GenerateBullet(this, this.radians, 5, 8, 'red');
                        enemyBullets.push(bullet);
                        enemyFired = true;
                        this.cooldownTimer = 0;
                    }
                } else {
                    context.drawImage(this.deadModel, this.x, this.y, this.deadWidth, this.deadHeight);
                }
            } 
        } else if (enemyStats['AIType'] === 'chaseshoot') {
            this.AI = function(){
                if (this.alive){
                    this.playerFollow(player.centreX, player.centreY);
                    var newX = this.x + this.speed * Math.cos(this.radians);
                    var newY = this.y + this.speed * Math.sin(this.radians);
                    var newCentreX = simpleCentre(newX, this.width);
                    var newCentreY = simpleCentre(newY, this.height);
                    if (!tilemapCollision(newCentreX, newCentreY)) {
                        this.x = newX;
                        this.y = newY;    
                    }
                    this.cooldownTimer += 1;
                    if (this.cooldownTimer > this.cooldown){
                        var bullet = new GenerateBullet(this, this.radians, 5, 8, 'red');
                        enemyBullets.push(bullet);
                        enemyFired = true;
                        this.cooldownTimer = 0;
                    }
                } else {
                    context.drawImage(this.deadModel, this.x, this.y, this.deadWidth, this.deadHeight);
                }
            }   
        } else if (enemyStats['AIType'] === 'boss1'){
            this.moveDir = 'L';
            this.bulletSpacing = Math.floor(this.width / 4);
            this.AI = function(){
                if (this.alive){
                    if (this.moveDir === 'L'){
                        var newX = this.x - this.speed;
                        if (tilemapCollision(newX, this.y)){
                            this.moveDir = 'R';
                        } else {
                            this.x = newX;
                        }
                    } else if (this.moveDir === 'R'){
                        var newX = this.x + this.speed;
                        if (tilemapCollision(newX + this.width, this.y)){
                            this.moveDir = 'L';
                        } else {
                            this.x = newX;
                        }
                    }
                    this.centreX = simpleCentre(this.x, this.width);
                    this.centreY = simpleCentre(this.y, this.height)
                    this.cooldownTimer += 1;
                    if (this.cooldownTimer > this.cooldown){
                        for (var i = 0; i < 5; i++){
                            var bullet = new GenerateBullet2(this.x + (i * this.bulletSpacing), this.y + this.height, this.damage, 5, 10, 'red');
                            enemyBullets.push(bullet);
                        }
                        this.cooldownTimer = 0;
                    }
                    context.drawImage(this.model, this.x, this.y, this.width, this.height);
                } else {
                    context.drawImage(this.deadModel, this.x, this.y, this.deadWidth, this.deadHeight);
                } 
            }
        } else if (enemyStats['AIType'] === 'boss2'){
            this.attackType = 0;
            this.needMove = true;
            this.moveList = ['U', 'R', 'D', 'L', 'UR', 'DR', 'DL', 'UL']
            this.AI = function(){
                if (this.alive){
                    if (this.attackType === 0){
                        console.log("attackType 0");
                        if (this.needMove){
                            var num = getRandomNumber(0, 7);
                            this.moveDir = this.moveList[num];
                            this.needMove = false;
                        }
                        updateEnemyPosition(this);
                        this.playerFollow(player.centreX, player.centreY);
                      
                        this.cooldownTimer += 1;
                        if (this.cooldownTimer % 15 === 0){
                            var bullet = new GenerateBullet(this, this.radians, 5, 8, 'red');
                            enemyBullets.push(bullet);
                            enemyFired = true;
                        } 
                        if (distanceTo(this.centreX, this.centreY, player.centreX, player.centreY) < this.radius + player.radius){
                            if (this.cooldownTimer % 5 === 0){
                                player.health -= this.damage;
                                playerHurt = true;
                                if (player.health <= 0) {
                                    player.die();
                                }
                            }
                        }
                        if (this.cooldownTimer > this.cooldown){
                            this.cooldownTimer = 0;
                            this.attackType = 1;
                        }
                    } else if (this.attackType === 1) {
                        console.log("attackType 1");
                        this.playerFollow(player.centreX, player.centreY);
                        this.cooldownTimer += 1;
                        if (this.cooldownTimer % 20 === 0){
                            var bullet1 = new GenerateBullet(this, this.radians, 5, 12, 'red');
                            enemyBullets.push(bullet1);
                            var bullet2 = new GenerateBullet(this, this.radians - 0.4, 5, 10, 'red');
                            enemyBullets.push(bullet2);
                            var bullet3 = new GenerateBullet(this, this.radians + 0.4, 5, 10, 'red');
                            enemyBullets.push(bullet3);
                            enemyFired = true;
                        }
                        if (this.cooldownTimer > this.cooldown){
                            this.cooldownTimer = 0;
                            this.attackType = 0;
                            this.needMove = true;
                            this.moveCount = 0;
                        }
                    }
                } else {
                    context.drawImage(this.deadModel, this.x, this.y, this.deadWidth, this.deadHeight);
                }
                
            }
        }
        
        this.die = function() {
            this.alive = false;
            enemyDead = true;
            player.score += this.score;
            level.numRoomEnemies[curRoom] -= 1;
        }
    };
    
    
    var GenerateLevel = function(context, level) {
        this.tilemaps = level.tilemaps;
        this.itemMaps = level.itemMaps;
        this.mapAssets = [];
        this.collisionObjects = level.collisionObjects;
        this.exits = level.exits;
        this.initX = level.initX;
        this.initY = level.initY;
        this.bossInitX = level.bossInitX;
        this.bossInitY = level.bossInitY;
        
        for (var i = 0; i < level.objectFiles.length; i++) {
            var model = new Image();
            model.src = level.objectFiles[i];
            this.mapAssets.push(model);
        }
        
        this.enemies = [];
        this.enemyNames = level.enemyNames;
        this.roomEnemies = level.roomEnemies;
        if (hardMode){
            this.numRoomEnemies = level.hardNumRoomEnemies
        } else {
            this.numRoomEnemies = level.numRoomEnemies;
        }
        this.exitTo = function(direction) {
            if (direction === 'u') {
                curRoom = this.exits[curRoom]['u'];
                player.y = 700;
            } else if (direction === 'r') {
                curRoom = this.exits[curRoom]['r'];
                player.x = 20;
            } else if (direction === 'd') {
                curRoom = this.exits[curRoom]['d'];
                player.y = 20;
            } else {
                curRoom = this.exits[curRoom]['l'];
                player.x = 950;
            }
            
        }
    };
        
    
    
    var GenerateBullet = function(object, angle, speed, radius, colour) {
        this.posX = object.centreX;
        this.posY = object.centreY;
        this.radius = radius;
        this.angle = angle;
        this.speed = speed;
        this.damage = object.damage;
        this.colour = colour;
        // Initial position
        this.posX = this.posX + (object.radius+5) * Math.cos(this.angle);
        this.posY = this.posY + (object.radius+5) * Math.sin(this.angle);
        this.bulletUpdate = function(){
            this.posX = this.posX + this.speed * Math.cos(this.angle);
            this.posY = this.posY + this.speed * Math.sin(this.angle);
        }
    };
    
    var GenerateBullet2 = function(x, y, damage, speed, radius, colour) {
        this.posX = x;
        this.posY = y
        this.radius = radius;
        this.speed = speed;
        this.damage = damage;
        this.colour = colour;
        // Initial position
        this.bulletUpdate = function(){
            this.posY = this.posY + this.speed;
        }
    };

        
    
    document.addEventListener('DOMContentLoaded', init, false);
    
    // Initialising
    function init() {
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
		
        window.addEventListener('keydown', onKeydown, false);
		window.addEventListener('keyup', onKeyup, false);
        window.addEventListener('click', function(event){
            if (IN_MENU){
                SELECTION = true;
            }
        }, false)
		
        canvas.addEventListener('mousemove', function(event) {
            // Gets mouse x and y in relation to canvas. Source:
            // https://www.youtube.com/watch?v=8pNzjUjvNsY&t=239s
            mouseX = event.clientX - canvas.offsetLeft;
            mouseY = event.clientY - canvas.offsetTop;
        }, false);
        
        canvas.addEventListener('mousedown', function(event){
            if (IN_GAME){
                player.shoot = true;
            }
        }, false);
        
        canvas.addEventListener('mouseup', function(event){
            if (IN_GAME){
                player.shoot = false;
            }
        }, false);
        
        // Generating assets required throughout game
        
        var healthPack = new Image();
        healthPack.src = './assets/images/healthpack.png';
        mapItems.push(healthPack);
        var shotgun = new Image();
        shotgun.src = './assets/images/shotgun.png';
        mapItems.push(shotgun);
        var uzi = new Image();
        uzi.src = './assets/images/uzi.png';
        mapItems.push(uzi);
        var pistol = new Image();
        pistol.src = './assets/images/pistol.png';
        mapItems.push(pistol);
        
        var pistolShot1 = new Audio('./assets/audio/pistolShot.mp3');
        pistolSound.push(pistolShot1);
        var pistolShot2 = new Audio('./assets/audio/pistolShot.mp3');
        pistolSound.push(pistolShot2);
        var pistolShot3 = new Audio('./assets/audio/pistolShot.mp3');
        pistolSound.push(pistolShot3);
        var pistolShot4 = new Audio('./assets/audio/pistolShot.mp3');
        pistolSound.push(pistolShot4);
        var pistolShot5 = new Audio('./assets/audio/pistolShot.mp3');
        pistolSound.push(pistolShot5);
        
        var shotgunShot1 = new Audio('./assets/audio/shotgunShot.mp3');
        shotgunSound.push(shotgunShot1);
        var shotgunShot2 = new Audio('./assets/audio/shotgunShot.mp3');
        shotgunSound.push(shotgunShot2);
        var shotgunShot3 = new Audio('./assets/audio/shotgunShot.mp3');
        shotgunSound.push(shotgunShot3);
        var shotgunShot4 = new Audio('./assets/audio/shotgunShot.mp3');
        shotgunSound.push(shotgunShot4);
        var shotgunShot5 = new Audio('./assets/audio/shotgunShot.mp3');
        shotgunSound.push(shotgunShot5);
        
        var uziShot1 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot1);
        var uziShot2 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot2);
        var uziShot3 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot3);
        var uziShot4 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot4);
        var uziShot5 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot5);
        var uziShot6 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot6);
        var uziShot7 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot7);
        var uziShot8 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot8);
        var uziShot9 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot9);
        var uziShot10 = new Audio('./assets/audio/pistolShot.mp3');
        uziSound.push(uziShot10);
        
        var enemyShot1 = new Audio('./assets/audio/enemyShot.mp3');
        enemyShotSound.push(enemyShot1);
        var enemyShot2 = new Audio('./assets/audio/enemyShot.mp3');
        enemyShotSound.push(enemyShot2);
        var enemyShot3 = new Audio('./assets/audio/enemyShot.mp3');
        enemyShotSound.push(enemyShot3);
        var enemyShot4 = new Audio('./assets/audio/enemyShot.mp3');
        enemyShotSound.push(enemyShot4);
        var enemyShot5 = new Audio('./assets/audio/enemyShot.mp3');
        enemyShotSound.push(enemyShot5);
        
        playerHurtSound = new Audio('./assets/audio/playerHurt.mp3');
        enemyDeadSound = new Audio('./assets/audio/enemyDead.mp3');
        
        /*
        username = getCookie('username');
        savedMaxLevel = getCookie('maxLevel');
        savedHardMode = getCookie('hardModeUnlocked');
        
        maxLevel = savedMaxLevel;
        hardModeUnlocked = savedHardMode;
        */
        
        // Drawing the game to canvas
        
        window.setInterval(drawGame, 24);
    }
    
    
    // Main game loop
    
    function drawGame() {
        if (IN_MENU){
            if (MAIN_MENU){
                drawMainMenu();
            } else if (LEVEL_SELECT){
                drawLevelSelect();
            } else if (HOW_TO_PLAY){
                drawHowToPlay();
            } else if (DIFFICULTY_SELECT) {
                drawDifficultySelect();
            } else if (SCORE_SCREEN) {
                drawScoreScreen();
            } else if (NEXT_LEVEL_MENU){
                drawNextLevelMenu();
            } else if (GAME_OVER) {
                drawGameOverMenu();
            } else if (GAME_COMPLETE) {
                drawGameCompleteMenu();
            }
            
            checkSelection();
        
        } else if (IN_GAME){
            if (NEW_LEVEL){
                curRoom = 'room1';
                var levelDict = fetchLevel(curLevel);
                level = new GenerateLevel(context, levelDict);
                player = new GeneratePlayer(context, './assets/images/playerPistol.png');
                player.x = level.initX;
                player.y = level.initY;
                NEW_ROOM = true;
                NEW_LEVEL = false;
                
            } else {
                if (NEW_ROOM){
                    populateEnemies();
                    playerBullets = [];
                    enemyBullets = [];
                    NEW_ROOM = false;
                }
                drawMap();
                playerMove();
                updatePosition(player);
                playerShotFired();
                checkPlayerBulletCollisions(playerBullets);
                checkEnemyBulletCollisions(enemyBullets);
                enemyMoves();
                weaponSounds();
                hurtSounds();
                player.mouseFollow(mouseX, mouseY);
                drawBullets(context, playerBullets);
                drawBullets(context, enemyBullets);
                drawHUD();
                collectItems();
                checkWeaponChange();
                checkRoomChange();
                checkLevelEnd();
            }
        }    
    }


    // Main loop functions
    
    // Enemies dictionaries
    /*
        enemyTemplate : {
            filename : '',
            deadModel : '',
            width : 0,
            height : 0,
            deadWidth: 0,
            deadHeight : 0,
            radius : 0,
            health : 0,
            damage: 0,
            cooldown : 0,
            speed : 0,
            AIType : ''
        }
        */
    function fetchEnemy(enemyName){
        if (enemyName === 'enemy1'){ 
            return {
                filename : './assets/images/enemy1.png',
                deadModel : './assets/images/enemy1Dead.png',
                width : Math.floor(blockWidth * 1.1),
                height : Math.floor(blockHeight * 1.1),
                deadWidth : Math.floor(blockWidth * 1.9),
                deadHeight : Math.floor(blockHeight * 1.8),
                radius : blockWidth/2,
                health : 60,
                damage : 10,
                cooldown : 50,
                speed : 2,
                AIType : 'chase',
                score : 50
            };
        }
        else if (enemyName === 'enemy2') { 
            return {
                filename : './assets/images/enemy2.png',
                deadModel : './assets/images/genericDead.png',
                width : blockWidth,
                height : blockHeight,
                deadWidth : blockWidth,
                deadHeight : blockHeight,
                radius : blockWidth/2,
                health : 100,
                damage : 10,
                cooldown : 60,
                speed : 5,
                AIType : 'standshoot',
                score : 80
            };
        }
        else if (enemyName === 'enemy3'){
            return {
                filename : './assets/images/enemy3.png',
                deadModel : './assets/images/genericDead.png',
                width : blockWidth,
                height : blockHeight,
                deadWidth : blockWidth,
                deadWidth : blockHeight,
                radius : blockWidth/2,
                health : 80,
                damage : 10,
                cooldown : 50,
                speed : 3,
                AIType : 'moveshoot',
                score : 100
            };
        }
        else if (enemyName === 'enemy4'){ 
            return {
                filename : './assets/images/enemy4.png',
                deadModel : './assets/images/genericDead.png',
                width : Math.floor(blockWidth * 1.5),
                height : Math.floor(blockHeight * 1.5),
                deadWidth: blockWidth,
                deadHeight : blockHeight,
                radius : Math.floor((blockWidth*1.5)/2),
                health : 150,
                damage: 20,
                cooldown : 50,
                speed : 5,
                AIType : 'moveshoot',
                score : 200
            };
        }
        else if (enemyName === 'enemy5') { 
            return {
                filename : './assets/images/enemy5.png',
                deadModel : './assets/images/genericDead.png',
                width : blockWidth * 2,
                height : blockHeight * 2,
                deadWidth: blockWidth,
                deadHeight : blockHeight,
                radius : blockWidth,
                health : 200,
                damage: 30,
                cooldown : 50,
                speed : 4,
                AIType : 'standshoot',
                score : 220
            };
        }
        else if (enemyName === 'enemy6'){ 
            return {
                filename : './assets/images/enemy6.png',
                deadModel : './assets/images/genericDead.png',
                width : blockWidth,
                height : blockHeight,
                deadWidth: blockWidth,
                deadHeight : blockHeight,
                radius : blockWidth/2,
                health : 100,
                damage: 10,
                cooldown : 50,
                speed : 2,
                AIType : 'chaseshoot',
                score : 150
            };
        }
        else if (enemyName === 'boss1'){
            return {
                filename : './assets/images/boss1.png',
                deadModel : './assets/images/genericDead.png',
                width : blockWidth * 5,
                height : blockHeight * 2,
                deadWidth: blockWidth,
                deadHeight : blockHeight,
                radius : blockWidth,
                health : 700,
                damage: 20,
                cooldown : 40,
                speed : 4,
                AIType : 'boss1',
                score : 1000
            };
        }
        else if (enemyName === 'boss2'){
            return {
                filename : './assets/images/boss2.png',
                deadModel : './assets/images/genericDead.png',
                width : blockWidth * 3,
                height : blockHeight * 3,
                deadWidth: blockWidth,
                deadHeight : blockHeight,
                radius : blockWidth,
                health : 1400,
                damage: 20,
                cooldown : 60,
                speed : 6,
                AIType : 'boss2',
                score : 1500
            };
        }
    }
    
    // Level dictionaries
    function fetchLevel(level){
        if (level === 'level1'){
            return {
                tilemaps : {
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room1 : [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
                             [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                             [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 2
                             [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                             [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 5
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 6
                             [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                             [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 8
                             [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 9
                             [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 10
                             [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 11
                            ],
                            
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room2 : [[1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1], // 0
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
                             [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], // 3
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                             [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], // 8
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 10
                             [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 11
                            ],
                            
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room3 : [[1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1], // 0
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,'h',0, 1], // 2
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 8
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 9
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 10
                             [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1]  // 11
                            ],
                             
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room4 : [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                             [1, 0, 0, 0, 0, 0, 0, 0,'s',0, 0, 0, 0, 0, 0, 1], // 5
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 10
                             [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 11
                            ],
                             
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room5 : [[1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1], // 0
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 10
                             [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1]  // 11
                            ],
                             
                                //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    bossRoom :  [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 10
                                 [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1]  // 11
                                ]
                },
                
                
                objectFiles : ['./assets/images/marble_floor.png', './assets/images/wall2.png'],

                initX : 120,
                initY : 120,
                
                bossInitX : 120,
                bossInitY : 64,

                exits : {
                    // Directions are clockwise from top
                    room1 : {
                        u : null,
                        r : 'room2',
                        d : null,
                        l : null
                    },
                    room2 : {
                        u : 'room3',
                        r : null,
                        d : null,
                        l : 'room1'
                    },
                    room3 : {
                        u : 'room5',
                        r : 'room4',
                        d : 'room2',
                        l : null
                    },
                    room4 : {
                        u : null,
                        r : null,
                        d : null,
                        l : 'room3'
                    },
                    room5 : {
                        u : 'bossRoom',
                        r : null,
                        d : 'room3',
                        l : null
                    },
                    bossRoom : {
                        u : null,
                        r : null,
                        d : 'room5',
                        l : null
                    }
                },
                    
                enemyNames : ['enemy1', 'enemy2', 'enemy3', 'boss1'],
                roomEnemies : {
                    room1 : [0],
                    room2 : [0, 1],
                    room3 : [0, 1, 2],
                    room4 : [2],
                    room5 : [1,2],
                    bossRoom : [3]
                },
                numRoomEnemies : {
                    room1: 3,
                    room2 : 4,
                    room3 : 4,
                    room4 : 3,
                    room5 : 5,
                    bossRoom : 1
                },
                hardNumRoomEnemies : {
                    room1: 5,
                    room2 : 6,
                    room3 : 6,
                    room4 : 5,
                    room5 : 7,
                    bossRoom : 1
                }
            };
        } else if (level === 'level2'){
            return {
                tilemaps : {
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room1 : [[2, 2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
                             [2, 2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
                             [2, 2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
                             [2, 2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 3
                             [2, 2, 2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0], // 4
                             [2, 2, 2, 3, 3, 3, 3, 3, 0, 0, 0, 3, 3, 0, 0, 0], // 5
                             [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], // 6
                             [2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], // 7
                             [2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], // 8
                             [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3], // 9
                             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // 10
                             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]  // 11
                            ],
                            
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room2 : [[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 1], // 0
                             [2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1], // 1
                             [2, 2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 2
                             [2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                             [2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 4
                             [2, 2, 3, 3, 3,'s',0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 5
                             [2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 6
                             [2, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 7
                             [2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 8
                             [2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 9
                             [2, 2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10
                             [2, 2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // 11
                            ],
                            
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room3 : [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 2], // 0
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 2], // 1
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 2], // 2
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 2], // 3
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 2, 2], // 4
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 2, 2], // 5
                             [3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 2, 2], // 6
                             [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2], // 7
                             [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2], // 8
                             [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2], // 9
                             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // 10
                             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]  // 11
                            ],
                             
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room4 : [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 0
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 4
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 5
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 6
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 7
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 2], // 9
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 2, 2], // 10
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 2]  // 11
                            ],
                             
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room5 : [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
                             [1, 0,'h',0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], // 3
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                             [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1], // 9
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 10
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]  // 11
                            ],
                             
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room6 : [[1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,'u',1], // 10
                             [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 11
                            ],
                            
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room7 : [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2], // 0
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2], // 1
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2], // 2
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 3
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 4
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 5
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 6
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 7
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 8
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 9
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2], // 10
                             [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 11
                            ],
                            
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room8 : [[2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 3, 3, 2, 2, 2, 2], // 0
                             [1, 3, 3, 3, 3, 3, 3, 3, 0, 0, 3, 3, 2, 2, 2, 2], // 1
                             [1, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 2], // 2
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2], // 3
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2], // 4
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 5
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2], // 6
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2], // 7
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 8
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2], // 9
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2], // 10
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2]  // 11
                            ],
                            
                            //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    room9 : [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 0
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,'h',0, 3, 2], // 1
                             [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2], // 2
                             [2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2], // 3
                             [2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2], // 4
                             [2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2], // 5
                             [2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 2], // 6
                             [2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2], // 7
                             [2, 2, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2], // 8
                             [2, 2, 2, 2, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 2, 2], // 9
                             [2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 3, 3, 2, 2, 2, 2], // 10
                             [2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 3, 3, 2, 2, 2, 2]  // 11
                            ],
                            
                                //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
                    bossRoom :  [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 10
                                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]  // 11
                                ]
                },
                
                
                objectFiles : ['./assets/images/grass.png', './assets/images/tree.png', './assets/images/water.png', './assets/images/beach.png'],

                initX : blockWidth * 5,
                initY : blockHeight * 6,
                
                bossInitX : 120,
                bossInitY : 120,

                exits : {
                    // Directions are clockwise from top
                    room1 : {
                        u : 'room2',
                        r : 'room3',
                        d : null,
                        l : null
                    },
                    room2 : {
                        u : null,
                        r : 'room4',
                        d : 'room1',
                        l : null
                    },
                    room3 : {
                        u : 'room4',
                        r : null,
                        d : null,
                        l : 'room1'
                    },
                    room4 : {
                        u : 'room5',
                        r : null,
                        d : 'room3',
                        l : 'room2'
                    },
                    
                    room5 : {
                        u : null,
                        r : 'room6',
                        d : 'room4',
                        l : null
                    },
                    room6 : {
                        u : 'room7',
                        r : null,
                        d : null,
                        l : 'room5'
                    },
                    room7 : {
                        u : 'room8',
                        r : null,
                        d : 'room6',
                        l : null
                    },
                    
                    room8 : {
                        u : 'room9',
                        r : null,
                        d : 'room7',
                        l : null
                    },
                    
                    room9 : {
                        u : 'bossRoom',
                        r : null,
                        d : 'room8',
                        l : null
                    },
                    
                    bossRoom : {
                        u : null,
                        r : null,
                        d : 'room9',
                        l : null
                    }
                },
                    
                enemyNames : ['enemy1', 'enemy2', 'enemy3', 'enemy4', 'enemy5', 'enemy6', 'boss2'],
                roomEnemies : {
                    room1 : [],
                    room2 : [0],
                    room3 : [5],
                    room4 : [3, 4],
                    room5 : [0, 4, 5],
                    room6 : [3, 4, 5],
                    room7 : [3, 4, 5],
                    room8 : [3, 4, 5],
                    room9 : [3, 4, 5],
                    bossRoom : [6]
                },
                numRoomEnemies : {
                    room1: 0,
                    room2 : 6,
                    room3 : 4,
                    room4 : 4,
                    room5 : 5,
                    room6 : 5,
                    room7 : 5,
                    room8 : 4,
                    room9 : 4,
                    bossRoom : 1
                },
                hardNumRoomEnemies : {
                    room1: 0,
                    room2 : 8,
                    room3 : 5,
                    room4 : 5,
                    room5 : 6,
                    room6 : 7,
                    room7 : 6,
                    room8 : 6,
                    room9 : 6,
                    bossRoom : 1
                }
            };
        }
    }
    
    // Menus
    
    function drawMainMenu(){
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        context.font = '60px Consola';
        context.textAlign = 'left';
        context.fillStyle = 'red';

        context.fillText("Man vs Assorted Sprites", blockWidth * 2, blockHeight * 2);
        
        context.font = '40px Consola';
        context.fillStyle = 'white';
        
        context.fillText("New Game", blockWidth * 2, blockHeight * 4);
        context.fillText("Level Select", blockWidth * 2, blockHeight * 6);
        context.fillText("How To Play", blockWidth * 2, blockHeight * 10);
    }
    
    function drawHowToPlay(){
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        context.font = '60px Consola';
        context.textAlign = 'left';
        context.fillStyle = 'red';

        context.fillText("Man vs Assorted Sprites", blockWidth * 2, blockHeight * 2);
        
        context.font = '40px Consola';
        context.fillStyle = 'white';
        
        context.fillText("Move : WASD", blockWidth * 2, blockHeight * 4);
        context.fillText("Change Weapon : 1 2 3", blockWidth * 2, blockHeight * 5);
        context.fillText("Shoot : Left Mouse Button", blockWidth * 2, blockHeight * 6);
        
        context.fillText("Back", blockWidth * 2, blockHeight * 9);
    }
    
    function drawLevelSelect(){
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        context.font = '60px Consola';
        context.textAlign = 'left';
        context.fillStyle = 'red';

        context.fillText("Select Level", blockWidth * 2, blockHeight * 2);
        
        context.font = '40px Consola';
        context.fillStyle = 'white';
        if (maxLevel >= 0){
            context.fillText("Level 1", blockWidth * 2, blockHeight * 5);
        }
        if (maxLevel >= 1){
            context.fillText("Level 2", blockWidth * 2, blockHeight * 7);
        }
    }
    
    function drawDifficultySelect(){
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        context.font = '60px Consola';
        context.textAlign = 'left';
        context.fillStyle = 'red';

        context.fillText("Select Difficulty", blockWidth * 2, blockHeight * 2);
        
        context.font = '40px Consola';
        context.fillStyle = 'white';
        
        context.fillText("Normal", blockWidth * 2, blockHeight * 5);
        if (hardModeUnlocked){
            context.fillText("Hard", blockWidth * 2, blockHeight * 7);
        }
    }
    
    function drawScoreScreen(){
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        context.textAlign = 'left';
        context.font = '60px Consola';
        context.fillStyle = 'red';

        context.fillText("Score", blockWidth * 2, blockHeight * 2);
        
        context.font = '40px Consola';
        context.fillStyle = 'white';
        
        context.fillText("Score : " + player.score, blockWidth * 2, blockHeight * 4);
        context.fillText("Accuracy : " + player.accuracy + "%", blockWidth * 2, blockHeight * 5);
        context.fillText("Total Score : " + player.totalScore, blockWidth * 2, blockHeight * 6);
        
        context.fillText("Continue", blockWidth * 2, blockHeight * 9);
    }
    
    function drawNextLevelMenu(){
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        context.textAlign = 'left';
        context.font = '60px Consola';
        context.fillStyle = 'red';

        context.fillText("Level Complete", blockWidth * 2, blockHeight * 2);
        
        context.font = '40px Consola';
        context.fillStyle = 'white';
        
        context.fillText("Continue", blockWidth * 2, blockHeight * 5);
        context.fillText("Save", blockWidth * 2, blockHeight * 7);
        context.fillText("Main Menu", blockWidth * 2, blockHeight * 9);
    }
    
    function drawGameOverMenu(){
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        context.textAlign = 'left';
        context.font = '60px Consola';
        context.fillStyle = 'red';

        context.fillText("Game Over", blockWidth * 2, blockHeight * 2);
        
        context.font = '40px Consola';
        context.fillStyle = 'white';
        
        context.fillText("Retry", blockWidth * 2, blockHeight * 5);
        //context.fillText("Save", blockWidth * 2, blockHeight * 7);
        context.fillText("Main Menu", blockWidth * 2, blockHeight * 9);
    }
    
    function drawGameCompleteMenu(){
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        context.textAlign = 'left';
        context.font = '60px Consola';
        context.fillStyle = 'red';

        context.fillText("Game Complete", blockWidth * 2, blockHeight * 2);
        
        context.font = '40px Consola';
        context.fillStyle = 'white';
        

        context.fillText("Congratulations, you have completed the game.", blockWidth * 2, blockHeight * 3);
        if (!hardModeUnlocked){
            context.fillText("Hard mode now unlocked.", blockWidth * 2, blockHeight * 4);
        }
        
        context.textAlign = 'left'
        //context.fillText("Save", blockWidth * 2, blockHeight * 7);
        context.fillText("Main Menu", blockWidth * 2, blockHeight * 9);
    }
    
    function checkSelection(){
        if (SELECTION){
            shotgunSound[shotCount].play();
            shotCount += 1
            if (shotCount > 4){
                shotCount = 0;
            }
            if (MAIN_MENU){
                if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 3 && mouseY < blockWidth * 4){
                // New Game
                    levelCount = 0;
                    curLevel = levelList[levelCount];
                    MAIN_MENU = false;
                    DIFFICULTY_SELECT = true;
                } else if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 5 && mouseY < blockWidth * 6){
                // Level Select
                    MAIN_MENU = false;
                    LEVEL_SELECT = true;
                    
                } else if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 9 && mouseY < blockWidth * 10){
                // How To Play 
                    MAIN_MENU = false;
                    HOW_TO_PLAY = true;
                }
            } else if (LEVEL_SELECT){
                if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 4 && mouseY < blockWidth * 5){
                // Level 1
                    levelCount = 0;
                    curLevel = levelList[levelCount];
                    LEVEL_SELECT = false;
                    DIFFICULTY_SELECT = true;
                } else if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 6 && mouseY < blockWidth * 7){
                // Level 2
                    if (maxLevel >= 1){
                        levelCount = 1;
                        curLevel = levelList[levelCount];
                        LEVEL_SELECT = false;
                        DIFFICULTY_SELECT = true;
                    }
                } else if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 8 && mouseY < blockWidth * 9){
                // Back
                    LEVEL_SELECT = false;
                    MAIN_MENU = true;
                }
            } else if (HOW_TO_PLAY){
                if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 8 && mouseY < blockWidth * 9){
                // Back
                    HOW_TO_PLAY = false;
                    MAIN_MENU = true;
                }
            } else if (DIFFICULTY_SELECT){
                if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 4 && mouseY < blockWidth * 5){
                // Normal
                    hardMode = false;
                    IN_MENU = false;
                    DIFFICULTY_SELECT = false;
                    NEW_LEVEL = true;
                    IN_GAME = true;
                } else if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 6 && mouseY < blockWidth * 7){
                // Hard
                    hardMode = true;
                    IN_MENU = false;
                    DIFFICULTY_SELECT = false;
                    NEW_LEVEL = true;
                    IN_GAME = true;
                    
                } else if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 8 && mouseY < blockWidth * 9){
                // Back
                    DIFFICULTY_SELECT = false;
                    LEVEL_SELECT = true;
                }
            } else if (SCORE_SCREEN){
                if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 8 && mouseY < blockWidth * 9){
                // Continue
                    SCORE_SCREEN = false;
                    if (levelCount >= lastLevel){
                        GAME_COMPLETE = true;
                    } else {
                        levelCount += 1;
                        if (levelCount > maxLevel){
                            maxLevel = levelCount;
                        }
                        NEXT_LEVEL_MENU = true;
                    }
                }
            } else if (NEXT_LEVEL_MENU){
                if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 4 && mouseY < blockWidth * 5){
                // Continue
                    curLevel = levelList[levelCount];
                    NEW_LEVEL = true;
                    NEXT_LEVEL_MENU = false;
                    IN_MENU = false;
                    IN_GAME = true;
                } else if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 8 && mouseY < blockWidth * 9){
                // Main Menu
                    NEXT_LEVEL_MENU = false;
                    MAIN_MENU = true;
                }
                
            } else if (GAME_OVER){
                if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 4 && mouseY < blockWidth * 5){
                // Retry
                    IN_MENU = false;
                    GAME_OVER = false;
                    IN_GAME = true;
                    NEW_LEVEL = true;
                    
                } else if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 8 && mouseY < blockWidth * 9){
                // Main Menu
                    GAME_OVER = false;
                    MAIN_MENU = true;
                }
            } else if (GAME_COMPLETE){
                hardModeUnlocked = 1;
                if (mouseX > blockWidth * 2 && mouseX < blockWidth * 5 && mouseY > blockWidth * 8 && mouseY < blockWidth * 9){
                // Main Menu
                    GAME_COMPLETE = false;
                    MAIN_MENU = true;
                }
            } 
            SELECTION = false;
        }
    }
    
    // Sounds 
    
    function hurtSounds(){
        if (playerHurt){
            playerHurtSound.play();
            playerHurt = false;
        }
        if (enemyDead){
            enemyDeadSound.play();
            enemyDead = false;
        }
    }
    
    function weaponSounds(){
        if (pistolFired){
            pistolSound[shotCount].play();
            shotCount += 1;
            pistolFired = false;
            
        } else if (shotgunFired) {
            shotgunSound[shotCount].play();
            shotCount += 1;
            shotgunFired = false;
        } else if (uziFired){
            uziSound[uziShotCount].play();
            uziShotCount += 1;
            uziFired = false;
        }
        
        if (shotCount > 4){
            shotCount = 0;
        }
        if (uziShotCount > 9){
            uziShotCount = 0;
        }
        
        if (enemyFired){
            enemyShotSound[enemyShotCount].play();
            enemyShotCount += 1;
            enemyFired = false;
        }
        
        if (enemyShotCount > 4){
            enemyShotCount = 0;
        }
    }
    
    // Map operations
    
    function drawMap(){
        for (var y = 0; y < level.tilemaps[curRoom].length; y++) {
            for (var x = 0; x < level.tilemaps[curRoom][y].length; x++) {
                var object = level.tilemaps[curRoom][y][x];
                if (object === 'h'){
                    context.drawImage(level.mapAssets[0], x * blockHeight, y * blockHeight, blockWidth, blockHeight);
                    context.drawImage(mapItems[0], x * blockHeight, y * blockHeight, blockWidth, blockHeight);
                } else if (object === 's'){
                    context.drawImage(level.mapAssets[0], x * blockHeight, y * blockHeight, blockWidth, blockHeight);
                    context.drawImage(mapItems[1], x * blockHeight, y * blockHeight, blockWidth, blockHeight);
                } else if (object === 'u'){
                    context.drawImage(level.mapAssets[0], x * blockHeight, y * blockHeight, blockWidth, blockHeight);
                    context.drawImage(mapItems[2], x * blockHeight, y * blockHeight, blockWidth, blockHeight);
                } else {
                    context.drawImage(level.mapAssets[object], x * blockHeight, y * blockHeight, blockWidth, blockHeight);
                }
            }
        }
    }
    
    function checkRoomChange() {
        if (player.centreX < 0) {
            level.exitTo('l');
            NEW_ROOM = true;
        } else if (player.centreX > canvasWidth) {
            level.exitTo('r');
            NEW_ROOM = true;
        } else if (player.centreY < 0) {
            level.exitTo('u');
            NEW_ROOM = true;
        } else if (player.centreY > canvasHeight) {
            level.exitTo('d');
            NEW_ROOM = true;
        }
    }
    
    function checkLevelEnd() {
        if (level.numRoomEnemies['bossRoom'] === 0){
            player.accuracy = Math.round(player.numShotsHit/player.numShotsFired * 100);
            var accuracyMod = (100 + player.accuracy) / 100;
            player.totalScore = Math.round(player.score * accuracyMod);
             
            IN_GAME = false;
            IN_MENU = true;
            SCORE_SCREEN = true;
            
        }
    }
    function populateEnemies() {
        enemies = [];
        for (var i = 0; i < level.numRoomEnemies[curRoom]; i++){
            var roomEnemies = level.roomEnemies[curRoom];
            var num = getRandomNumber(0, roomEnemies.length-1);
            num = roomEnemies[num];
            var enemyName = level.enemyNames[num];
            var enemyStats = fetchEnemy(enemyName);
            var enemy = new GenerateEnemy(context, enemyName, enemyStats);
            enemies.push(enemy);
        } 
        
        if (curRoom === 'bossRoom'){
            enemies[0].x = level.bossInitX;
            enemies[0].y = level.bossInitY
        } else {
            for (var i = 0; i < enemies.length; i++) {
                var X;
                var Y;
                var tilemapItem;
                do {
                    X = getRandomNumber(0, 15);
                    Y = getRandomNumber(0, 11);
                    tilemapItem = level.tilemaps[curRoom][Y][X];
                } while (tilemapItem !== 0);
                
                enemies[i].x = X * blockWidth;
                enemies[i].y = Y * blockHeight;
                
            }
        }
    }
    
    // Player move handling

    function playerMove() {
        if (keyMap[65] && keyMap[87]) {
            player.moveDir = 'UL';
        } else if (keyMap[87] && keyMap[68]) {
            player.moveDir = 'UR';
        } else if (keyMap[68] && keyMap[83]) {
            player.moveDir = 'DR';
        } else if (keyMap[83] && keyMap[65]) {
            player.moveDir = 'DL';
        } else if (keyMap[65]) {
            player.moveDir = 'L';
        } else if (keyMap[87]) {
            player.moveDir = 'U';
        } else if (keyMap[68]) {
            player.moveDir = 'R';
        } else if (keyMap[83]) {
            player.moveDir = 'D';
        } else {
            player.moveDir = null;
        }
    }
    
    function checkWeaponChange(){
        if (player.weaponChange){
            if (keyMap[49]){
                player.weapon = 'pistol';
                player.model.src = './assets/images/playerPistol.png';
                player.cooldown = 12;
                player.damage = 20;
            } else if (keyMap[50]){
                if (player.hasShotgun){
                    player.weapon = 'shotgun';
                    player.model.src = './assets/images/playerShotgun.png';
                    player.cooldown = 30;
                    player.damage = 40;
                }
            } else if (keyMap[51]){
                if (player.hasUzi){
                    player.weapon = 'uzi';
                    player.model.src = './assets/images/playerUzi.png';
                    player.cooldown = 3;
                    player.damage = 15;
                }
            }
            player.weaponChange = false;
        }
    }
    
    function playerShotFired() {
        if (player.shoot){
            if (player.cooldownTimer > player.cooldown){
                if (player.weapon === 'pistol'){
                    var bullet = new GenerateBullet(player, player.radians, 8, 5, 'yellow');
                    playerBullets.push(bullet);
                    pistolFired = true;
                    player.cooldownTimer = 0;
                    player.numShotsFired += 1;
                } else if (player.weapon === 'shotgun'){
                    var bullet1 = new GenerateBullet(player, player.radians, 8, 5, 'yellow');
                    playerBullets.push(bullet1);
                    var bullet2 = new GenerateBullet(player, player.radians+0.3, 8, 5, 'yellow');
                    playerBullets.push(bullet2);
                    var bullet3 = new GenerateBullet(player, player.radians-0.3, 8, 5, 'yellow');
                    playerBullets.push(bullet3);
                    shotgunFired = true;
                    player.cooldownTimer = 0;
                    player.numShotsFired += 3;
                } else if (player.weapon === 'uzi'){
                    var bullet = new GenerateBullet(player, player.radians, 8, 5, 'yellow');
                    playerBullets.push(bullet);
                    uziFired = true;
                    player.cooldownTimer = 0;
                    player.numShotsFired += 1;
                }
            }
        }
        player.cooldownTimer += 1;
    }
    
    function collectItems(){
        if (player.centreX > 0 && player.centreX < canvasWidth && player.centreY > 0 && player.centreY < canvasHeight){
            if (level.tilemaps[curRoom][player.tilemapY][player.tilemapX] === 'h'){
                level.tilemaps[curRoom][player.tilemapY][player.tilemapX] = 0;
                player.health += 50;
                if (player.health > 100){
                    player.health = 100;
                }
            } else if (level.tilemaps[curRoom][player.tilemapY][player.tilemapX] === 's'){
                level.tilemaps[curRoom][player.tilemapY][player.tilemapX] = 0;
                player.hasShotgun = true;
            } else if (level.tilemaps[curRoom][player.tilemapY][player.tilemapX] === 'u'){
                level.tilemaps[curRoom][player.tilemapY][player.tilemapX] = 0;
                player.hasUzi = true;
            }
        }
    }

    
    function updatePosition(object) {
        if (object.moveDir === 'L') {
            var collisionL = tilemapCollision((object.centreX - object.radius - object.speed), object.centreY);
            
            if (!collisionL) {
                object.x -= object.speed;
            }
        } else if (object.moveDir === 'U') {
            var collisionU = tilemapCollision(object.centreX, (object.centreY - object.radius - object.speed));
            
            if (!collisionU) {
                object.y -= object.speed;
            }
        } else if (object.moveDir === 'R') {
            var collisionR = tilemapCollision((object.centreX + object.radius + object.speed), object.centreY);
            
            if (!collisionR) {
                object.x += object.speed;
            }
        } else if (object.moveDir === 'D') {
            var collisionD = tilemapCollision(object.centreX, (object.centreY + object.radius + object.speed));
            
            if (!collisionD) {
                object.y += object.speed;
            }
        } else if (object.moveDir === 'UL') {
            var collisionU = tilemapCollision(object.centreX, (object.centreY - object.radius - object.speed));
            var collisionL = tilemapCollision((object.centreX - object.radius - object.speed), object.centreY);
            
            if (!collisionU) {
                object.y -= object.speed;
            }
            if (!collisionL) {
                object.x -= object.speed;
            }
        } else if (object.moveDir === 'UR') {
            var collisionU = tilemapCollision(object.centreX, (object.centreY - object.radius - object.speed));
            var collisionR = tilemapCollision((object.centreX + object.radius + object.speed), object.centreY);
            
            if (!collisionU) {
                object.y -= object.speed;
            }
            if (!collisionR) {
            object.x += object.speed;
            }
        } else if (object.moveDir === 'DR') {
            var collisionD = tilemapCollision(object.centreX, (object.centreY + object.radius + object.speed));
            var collisionR = tilemapCollision((object.centreX + object.radius + object.speed), object.centreY);
            
            if (!collisionD) {
            object.y += object.speed;
            }
            if (!collisionR) {
            object.x += object.speed;
            }
        } else if (object.moveDir === 'DL') {
            var collisionD = tilemapCollision(object.centreX, (object.centreY + object.radius + object.speed));
            var collisionL = tilemapCollision((object.centreX - object.radius - object.speed), object.centreY);
            
            if (!collisionD) {
            object.y += object.speed;
            }
            if (!collisionL) {
            object.x -= object.speed;
            }
        }
    }

    // Enemy move handling
    
    function enemyMoves() {
        for (var i = 0; i < enemies.length; i++){
            enemies[i].AI();
        }
    }
    
    function updateEnemyPosition(object) {
        if (object.moveDir === 'L') {
            
            var newX = object.centreX - object.radius - object.speed;
            if (newX > 0){
                var collisionL = tilemapCollision(newX, object.centreY);
                
                if (!collisionL) {
                    object.x -= object.speed;
                }
            }
        } else if (object.moveDir === 'U') {
            var newY = object.centreY - object.radius - object.speed;
            if (newY > 0){
                var collisionU = tilemapCollision(object.centreX, newY);
                
                if (!collisionU) {
                    object.y -= object.speed;
                }
            }
        } else if (object.moveDir === 'R') {
            var newX = object.centreX + object.radius + object.speed;
            if (newX < canvasWidth){
                var collisionR = tilemapCollision(newX, object.centreY);
                
                if (!collisionR) {
                    object.x += object.speed;
                }
            }
        } else if (object.moveDir === 'D') {
            var newY = object.centreY + object.radius + object.speed;
            if (newY < canvasHeight){
                var collisionD = tilemapCollision(object.centreX, newY);
                
                if (!collisionD) {
                    object.y += object.speed;
                }
            }
        } else if (object.moveDir === 'UL') {
            var newY = object.centreY - object.radius - object.speed;
            if (newY > 0){
                var collisionU = tilemapCollision(object.centreX, newY);
                if (!collisionU) {
                    object.y -= object.speed;
                }
            }
            var newX = object.centreX - object.radius - object.speed;
            if (newX > 0){
                var collisionL = tilemapCollision(newX, object.centreY);
                if (!collisionL) {
                    object.x -= object.speed;
                }
            }
        } else if (object.moveDir === 'UR') {
            var newY = object.centreY - object.radius - object.speed;
            if (newY > 0){
                var collisionU = tilemapCollision(object.centreX, newY);      
                if (!collisionU) {
                    object.y -= object.speed;
                }
            }
            var newX = object.centreX + object.radius + object.speed;
            if (newX < canvasWidth){
                var collisionR = tilemapCollision(newX, object.centreY);
                if (!collisionR) {
                object.x += object.speed;
                }
            }
        } else if (object.moveDir === 'DR') {
            var newY = object.centreY + object.radius + object.speed;
            if (newY < canvasHeight){
                var collisionD = tilemapCollision(object.centreX, newY);
                if (!collisionD) {
                object.y += object.speed;
                }
            }
            var newX = object.centreX + object.radius + object.speed;
            if (newX < canvasWidth){
                var collisionR = tilemapCollision(newX, object.centreY);
                if (!collisionR) {
                object.x += object.speed;
                }
            }
        } else if (object.moveDir === 'DL') {
            var newY = object.centreY + object.radius + object.speed;
            if (newY < canvasHeight){
                var collisionD = tilemapCollision(object.centreX, newY);       
                if (!collisionD) {
                object.y += object.speed;
                }
            }
            var newX = object.centreX - object.radius - object.speed;
            if (newX > 0){
                var collisionL = tilemapCollision(newX, object.centreY);
                if (!collisionL) {
                object.x -= object.speed;
                }
            }
        }
    }
    
    // Bullet operations

    function checkPlayerBulletCollisions(bulletList){
        var toSplice = [];
        for (var i = 0; i < bulletList.length; i++){
            var bullet = bulletList[i];
            if (bullet.posX < 0 || bullet.posX > canvasWidth || bullet.posY < 0 || bullet.posY > canvasHeight) {
                toSplice.push(i);
            } else if (bulletTilemapCollision(bullet.posX, bullet.posY)){
                toSplice.push(i);
            } else if (enemies.length > 0) {
                for (var j = 0; j < enemies.length; j++){
                    if (enemies[j].alive){
                        if (distanceTo(bullet.posX, bullet.posY, enemies[j].centreX, enemies[j].centreY) < enemies[j].radius) {
                            toSplice.push(i);
                            enemies[j].health -= bullet.damage;
                            player.numShotsHit += 1;
                            if (enemies[j].health <= 0) {
                                enemies[j].die();
                            }
                        }
                    }
                } 
            }
        }
        
        for (var i = 0; i < toSplice.length; i++) {
            bulletList.splice(toSplice[i] - i, 1);
        }
    }

    function checkEnemyBulletCollisions(bulletList){
        var toSplice = [];
        for (var i = 0; i < bulletList.length; i++){
            var bullet = bulletList[i];
            if (bullet.posX < 0 || bullet.posX > canvasWidth || bullet.posY < 0 || bullet.posY > canvasHeight) {
                toSplice.push(i);
            } else if (bulletTilemapCollision(bullet.posX, bullet.posY)){
                toSplice.push(i);
            } else {
                if (distanceTo(bullet.posX, bullet.posY, player.centreX, player.centreY) < player.radius + bullet.radius) {
                    toSplice.push(i);
                    player.health -= bullet.damage;
                    playerHurt = true;
                    if (player.health <= 0) {
                        player.die();
                    }
                }
            }
        } 
        
        for (var i = 0; i < toSplice.length; i++) {
            bulletList.splice(toSplice[i] - i, 1);
        }
    }     

    
    function drawBullets(context, bulletList) {
        for (var i = 0; i < bulletList.length; i++){
            context.beginPath();
            var bullet = bulletList[i];
            context.arc(bullet.posX, bullet.posY, bullet.radius, 0, Math.PI * 2);
            context.fillStyle = bullet.colour;
            context.fill();
            bullet.bulletUpdate();
            
        }
    }
    
    
    // HUD
    
    function drawHUD(){
        context.font = '30px Consola';
        context.strokeStyle = 'black';
        context.fillStyle = 'white';
        context.strokeText("Health: " + player.health, blockWidth/2, blockHeight/2);
        context.fillText("Health: " + player.health, blockWidth/2, blockHeight/2);
        context.strokeText("Score: " + player.score, blockWidth * 13, blockHeight/2);
        context.fillText("Score: " + player.score, blockWidth * 13, blockHeight/2);
        
        context.drawImage(mapItems[3], blockWidth * 3, 0, blockWidth, blockHeight);
        if (player.hasShotgun){
            context.drawImage(mapItems[1], blockWidth * 4, 0, blockWidth, blockHeight);
        }
        if (player.hasUzi){
            context.drawImage(mapItems[2], blockWidth * 5, 0, blockWidth, blockHeight);
        }
        
        
    }
    
        

    
    // Math and other helper functions 
    
    function rotateFollow(model, origX, origY, destX, destY) {
        // Adapted from a JavaScript tutorial at:
        // https://youtu.be/I3Ik81Ku3lA?t=1224
        
        radians = straightLineRads(origX, origY, destX, destY);
        context.save();
        
        context.translate(origX, origY);
        context.rotate(radians);
        context.drawImage(model, -(player.width/2), -(player.height/2));
        
        context.restore();
    }

    
    function straightLineRads(origX, origY, destX, destY) {
        return Math.atan2(destX - origX, - (destY - origY));
    }


    function xyToTileIndices(x, y) {
        var tilemapX = Math.floor( x / blockWidth);
        var tilemapY = Math.floor( y / blockHeight);
        
        return {tilemapX, tilemapY};
    }

    function bulletTilemapCollision(x, y){
        if (x > 0 && x < canvasWidth && y > 0 && y < canvasHeight){
            var result = xyToTileIndices(x, y, blockWidth, blockHeight);
            var Y = result.tilemapY;
            var X = result.tilemapX;
            if (level.tilemaps[curRoom][Y][X] === 1) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }
    
    function tilemapCollision(x, y) {
        if (x > 0 && x < canvasWidth && y > 0 && y < canvasHeight){
            var result = xyToTileIndices(x, y, blockWidth, blockHeight);
            var Y = result.tilemapY;
            var X = result.tilemapX;
            if (level.tilemaps[curRoom][Y][X] === 1 || level.tilemaps[curRoom][Y][X] === 2) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    } 

    
    function getRandomNumber(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    }
        
        
    function square(x) {
        return Math.pow(x, 2);
    }

    
    function distanceTo(origX, origY, destX, destY) {
        return Math.floor(Math.sqrt(square(destX - origX) + square(destY - origY)));
    }

    
    function straightLineRads(origX, origY, destX, destY) {
        return Math.atan2(- (destY - origY), destX - origX);
    }

    
    function simpleCentre(x, size) {
        return x + (size / 2);
    }

    
    function onKeydown(event) {
        var keyCode = event.keyCode;
        keyMap[keyCode] = true;
        if (keyCode === 49){
            keyMap[50] = false;
            keyMap[51] = false;
            player.weaponChange = true;
        } else if (keyCode === 50){
            keyMap[49] = false;
            keyMap[51] = false;
            player.weaponChange = true;
        } else if (keyCode === 51){
            keyMap[49] = false;
            keyMap[50] = false;
            player.weaponChange = true;
        }
    }

    
    function onKeyup(event) {
        var keyCode = event.keyCode;
        if (keyCode === 65 || keyCode === 87 || keyCode === 68 || keyCode === 83){
            keyMap[keyCode] = false;
        }
    }
    
    function getCookie(cname) {
    // From a W3Schools tutorials (https://www.w3schools.com/js/js_cookies.asp)    
    
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

})();
