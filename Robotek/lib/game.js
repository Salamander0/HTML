var st;
var Q = window.Q = Quintus({development: true, audioSupported: ['mp3']})
        .include("Sprites, Scenes, Input, 2D, Anim, UI, Touch, Audio")
        .enableSound()
        .setup({maximize: true});

Q.gravityY = 0;
Q.gravityX = 0;
Q.input.keyboardControls();
Q.input.joypadControls();
Q.touch();

var levelAssets = [
	["Items", {x: 1110, y: 328, frame: 9}],
    ["Items", {x: 1110, y: 408, frame: 9}],
    ["Items", {x: 1070, y: 360, frame: 9}],
    ["Items", {x: 1150, y: 360, frame: 9}],
    ["Items", {x: 50, y: 900, frame: 9}],
	["Items", {x: 78, y: 900, frame: 9}],
	["Items", {x: 115, y: 900, frame: 9}], 
    ["Items", {x: 1475, y: 900, frame: 9}],
["Items", {x: 1475, y: 873, frame: 9}],
["Items", {x: 1430, y: 873, frame: 9}],
["Items", {x: 1392, y: 873, frame: 9}],
["Items", {x: 1392, y: 900, frame: 9}],
["Items", {x: 1430, y: 900, frame: 9}],
["Items", {x: 343, y: 280, frame: 3}],
["Items", {x: 1220, y: 540, frame: 9}],
["Items", {x: 978, y: 540, frame: 9}],
["Items", {x: 978, y: 680, frame: 9}],
["Items", {x: 1220, y: 680, frame: 9}],
["Items", {x: 1411, y: 56, frame: 9}],
["Items", {x: 1097, y: 56, frame: 9}],
["Items", {x: 736, y: 56, frame: 9}],
["Items", {x: 357, y: 56, frame: 9}],
["Items", {x: 316, y: 641, frame: 32}],
["Items", {x: 591, y: 856, frame: 32}],
["Items", {x: 1219, y: 449, frame: 32}],
["Items", {x: 1475, y: 458, frame: 54}],
["Items", {x: 813, y: 540, frame: 54}],
["Items", {x: 746, y: 424, frame: 54}],
["Items", {x: 444, y: 417, frame: 54}],
["Enemy", {x: 343, y: 330}],
["Enemy", {x: 385, y: 641}],
["Enemy", {x: 732, y: 545}],
["Enemy", {x: 1121, y: 599}],
["Enemy", {x: 1222, y: 56}],
["Enemy", {x: 1182, y: 313}],
["Enemy", {x: 479, y: 56}],
["Blockage", {x:788, y:300, frame:55}],
["Blockage", {x:788, y:330, frame:55}]
];

Q.scene('hud', function(stage) {
    var container = stage.insert(new Q.UI.Container({
        x: window.innerWidth/2, y: 0
    }));

    var score = container.insert(new Q.UI.Text({x: 20, y: 20,
        label: "Score : " + player.p.score, color: "white", align: "center"
    })); 
    var health = container.insert(new Q.UI.Text({x:(window.innerWidth/2 -80), y: 20,
        label: "Health: " + player.p.health, color: "red", align: "right"
    }));
    var strength = container.insert(new Q.UI.Text({x: (-window.innerWidth/2 +80), y: 20,
        label: "Strength: +" + player.p.strength, color: "blue", align: "right"
    })); 
    var audiobutton = container.insert(new Q.UI.Button({ x: (window.innerWidth/2 -60), y: (window.innerHeight -32), fill: "#CCCCCC",
                                           label: "Audio" }, function() {
                                           	if(audio){
                                           		Q.audio.stop();
                                           		audio = false;
                                           		}
                                           	else{
                                           		audio = true;
                                           		Q.audio.play('Into_the_fog.mp3',{ loop: true });                                    		
                                           	}}));

  });

// Load and start the level
Q.load("tiles.png, tiled_tamz.tmx, lego.png, lego_tamz.json, items.png, items_tamz.json, magic.mp3, boss.png, boss_tamz.json, enemy.png, enemy_tamz.json, rock.mp3, heal.mp3, Into_the_fog.mp3, OOT_Get_Rupee.mp3, chest.mp3, sword.mp3, sworddraw.mp3, defend.mp3", function()
{
    Q.sheet("tiles", "tiles.png", {tilew: 32, tileh: 32});
    Q.compileSheets("lego.png", "lego_tamz.json");
    Q.compileSheets("items.png", "items_tamz.json");
    Q.compileSheets("enemy.png", "enemy_tamz.json");
    Q.compileSheets("boss.png", "boss_tamz.json");
    Q.stageScene("level1");
    Q.stageScene("hud", 2);
});

