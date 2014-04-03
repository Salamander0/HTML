var st;
var Q = window.Q = Quintus({development: true})
        .include("Sprites, Scenes, Input, 2D, Anim, UI, Touch")
        .setup({maximize: false, width: window.innerWidth, height: window.innerHeight});
//        .setup({maximize: true});

//    Add in the default keyboard controls
//    along with joypad controls for touch
Q.input.keyboardControls();
Q.gravityY = 0;
Q.gravityX = 0;
Q.input.touchControls({
  controls:  [ ['left','<' ],
               ['up','^'],
               [],
               ['down', 'v' ],
               ['right','>' ]
]
});
Q.input.joypadControls();
Q.controls();

Q.scene('hud', function(stage) {
    var container = stage.insert(new Q.UI.Container({
        x: window.innerWidth/2, y: 0
    }));

    var score = container.insert(new Q.UI.Text({x: 20, y: 20,
        label: "Score: " + 0, color: "white", align: "center"}));
});

// Load and start the level
Q.load("tiles.png, tiled_tamz.tmx, lego.png, lego_tamz.json, items.png, items_tamz.json", function()
{
    Q.sheet("tiles", "tiles.png", {tilew: 32, tileh: 32});
    Q.compileSheets("lego.png", "lego_tamz.json");
    Q.stageScene("level1");
    Q.stageScene("hud", 1);

});

Q.scene("level1", function(stage)
{
    var background = new Q.TileLayer({dataAsset: 'tiled_tamz.tmx', layerIndex: 0, sheet: 'tiles', tileW: 32, tileH: 32, type: Q.SPRITE_NONE});
    stage.insert(background);
    stage.collisionLayer(new Q.TileLayer({dataAsset: 'tiled_tamz.tmx', layerIndex: 1, sheet: 'tiles', tileW: 32, tileH: 32}));
    var player = stage.insert(new Q.Player());
    stage.add("viewport").follow(player);
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


Q.component("robotControl", {
    defaults: {speed: 7, direction: 'up'},

    added: function() {
        var p = this.entity.p;

        // add in our default properties
        Q._defaults(p, this.defaults);

        // every time our entity steps
        // call our step method
        this.entity.on("step", this, "step");
        this.entity.on("hit", this, "hit");
		this.entity.play("run");
    },
    step: function(dt) {
        // grab the entity's properties
        // for easy reference
        var p = this.entity.p;

        // rotate the player
        if (Q.inputs['left'])
        {
            p.x = p.x - p.w/4;
            p.angle = 30;
        }
        if (Q.inputs['right'])
        {
        	p.x = p.x + p.w/4;
            p.angle = -30;
        }
        if (Q.inputs['up'])
        {
        	p.y = p.y - p.h/4;
            p.angle = 0;
        }
        if (Q.inputs['down'])
        {
        	p.y = p.y + p.h/4;
            p.angle = 0;
        }
    }
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
        this.add('2d, animation, robotControl');
        this.on("hit.sprite", this, "hit");
    },
    hit: function(collision) {
        if (collision.obj.isA("Items")) {
            collision.obj.destroy();

            var coinsLabel = Q("UI.Text", 1).items[0];
            //coinsLabel.p.label = 'Score : ' + this.p.score;
            //st.insert(new Q.Items({x: xNew, y: yNew, frame: frameNew}));
        }
    }
});

/*Q.Sprite.extend("Items", {
    init: function(p) {
        this._super(p, {sheet: "item", sprite: "item"});
    }
});*/

Q.animations('player', {
    run: {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], rate: 1 / 10},
    stand: {frames: [7], rate: 1 / 2}

});

