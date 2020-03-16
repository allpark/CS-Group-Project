function EnergyProduction() {

    this.name = 'Energy Production Of Countries';

    this.id = 'country-energy-production';

    
    // hold active nodes
    this.nodes;
    
    // holds active displayed country 
    this.activeCountry = null;
    
    // has data been loaded?
    this.loaded = false;

    // custom font
    this.font;
    
    // render texture to render to
    this.frameBuffer0;
    
    // animation stuff
    
    this.animationStartTime  = -1;
    this.animationFinishTime = -1;
    this.animationEnabled    = false;
    this.animationCurrentScale = 1.0;
    
    // colours for showing change
    
    this.deltaColour0 = [200, 29, 37];
    this.deltaColour1 = [255, 255, 255];
    this.deltaColour2 = [8, 126, 139];


    // Layout object to store all common plot layout parameters and methods
    var marginSize = 10;
    
    this.layout = {
        
        marginSize: marginSize,
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize * 6,
        topMargin: marginSize * 10,
        bottomMargin: height - marginSize * 8,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },
        strokeWeight : 1,

    };
    
    this.drawTitle = function(){
        
        let graph = this.frameBuffer0;
     
        graph.fill(0);
        
        graph.textAlign(CENTER, CENTER);
        graph.textStyle(BOLD);
        graph.textSize(25);
        
        graph.text("Energy Production Percentage By Fuel Type", (this.layout.rightMargin + this.layout.leftMargin) * 0.5, 25)
        graph.text(this.activeCountry, (this.layout.rightMargin + this.layout.leftMargin) * 0.5, 60 );
        
        
    }
    this.drawBottomFooter = function(x, y){
        
        let graph = this.frameBuffer0;

        
        
        graph.fill(0);
               
        graph.textAlign(LEFT, CENTER);
        graph.textStyle(BOLD);
        graph.textSize(20);
        
        graph.text("Percent change since 1990: ", x, y);
        
        let gradXOffset   = 300;
        let gradYOffset   = -5;
        
        let gradWidth     = 400;
        let gradHeight    = 20;
        let gradDivisions = 20;
        
        graph.fill(200);
        graph.rect(x + gradXOffset - 1, y + gradYOffset - 1, gradWidth + 2, gradHeight + 2 );
        
        graph.textAlign(CENTER, CENTER);
        graph.textSize(10);
   
        
        for (let i=0; i<gradDivisions; i++){
                
            let w  = gradWidth / gradDivisions;
            
            let x0 = map(i, 0, gradDivisions, 0,  gradWidth);
            let y0 = y;
            
            // calculate color of gradient rect
            
            let col   = this.threePointGradient(
                this.deltaColour0, 
                this.deltaColour1,
                this.deltaColour2, 
                (i/gradDivisions)
            );
            
            graph.fill(col[0], col[1], col[2]); 
            graph.rect(x + x0 + gradXOffset, y0 + gradYOffset, w, gradHeight);
            
            // draw text showing which square represents what percentage
            
            if (i!=0){
                let p = floor(map(i, 0, gradDivisions, -100, 100));
                graph.fill(0);
                graph.text(p, x + x0 + gradXOffset, y0 + gradYOffset - 10);
            
            }
          

            
            
        }
        
    
    }
    this.getCountryAsTree = function(country){
    
        // create initial tree
        let dataAsTree = {
            frame: {x      : this.layout.leftMargin,
                    y      : this.layout.topMargin,
                    width  : this.layout.rightMargin - this.layout.leftMargin, 
                    height : this.layout.bottomMargin - this.layout.topMargin}
        };
        
        
        // update active country name
        this.activeCountry = country;
        
        // search for country's ID within the data column array 
        // and return  a reference to this row 
        
        let row  = this.data.findRow(country, "country");
        
        // convert row data into data as tree
        dataAsTree.nodes = [
            {
             nodes: [
                {label: "coal", delta : row.getNum(5), weight: row.getNum(1)},
                {label: "nuclear",  delta : row.getNum(6), weight: row.getNum(2)},
                {label: "gas",  delta : row.getNum(7), weight: row.getNum(3)},
                {label: "renewables", delta : row.getNum(8), weight: row.getNum(4)}
              ]         
            }
        ]
        
        
    
        return dataAsTree;
        
        
    }

    this.preload = function() {
        
        // load font
        this.font = loadFont("./resources/Aaargh.ttf");
        
        var self = this;
        this.data = loadTable(
        './datasets/energy_production/2019.txt', 'txt', 'header',
        function(table) {
            self.loaded = true;
        });
        
        
    };
    
    
    this.startAnimation = function(){
    
        this.animationStartTime  = millis() * 0.001;
        this.animationDuration   = 2;
        this.animationEnabled    = true;
        this.animationCurrentScale = 0.0;
        
    }
    
    this.animationThink = function(){
        
        if (this.animationEnabled){
            
            if (millis() * 0.001 > this.animationStartTime + this.animationDuration){
                
                this.animationEnabled = false;
                this.animationCurrentScale = 1.0;
                
            }
            
            else{
                
                this.animationCurrentScale = map(
                    millis() * 0.001,
                    this.animationStartTime,
                    this.animationStartTime + this.animationDuration,
                    0.0,
                    1.0
                )    
            }
        }    
    }
    
    this.getAnimationScale = function(){
        return this.animationCurrentScale;
    }
    
    this.scaleRect = function(x, y, w, h, i){
        
        let newW = w * i;
        let newH = h * i;

        let newX = x + (w * (1.0 - i) * 0.5);
        let newY = y + (h * (1.0 - i) * 0.5);

        return {
            x: newX,
            y: newY,
            w: newW,
            h: newH
        }
    }
    this.setup = function() {
        
        this.frameBuffer0 =  createGraphics(width, height);

        // Font defaults.
        this.frameBuffer0.textFont(this.font);
        this.frameBuffer0.textAlign('center', 'center');
        this.frameBuffer0.textStyle(BOLD);

        // create new tree for displaying hierarchal data 
        this.tree = new treeMap();
        
        // squarify the hierarchal data 
        this.tree.squarifyMain(this.getCountryAsTree("United Kingdom"));
        
        // save nodes to this.nodes
        this.nodes = this.tree.getCollapsedNodes();
        
        // start animating 
        this.startAnimation();
    
        
    };
    
    this.twoPointGradient = function(col0, col1, alpha){
        
        return [
            lerp(col0[0], col1[0], alpha),
            lerp(col0[1], col1[1], alpha),
            lerp(col0[2], col1[2], alpha)
        ]
    }
    this.threePointGradient = function(col0, col1, col2, alpha){
        
        let alpha01 = alpha * 2.0;
        let alpha12 = (alpha - 0.5) * 2.0;
        
        if (alpha < 0.5){
            return [
                lerp(col0[0], col1[0], alpha01),
                lerp(col0[1], col1[1], alpha01),
                lerp(col0[2], col1[2], alpha01)
            ]

        }
        else
        {
            
            return [
                lerp(col1[0], col2[0], alpha12),
                lerp(col1[1], col2[1], alpha12),
                lerp(col1[2], col2[2], alpha12)
            ]
            
            
        }
       
    }  
    
    this.getNodeDrawTextSize = function(node){
        
        let tree = this.tree;
        
        let canvasSize = { 
            width : this.layout.rightMargin - this.layout.leftMargin,
            height : this.layout.bottomMargin - this.layout.topMargin
        }
        let tileSize  = {
            width  : node.frame.width,
            height : node.frame.height
        }   
        
        return tree.fontSize(canvasSize, tileSize);
     
    }
    
   
    this.drawNodes = function(){
        
        
        let graph = this.frameBuffer0;

        let nodes = this.nodes;
        let tree  = this.tree;
  
        let scale = smoothstep(0.0, 1.0, this.getAnimationScale());
 
        for (let i=0; i<nodes.length; i++){

            let node = nodes[i];
            
            let x = node.frame.x;
            let y = node.frame.y;
            
            let w = node.frame.width;
            let h = node.frame.height;
            
            let delta = node.delta;
            let label = node.label;
            let percentage = round((node.weight / tree.getTotalWeight()) * 100.0, 1);
     
    
            // remap delta to be between 0 and 1 
            // calculate colour
            let deltaAlpha = ((delta + 100) * 0.5) / 100;
            let colFinal   = this.threePointGradient(this.deltaColour0, this.deltaColour1, this.deltaColour2, deltaAlpha * scale);
            
            // draw rectangle 
    
            graph.fill(colFinal[0], colFinal[1], colFinal[2], scale * 255);
            
            let scaledRect = this.scaleRect(x, y, w, h, scale);
            graph.rect(scaledRect.x, scaledRect.y, scaledRect.w, scaledRect.h);
        
            // draw text
            let fontSize = this.getNodeDrawTextSize(node) * 0.8;
            
            graph.fill(0,0,0, 255 * scale ** 4);
            
            graph.textAlign(LEFT, TOP)
            graph.noStroke();
            graph.textSize(20);
        
            // draw label 
            graph.text(label, scaledRect.x + w * 0.025, scaledRect.y);
            
            // draw percentage %
            graph.textAlign(CENTER, CENTER)
            graph.textSize(fontSize * 0.5);
            graph.text(percentage + "%", x + w * 0.5, y + h * 0.5)

            
        }
        
        
    }
    this.drawBackground = function(){
        
        let graph = this.frameBuffer0;
        
        graph.fill(55,55,55,255 * this.animationCurrentScale);
        graph.rect(this.layout.leftMargin - this.layout.strokeWeight, 
             this.layout.topMargin - this.layout.strokeWeight ,
             this.layout.rightMargin - this.layout.leftMargin + this.layout.strokeWeight * 2.0, 
             this.layout.bottomMargin - this.layout.topMargin + this.layout.strokeWeight * 2.0,
        )
        
        
    }
    this.draw = function() {

        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        this.frameBuffer0.background(255);
        
        this.animationThink();
        
        this.drawBackground();
        this.drawNodes();
        
        this.drawTitle();
        this.drawBottomFooter(this.layout.leftMargin, this.layout.bottomMargin + 40);
        
        
        image(this.frameBuffer0, 0.0, 0.0, width, height);
        
    };


}