Q.scene("level1", function(stage)
{
    var background = new Q.TileLayer({dataAsset: 'tiled_tamz.tmx', layerIndex: 0, sheet: 'tiles', tileW: 32, tileH: 32, type: Q.SPRITE_NONE});
    stage.insert(background);
    stage.collisionLayer(new Q.TileLayer({dataAsset: 'tiled_tamz.tmx', layerIndex: 1, sheet: 'tiles', tileW: 32, tileH: 32, type: Q.SPRITE_DEFAULT}));
    player = stage.insert(new Q.Player());
    stage.add("viewport").follow(player);

    stage.loadAssets(levelAssets);
    audio = true;
    spawned = false;
    bosslives = 3;
    Q.audio.play('Into_the_fog.mp3',{ loop: true });
     
    stage.viewport.scale = 1;
    if (window.innerWidth <= 240) {
    	stage.viewport.scale = 0.5;
    }
    if (window.innerWidth <= 480) {
    	stage.viewport.scale = 0.75;
    } else if (window.innerWidth >= 768) {
    	stage.viewport.scale = 2;
    }
    st = stage;
    
});

Q.scene('endGame',function(stage) {
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                           label: "Play Again" }));    
  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                        label: stage.options.label,
                                        color: "red" }));
  button.on("click",function() {
    Q.clearStages();
    Q.audio.stop();
    Q.stageScene("level1");
    Q.stageScene("hud", 2);
  });
  box.fit(20);
});

Q.scene('info',function(stage) {
	Q.stage(0).pause();
	Q.stageScene("hud", 2); 
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                           label: "OK" }));    
  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                        label: stage.options.label,
                                        color: "white" }));
  button.on("click",function() {
    Q.clearStage(1);
    Q.stageScene("hud", 2);
    Q.stage(0).unpause(); 
  });
  box.fit(20);
});

Q.scene('fight',function(stage) {
	Q.stage(0).pause();
	Q.stageScene("hud", 2);
	
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var attack = box.insert(new Q.UI.Button({ x: -60, y: 0, fill: "#CCCCCC",
                                           label: "Attack" }));
  var defend = box.insert(new Q.UI.Button({ x: 60, y: 0, fill: "#CCCCCC",
                                           label: "Run" }));                                             
  var label = box.insert(new Q.UI.Text({x:0, y: -10 - attack.p.h, 
                                        label: stage.options.label,
                                        color: "white" }));
                                        
  attack.on("click",function() {
  	if(audio)Q.audio.play('sword.mp3');
  	if(((Math.random()*50)+(player.p.strength*2)) >30){
  		if(Math.random() < 0.5){player.p.strength +=1;}
    	Q.clearStage(1);
    	Q.stageScene("hud", 2);
    	Q.stage(0).unpause();
   	}else {
   		player.p.health -=20;
   		Q.stageScene("hud", 2);
   		if(player.p.health<=0){
   			Q.audio.stop();
   			Q.stageScene("endGame",1, { label: "You Died\n" + " Score: " + player.p.score }); //
   		}
   	}
  });
  defend.on("click",function() {
  	if(audio)Q.audio.play('defend.mp3');
  	st.insert(new Q.Enemy({x: player.p.x-40, y: player.p.y+40}));
  	Q.clearStage(1);
    Q.stageScene("hud", 2);
    Q.stage(0).unpause();
  });
  
  box.fit(20);
});


