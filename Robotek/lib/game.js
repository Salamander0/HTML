var st;
var Q = window.Q = Quintus({development: true})
        .include("Sprites, Scenes, Input, 2D, Anim, UI, Touch")
        //.setup({maximize: false, width: window.innerWidth, height: window.innerHeight});
        .setup({maximize: true});

//    Add in the default keyboard controls
//    along with joypad controls for touch
Q.input.keyboardControls();
Q.gravityY = 0;
Q.gravityX = 0;
Q.input.joypadControls();
Q.touch();

Q.scene('hud', function(stage) {
    var container = stage.insert(new Q.UI.Container({
        x: window.innerWidth/2, y: 0
    }));

    var score = container.insert(new Q.UI.Text({x: 20, y: 20,
        label: "Score : " + 0, color: "white", align: "center"
    }));        
});

// Load and start the level
Q.load("tiles.png, tiled_tamz.tmx, lego.png, lego_tamz.json, items.png, items_tamz.json, enemy.png, enemy_tamz.json", function()
{
    Q.sheet("tiles", "tiles.png", {tilew: 32, tileh: 32});
    Q.compileSheets("lego.png", "lego_tamz.json");
    Q.compileSheets("items.png", "items_tamz.json");
    Q.compileSheets("enemy.png", "enemy_tamz.json");
    Q.stageScene("level1");
    Q.stageScene("hud", 1);

});

Q.scene("level1", function(stage)
{
    var background = new Q.TileLayer({dataAsset: 'tiled_tamz.tmx', layerIndex: 0, sheet: 'tiles', tileW: 32, tileH: 32, type: Q.SPRITE_NONE});
    stage.insert(background);
    stage.collisionLayer(new Q.TileLayer({dataAsset: 'tiled_tamz.tmx', layerIndex: 1, sheet: 'tiles', tileW: 32, tileH: 32}));
    player = stage.insert(new Q.Player());
    stage.add("viewport").follow(player);
    stage.insert(new Q.Items({x: 100, y: 100}));
     stage.insert(new Q.Enemy({x: 200, y: 150}));
     stage.insert(new Q.Enemy({x: 300, y: 150}));
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
                                        label: stage.options.label }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene("level1");
    Q.stageScene("hud", 1);
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
                    score: 0
                });
        this.add('2d, animation');
        this.on("hit.sprite", this, "hit");
    },
    hit: function(collision) {
        if (collision.obj.isA("Items")) {
            collision.obj.destroy();
			this.p.score += 5;
            var coinsLabel = Q("UI.Text", 1).items[0];
            coinsLabel.p.label = 'Score : ' + this.p.score;
            yNew = Math.floor((Math.random()*32*9)+30);
            xNew = Math.floor((Math.random()*32*13)+30);
            frameNew = Math.floor((Math.random()*7*17)+1);
            console.log(xNew, yNew, frameNew);
            st.insert(new Q.Items({x: xNew, y: yNew, frame: frameNew}));
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
            	collision.obj.destroy();
	 			Q.stageScene("endGame",1, { label: "You Died\n" + " Score: " + player.p.score }); //
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
        	  sprite: "item"
        	  });
    }
});

Q.animations('enemy', {
	run:{frames:[0,1,2,3,4,5,6,7], rate: 1/5}
});

Q.animations('player', {
    run: {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], next:'stand', rate: 1 / 5},
    stand: {frames: [7], rate: 1 / 2},
});