Q.scene('bossfight',function(stage) {
	Q.stage(0).pause();
	Q.stageScene("hud", 2);
	
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var attack = box.insert(new Q.UI.Button({ x: -60, y: 0, fill: "#CCCCCC",
                                           label: "Attack" }));
  var defend = box.insert(new Q.UI.Button({ x: 60, y: 0, fill: "#CCCCCC",
                                           label: "Run" }));                                             
  var label = box.insert(new Q.UI.Text({x:0, y: -10 - attack.p.h, 
                                        label: stage.options.label,
                                        color: "white" }));
                                        
  attack.on("click",function() {
  	if(audio){Q.audio.play('sword.mp3');}
  	if(((Math.random()*50)+(player.p.strength*2)) >(35+(5-bosslives))){
  		if(bosslives>1){
  			st.insert(new Q.Boss({x: player.p.x-40, y: player.p.y+40}));
  			bosslives -=1;
  			Q.clearStage(1);
    		Q.stageScene("hud", 2);
    		Q.stage(0).unpause();
  		}else {
  			Q.audio.stop();
  			Q.stageScene("endGame",1, { label: "The Winner is YOU!" + " Score: " + player.p.score }); //	
  			if(audio){Q.audio.play('magic.mp3');};
  		}
   	}else {
   		player.p.health -=20;
   		Q.stageScene("hud", 2);
   		if(player.p.health<=0){
   			Q.audio.stop();
   			Q.stageScene("endGame",1, { label: "You Died\n" + " Score: " + player.p.score }); //
   		}
   	}
  });
  defend.on("click",function() {
  	if(audio)Q.audio.play('defend.mp3');
  	st.insert(new Q.Boss({x: player.p.x-40, y: player.p.y+40}));
  	Q.clearStage(1);
    Q.stageScene("hud", 2);
    Q.stage(0).unpause();
  });
  
  box.fit(20);
});

Q.Sprite.extend("Player", {
    init: function(p) {
        this._super(p,
                {x: 50,
                    y: 50,
                    sprite: "player",
                    sheet: "player",
                    score: 0,
                    strength: 0,
                    health: 100
                });
        this.add('2d, animation');
        this.on("hit.sprite", this, "hit");
        Q.input.on("fire",this,"getxy");
    },
    hit: function(collision) {
        if (collision.obj.isA("Items")) {
        	switch(collision.obj.p.frame){
        		case 9: this.p.score += 5;
        				if(audio)Q.audio.play('OOT_Get_Rupee.mp3');
        				var coinsLabel = Q("UI.Text", 2).items[0]; 
						coinsLabel.p.label = 'Score : ' + this.p.score; 
        				break;
        		case 3: this.p.score += 25;
        				if(audio)Q.audio.play('chest.mp3');
        				var coinsLabel = Q("UI.Text", 2).items[0]; 
						coinsLabel.p.label = 'Score : ' + this.p.score; 
        				break;
        		case 32: this.p.strength +=1;
        				if(audio)Q.audio.play('sworddraw.mp3');
        				var strengthLabel = Q("UI.Text", 2).items[2]; 
						strengthLabel.p.label = 'Strength : +' + this.p.strength; 
        				break;
        		case 54: if(this.p.health<100){this.p.health +=20;}
        				if(audio)Q.audio.play('heal.mp3');
        				var healthLabel = Q("UI.Text", 2).items[1]; 
						healthLabel.p.label = 'Health : ' + this.p.health; 
        				break;
        				
        	}         
			collision.obj.destroy();      
        }
    },
    step: function(dt) {
        // grab the entity's properties
        // for easy reference
        var p = this.p;
		
        // rotate the player
        if (Q.inputs['left']){
        	this.play("run");
            p.x = p.x - p.w/4;
            p.angle = 30;
        } else if (Q.inputs['right']) {
        	this.play("run");
        	p.x = p.x + p.w/4;
            p.angle = -30;
        }
        if (Q.inputs['up']){
        	this.play("run");
        	p.y = p.y - p.h/4;
            p.angle = 0;
        }else if (Q.inputs['down']){
        	this.play("run");
        	p.y = p.y + p.h/4;
            p.angle = 0;
        }
    },
    getxy: function(){
    	//console.log(this.p.x, this.p.y);
    	console.log( "[\"Items\", {x: "+this.p.x+", y: "+this.p.y+", frame: 9}]" );
    	//console.log(Math.random() * ((20+player.p.strength) - 1));
    }
});

Q.Sprite.extend("Enemy", {
	init: function(p) {
        this._super(p,
                {   x: 0,
                    y: 0,
                	sprite: "enemy",
                    sheet: "enemy",
                    direction: 'left'
                });
        this.add('2d, animation');
        this.on("hit.sprite", this, "hit");        
        this.on("bump.bottom",function(collision){
        	if (!collision.obj.isA("Enemy")){
      		this.p.direction = 'up';
      		}
      });
        this.on("bump.top",function(collision){
        	if (!collision.obj.isA("Enemy")){
      		this.p.direction = 'down';
      		}
      });
        this.on("bump.left",function(collision) {
        	if (!collision.obj.isA("Enemy")){
      		this.p.direction = 'right';
      		}
      });
        this.on("bump.right",function(collision) {
        	if (!collision.obj.isA("Enemy")){
      		this.p.direction = 'left';
      		}
      });
    },
    hit: function(collision) {
        if (collision.obj.isA("Player")) {
            	this.destroy();
	 			Q.stageScene("fight",1, { label: "Fight"}); //
	 		}
	 	},
	 step: function(dt){
	 	var p = this.p;
	 	this.play("run");
	 	
	 	
	 	 if(Math.random() < 0.05) {
      		p.direction = Math.random() < 0.5 ? 'left' : 'right';
    	}else if(Math.random() < 0.05) {
      		p.direction = Math.random() < 0.5 ? 'up' : 'down';
		}
    		// Add velocity in the direction we are currently heading.
    	//console.log(p.direction);
   		switch(p.direction) {
    	  	case "left": p.x = p.x - p.w/16;
    	  				break;
   			case "right":p.x = p.x + p.w/16;
   						break;
      		case "up":   p.y = p.y - p.h/16;
      					break;
      		case "down": p.y = p.y + p.h/16;
      					break;
    		}	
    }
});

Q.Sprite.extend("Boss", {
	init: function(p) {
        this._super(p,
                {   x: 0,
                    y: 0,
                	sprite: "boss",
                    sheet: "boss",
                    direction: 'left'
                });
        this.add('2d, animation');
        this.on("hit.sprite", this, "hit");        
        this.on("bump.bottom",function(collision){
        	if (!collision.obj.isA("Enemy")){
      		this.p.direction = 'up';
      		}
      });
        this.on("bump.top",function(collision){
        	if (!collision.obj.isA("Enemy")){
      		this.p.direction = 'down';
      		}
      });
        this.on("bump.left",function(collision) {
        	if (!collision.obj.isA("Enemy")){
      		this.p.direction = 'right';
      		}
      });
        this.on("bump.right",function(collision) {
        	if (!collision.obj.isA("Enemy")){
      		this.p.direction = 'left';
      		}
      });
    },
    hit: function(collision) {
        if (collision.obj.isA("Player")) {
            	this.destroy();
	 			Q.stageScene("bossfight",1, { label: "Boss Fight!"}); //
	 		}
	 	},
	 step: function(dt){
	 	var p = this.p;
	 	this.play("run");
	 	
	 	
	 	 if(Math.random() < 0.05) {
      		p.direction = Math.random() < 0.5 ? 'left' : 'right';
    	}else if(Math.random() < 0.05) {
      		p.direction = Math.random() < 0.5 ? 'up' : 'down';
		}
    		// Add velocity in the direction we are currently heading.
    	//console.log(p.direction);
   		switch(p.direction) {
    	  	case "left": p.x = p.x - p.w/16;
    	  				break;
   			case "right":p.x = p.x + p.w/16;
   						break;
      		case "up":   p.y = p.y - p.h/16;
      					break;
      		case "down": p.y = p.y + p.h/16;
      					break;
    		}	
    }
});

Q.Sprite.extend("Items", {
    init: function(p) {
        this._super(p,
        	 {sheet: "item",
        	  sprite: "item",
        	  type: Q.SPRITE_DEFAULT
        	  });
    }
});

Q.Sprite.extend("Blockage", {
    init: function(p) {
        this._super(p,
        	 {sheet: "item",
        	  sprite: "item",
        	  type: Q.SPRITE_DEFAULT
        	  });
       this.add('2d');
       this.on("hit.sprite", this, "hit");
    },
    hit: function(collision) {
        if (collision.obj.isA("Player")) {
            	if(player.p.strength<3){
	 				Q.stageScene("info",1, { label: "Your strength must be at least 3 to pass!"}); //
	 				player.p.x = player.p.x + 20;
	 			}else {
	 				this.destroy();
	 				if(audio)Q.audio.play('rock.mp3');
	 				if(!spawned){
	 					st.insert(new Q.Boss({x: 594, y: 354}));
	 					spawned = true;
	 				}
	 			};
	 		}
	 	}
});

Q.animations('enemy', {
	run:{frames:[0,1,2,3,4,5,6,7], rate: 1/5}
});

Q.animations('boss', {
	run:{frames:[0,1,2,3,4,5,6,7], rate: 1/5}
});

Q.animations('player', {
    run: {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], next:'stand', rate: 1 / 5},
    stand: {frames: [7], rate: 1 / 2}
});

