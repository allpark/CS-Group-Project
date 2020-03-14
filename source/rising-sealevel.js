
function RisingSeaLevel(){
    
    // name 
    this.name = "Ice Caps & Sea Level";
    
    // id 
    this.id   = "rising-sealevel";
    
    // internal rendering variables. Do not touch.
    this.internals = {x : 0, y : 0, tox : 0, toy : 0, w : 0, tow : 0, h : 0, toh : 0, zoom : 0.1};
    
    // render targets
    this.frameBufferMap;
    this.frameBufferMap2;
    this.frameBufferHeightMap;
    this.frameBufferOutput;
    this.frameBufferGraph; 
    this.frameBufferGraph2; 

    this.hasSetup   = false;
    
    // shaders
    this.shaderFloodMap;
    this.shaderBlur;

    // base map showing continents and countries drawn nicely
    this.worldMapBase;
    
    // base map showing continents and countries but no ice caps
    this.worldMapBase2;
    
    // height map 
    this.worldMapHeight;
    
    // gradient texture for flood visualization
    this.gradientTexture;
    
    // gradient ramp explainer 
    this.gradientInfoTex;
    
    // texture for endangered areas 
    
    this.warningTexture;
    
    // year cursor image
    this.yearCursorImage;

    // flood map mode 
    
    this.floodMapMode = 0;
    
    // buttons
    this.buttons = [];
    
    //=============================== visualization graph variables =========================  \\
    
    // for drawing expandable margin 
    var graphMarginSize = 35;
    this.marginExpanded = false;
    this.marginLeft     = 35;
    this.marginCurrentOffset = 0;
    this.yearSliderHeight = 60;
    
    this.currentZoom    = 1;
    
    // vars related to delayed update map position
    this.delayedUpdatePosCurTime  = -1;
    this.delayedUpdatePosDuration = -1;
    this.delayedUpdatePosCoord    = [-1,-1];
    
    // maximum displayed future year
    this.futureYearMax  = 20000;
    


    //Title to display above the plot.
    this.graph = {
        
       
        title : "SATELLITE DATA: 1993-PRESENT",
        
        xAxisLabel : "YEAR",
        yAxisLabel : "Sea Height Variations (mm)",
        
        
        //imprecision
        imprecision : 4,
		
        // properties related to scope of displayed data
        domainX     : [-1,-1],
        domainY     : [-1, -1],
        orgDomainX  : [-1, -1],
        orgDomainY  : [-1, -1],
        
        // mouse zoom variables
        mouseZoomStartX : -1,
        mouseZoomEndX   : -1,
        mouseBeginZoom  : false,
        
        // highlight year / samplel point variables
        drawHighlightedDataPoint : true,
        highlightedDataPointIndex : -1,
        
        // zoom stuff
        zoomInfoImage : null,
        zoomResetEnable : false,
        zoomOutOldPred  : -1,
        zoomOutPredChanged : true,
        zoomOutEnable      : true,
        
        // line of best fit
        drawPredictions : true,
        predictionDivisions : 4,
        
        // draw graph?
        
        shouldDraw : true,
        shouldRedraw  : true
        
        
        
        
    }


    // Layout object to store all common plot layout parameters and
    // methods.
    
    this.layout = {
        marginSize: graphMarginSize,

        // Margin positions around the plot. Left and bottom have double
        // margin size to make space for axis and tick labels on the canvas.
        leftMargin: graphMarginSize * 2,
        rightMargin: 800,
        topMargin: graphMarginSize + 80,
        bottomMargin: height - graphMarginSize * 3,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },

        // Boolean to enable/disable background grid.
        grid: true,
        
        // show data entry info on mouse proximity 
        drawDataEntryInfo : true,
        dataEntryInfoOffset   : [-10, -10],
        dataEntryInfoRound    : 2,
        dataEntryDistanceDraw : 16,
        

        // start drawing labels at year divisible by n ?
        plotXTickLabelStartYearDiv : 5,
        plotXTickLabelYearDiv      : 5,
        plotXTickLabelYearDivMod   : 0,
        plotYTicksMax              : 5
        
  
    };

    

    
    // Property to represent whether data has been loaded.
    this.loaded = false;


    //============================== end of visualization graph variables =======================\\
    
    this.preload = function(){
        
        // load textures 
        this.worldMapBase   = loadImage("datasets/map.png");
        this.worldMapBase2  = loadImage("datasets/map_noicecaps.png");
        
        this.worldMapHeight  = loadImage("datasets/topology_6400m_25m_ds.png"); 
        this.gradientTexture = loadImage("datasets/gradient.png"); 
        this.warningTexture  = loadImage("datasets/warning_checker.png"); 
        this.gradientInfoTex = loadImage("datasets/grad_info.png");

        this.yearCursorImage = loadImage("graphs/year_cursor.png");
        
        this.loadShaders();
        this.loadDataSet();
        
    }
    
    this.loadDataSet = function(){

        var self     = this;
        this.data    = loadTable("datasets/gmsl/gmsld_topex_poseidon_1993_2019.txt", "txt", "header", 
                              
        function(table){
            self.processData();
            
            self.loaded = true;
        }
        );
        
        this.dataAsTensor = null;
    }

    
    this.processData = function(){
        
        // process data and fit it so the final column of data table contains
        // smoothed 60-day gasussian type filter with respect to 20-year mean
        
        let data = this.data;
        
        let gmslData = data.getColumn(10);
        let gmslMean = mean(gmslData);
        
        // output column
        let gmslReal = [];
        
        // subtract 20+ year mean 
        for (let i=0; i<gmslData.length; i++){
            gmslReal.push(gmslData[i] - gmslMean);
        }
    
        // get minimum of gmsl 
        let gmslMin = min(gmslReal);
        
        // add new column to data 
        data.addColumn("gmsl-variation-mm");
        
        // add gmsl variation (mm) data to this new column 
        for (let i=0; i<gmslReal.length; i++){
            data.set(i, "gmsl-variation-mm", (gmslReal[i] - gmslMin));
        }
     
    }
    this.setupRenderTargets = function(){
        
        // map render textures 
        this.frameBufferMap       =  createGraphics(width, height);
        this.frameBufferMap2      =  createGraphics(width, height);
        
        this.frameBufferHeightMap =  createGraphics(width, height);
        this.frameBufferOutput    =  createGraphics(width, height, WEBGL);
        
        // graph 
        this.frameBufferGraph     =  createGraphics(width, height);
        
        // graph render target for drawing data points
        // too many data points drawn will lead to a drop in FPS
        this.frameBufferGraph2     =  createGraphics(width, height);

        
    }
    
    this.loadShaders = function(){
        this.shaderFloodMap = loadShader('resources/floodmap.vert', 'resources/floodmap.frag');
    }

    this.setup  = function(){
        
        if (!this.hasSetup){
        
            // map related stuff
            this.setupButtons();
            this.setupRenderTargets();
            this.setupInternalVariables();   
           
            // setup graph's TF neural network and tensor data
            this.setupPredictor();
            this.setupGraph();
            this.graphZoomToolEnable(false);
            this.graphSetNiceYAxisScale();
            
            this.hasSetup = true;   
            
            
        }

    }
    
    this.destroy = function(){
        this.seaLevelSlider.remove(); 
    }

    this.fitImageDimsToScreen = function(img){

        let imgW = img.width;
        let imgH = img.height;

        // get screen bounding box

        let scrW = this.getMapWidth() ;
        let scrH = height;

        // find out which one of the dims (w or h) of img is the least largest 
        // decide whether to resize based on width or height 

        let imgMinDim  = min(imgW, imgH);
        let resizeW    = imgMinDim == imgW ? true : false;

        // compute scale factor given min dim 
        let scaleFactor = resizeW ? scrW / imgMinDim : scrH / imgMinDim;
        // output re-computed image coordinates
        return [imgW * scaleFactor, imgH * scaleFactor]


    }
    
    
    this.setupInternalVariables = function(){
        
        let imgWidthHeight = this.fitImageDimsToScreen(this.worldMapBase);

        this.internals.w   = imgWidthHeight[0];
        this.internals.tow = imgWidthHeight[0]; 

        this.internals.h   = imgWidthHeight[1];
        this.internals.toh = imgWidthHeight[1];

        this.internals.x   = this.internals.w / 2;
        this.internals.tox = this.internals.w / 2;
        this.internals.y   = this.internals.h / 2;
        this.internals.toy = this.internals.h / 2;

        
    }
    
    this.getMapWidth = function(){
        return width;
    }
    this.isGraphActive = function(){
        return (this.marginCurrentOffset - this.marginLeft) > 1; 
    }
    
    this.updateMapPositionThink = function(){
        
        if (this.delayedUpdatePosCurTime != -1){
            if ((millis() * 0.001 - this.delayedUpdatePosCurTime) >= this.delayedUpdatePosDuration){
                
                        
                let p  = this.mapSpaceToViewPort(this.delayedUpdatePosCoord[0], this.delayedUpdatePosCoord[1]);
                let p2  = this.viewPortToMapSpace(width/2, height/2);
                let p22 = this.mapSpaceToViewPort(p2[0], p2[1]);

                let d = [p22[0] - p[0], p22[1] - p[1]];
                
   
                let x0 = (this.internals.tox-this.internals.w/2);
                let y0 = (this.internals.toy-this.internals.h/2);

                let dx = d[0];
                let dy = d[1];

                let isLeftInside  = (this.internals.tox + dx) - this.internals.tow * 0.5 < 0;
                let isRightInside = ((this.internals.tox + dx) - this.internals.tow * 0.5) + this.internals.tow > this.getMapWidth() ;

                let isUpInside    = (this.internals.toy + dy) - this.internals.toh * 0.5 < 0;
                let isDownInside  = ((this.internals.toy + dy) - this.internals.toh * 0.5) + this.internals.toh > height ;


                if ( (isLeftInside && isRightInside)){
                    this.internals.tox = this.internals.tox + dx;
                }

                if ((isUpInside && isDownInside)){
                    this.internals.toy = this.internals.toy + dy;
                }

                this.delayedUpdatePosCurTime  = -1;
                this.delayedUpdatePosDuration = -1;
                this.delayedUpdatePosCoord    = [-1, -1];

            }
            
        }
    }
    this.updateMapPosition = function(dx0, dy0, delay) {
        
        if (delay){  
            this.delayedUpdatePosCurTime  = millis() * 0.001;
            this.delayedUpdatePosDuration = delay;
            this.delayedUpdatePosCoord    = [dx0, dy0];
        }
        else{
            let x0 = (this.internals.tox-this.internals.w/2);
            let y0 = (this.internals.toy-this.internals.h/2);

            let dx = (dx0 == undefined) ? (mouseX-pmouseX) : dx0;
            let dy = (dy0 == undefined) ? (mouseY-pmouseY) : dy0;

            let isLeftInside  = (this.internals.tox + dx) - this.internals.tow * 0.5 < 0;
            let isRightInside = ((this.internals.tox + dx) - this.internals.tow * 0.5) + this.internals.tow > this.getMapWidth() ;

            let isUpInside    = (this.internals.toy + dy) - this.internals.toh * 0.5 < 0;
            let isDownInside  = ((this.internals.toy + dy) - this.internals.toh * 0.5) + this.internals.toh > height ;


            if ( (isLeftInside && isRightInside)){
                this.internals.tox = this.internals.tox + dx;
            }

            if ((isUpInside && isDownInside)){
                this.internals.toy = this.internals.toy + dy;
            }        

        }
        
    
    }

  
    this.ZoomIntoMapCoordinates = function(x,y){    
        
        this.mapZoomSet(15, width/2, height/2);
        this.updateMapPosition(x, y, 1);   
    }
          
    
    this.mapZoom = function(n, x, y) {
        
        let zoomX = x == undefined ? mouseX : x;
        let zoomY = y == undefined ? mouseY : y;
        
        if (n > 0){
            for (let i=0; i<n; i++){
                if (this.internals.tow < 25 * this.getMapWidth()){
                    this.internals.tox = this.internals.tox - this.internals.zoom * (zoomX - this.internals.tox);
                    this.internals.toy = this.internals.toy - this.internals.zoom * (zoomY - this.internals.toy);
                    this.internals.tow = this.internals.tow * (this.internals.zoom+1);
                    this.internals.toh = this.internals.toh * (this.internals.zoom+1);

                    this.internals.tox = constrain(this.internals.tox, this.getMapWidth() - (0.5 * this.internals.tow),  this.internals.tow * 0.5);
                    this.internals.toy = constrain(this.internals.toy, height - ( 0.5 * this.internals.toh),  this.internals.toh* 0.5);
                }     
            }
        }

        else if (n < 0){
            for (let i=0; i<Math.abs(n); i++){
                if (this.internals.tow>this.getMapWidth()  && this.internals.toh>height){

                    // tox > tow * 0.5, tox < windowWidth - ( 0.5 * tow) 
                    this.internals.tox = this.internals.tox + (this.internals.zoom/(this.internals.zoom+1) * (zoomX - this.internals.tox)); 
                    this.internals.toy = this.internals.toy + (this.internals.zoom/(this.internals.zoom+1) * (zoomY - this.internals.toy));
                    this.internals.toh = this.internals.toh / (this.internals.zoom+1);
                    this.internals.tow = this.internals.tow / (this.internals.zoom+1);

                    // constrain targets
                    this.internals.tox = constrain(this.internals.tox, this.getMapWidth() - ( 0.5 * this.internals.tow),  this.internals.tow * 0.5);
                    this.internals.toy = constrain(this.internals.toy, height - ( 0.5 * this.internals.toh),  this.internals.toh* 0.5);
                  }           
            }
        }
        this.currentZoom += x;
    }
    
    this.mapZoomSet = function(n, x, y) {
        
        this.mapZoom(-this.currentZoom, width/2, height/2);
        this.mapZoom(n, x, y);
        this.currentZoom = n;
    }
    
 
 
    
    this.updateInternals = function(){
        this.internals.x = lerp(this.internals.x, this.internals.tox, 0.1);
        this.internals.y = lerp(this.internals.y, this.internals.toy, 0.1);
        this.internals.w = lerp(this.internals.w, this.internals.tow, 0.1); 
        this.internals.h = lerp(this.internals.h, this.internals.toh, 0.1);
    }
    
    this.getGMSLAtYear  = function(year){
        return this.tfModelPredict([year])[0].y;
        
    }
    this.renderFloodMap = function(){
        
        let floodShader = this.shaderFloodMap;
        
        let outputRT    = this.frameBufferOutput;
        
        outputRT.shader(floodShader);
        floodShader.setUniform('basemap', this.frameBufferMap);
        floodShader.setUniform('basemap_nocaps', this.frameBufferMap2);
        
        floodShader.setUniform('heightmap', this.frameBufferHeightMap);
        floodShader.setUniform('ramptex', this.gradientTexture);
        floodShader.setUniform('warningtex', this.warningTexture);
        floodShader.setUniform('ramprange', 100);
        floodShader.setUniform('capalpha', (this.currentYearSelected / this.futureYearMax));
        floodShader.setUniform('mode', this.floodMapMode);
        floodShader.setUniform('elevationrange', 6400);
        floodShader.setUniform('sealevel', this.getGMSLAtYear(this.currentYearSelected) * 0.001);
   
        
        outputRT.rect(0,0,width,height);
    
    }
    
    this.yearSliderClickUpdate = function(){
        
     
        let yearMax      = this.futureYearMax;
        let yearMin      = floor(this.graph.domainX[0]);

        let sliderStartX = width * 0.1;
        let sliderEndX   = width * 0.9;
        
        let mouseXCoord  = constrain(mouseX,sliderStartX, sliderEndX);
        let yearStep     = ((sliderEndX-sliderStartX) * 0.5) / ((yearMax-yearMin) * 0.5);
        
        let yearClicked  = map(mouseXCoord,
                               sliderStartX, sliderEndX,
                               yearMin, yearMax);
        
        this.currentYearSelected = yearClicked;                     
  
    }
    
    this.renderHeaderYearSlider = function(){
        
        
        // draw overlay
        fill(0);
        rect(0,0,width,this.yearSliderHeight);
        
    
        // draw header year slider information
        textAlign('left', 'center');
        noStroke();
        textSize(12);
        fill(255);
    
        //    text("Time Slider from " + fractYearToDateShort(this.graph.orgDomainX[0]) + 
            // " to " + fractYearToDateShort(this.futureYearMax) + " Selected Date " +  fractYearToDateShort(this.currentYearSelected),
           // width / 2, 15);
        
    
        textStyle(BOLDITALIC);
        fill(255, 200, 50);
        text(fractYearToDateShort(this.graph.orgDomainX[0]), 310, 15);
        text(fractYearToDateShort(this.futureYearMax) , 420, 15);        
        text(fractYearToDateShort(this.currentYearSelected) , 690, 15);

        fill(255);
        textStyle(NORMAL);
        text("to", 390, 15);
        text("Selected Date :" , 600, 15);

        
        let yearMax      = this.futureYearMax;
        let yearMin      = floor(this.graph.domainX[0]);

        let sliderStartX = width * 0.1;
        let sliderEndX   = width * 0.9;
        
        let sliderY      = 30;
        
        let numDivisions = 10;
        let currentYear  = this.currentYearSelected;                     

    
        // draw year line 
        fill(255);
        rect(sliderStartX, sliderY - 10, 5, 21);
        rect(sliderEndX, sliderY - 10, 5, 21);
        rect(sliderStartX, sliderY, sliderEndX - sliderStartX, 2);
        
        for (let i=0; i<=numDivisions; i++){
            
            let x = map(i/numDivisions, 0, 1, sliderStartX, sliderEndX);
            rect(x, sliderY, 5, 10);

        }
        
        
        // draw rectangle showing at what point does the nn begin giving an estimate
        // due to out of bound year sample 
        
        let lastYearSampled = this.graph.orgDomainX[1];
        let lastYearSampledX = map(lastYearSampled, this.graph.orgDomainX[0], this.futureYearMax, sliderStartX, sliderEndX);
        
        
        // draw simple gradient showing severity 

        for (let i=0; i<=9; i++){
            
            let a    = i/9;
            let sx   = lastYearSampledX + (sliderEndX - lastYearSampledX) * a;
            fill(255 - a * 30, 220 - a * 220, 100 - a * 100);
            rect(sx,  sliderY, sliderEndX - sx, 2);
        
        }
        
        // draw current year cursor
        
        let yearClickedX  = map(this.currentYearSelected,
                               yearMin, yearMax,
                               sliderStartX, sliderEndX);
        
        image(this.yearCursorImage, yearClickedX - 7, sliderY - 7);
      

    }
    this.checkMarginInFocus = function(){

        if (mouseX <= this.marginLeft && mouseX >= 0 && mouseY >= 0 && mouseY <= height){
            this.marginExpanded = true;
            return true;
        }
        else{
        
            return false;
        }
    }
    


    this.drawMargin   = function(){
        // update margin current offset
        if (this.marginExpanded){
            this.marginCurrentOffset = lerp(this.marginCurrentOffset, width - this.marginLeft, 0.05);
            
        }
        else{
            this.marginCurrentOffset = lerp(this.marginCurrentOffset, 0, 0.05);     
        }
        
        noStroke();
        
        fill(0,0,0,255 * (this.marginLeft + this.marginCurrentOffset) / width);
        rect(0,0,this.marginLeft + this.marginCurrentOffset, height);
        
        // draw user friendly arrows show up when mouse moves close to margin
        
        let mouseAlpha = 1.0 - ((max(constrain(mouseX,0,width * 0.5) - this.marginLeft, 0.0)) / (width * 0.5 - this.marginLeft));
        
        
        let startX = this.marginLeft - (this.marginLeft * 0.5);
        let startY = height / 2;
        
                  
        push()
        
        for (let i=0; i<2; i++){
            
            let yOff = i * 50;
            
            fill(255, 255, 255, 100 * mouseAlpha ** 32);
            stroke(0,0,0, 100 * mouseAlpha ** 2);
            strokeWeight(1);

            beginShape();
                vertex(startX, startY + yOff);
                vertex(startX, startY + 20 + yOff);
                vertex(startX + 30, startY + 20 + yOff);
                vertex(startX + 30, startY + 30 + yOff);
                vertex(startX + 50, startY + 10 + yOff);
                vertex(startX + 30, startY - 10 + yOff);
                vertex(startX + 30, startY + yOff);
            endShape(CLOSE);

        }
        
       pop()   
        
        
        
                
    }
    
        
   
    
    
    
    
    this.think = function(){
        this.updateMapPositionThink();
        this.checkMarginInFocus();
        this.thinkButtons();
    }
    
    this.drawMapOverlays = function(){
        
        this.renderHeaderYearSlider();

        this.drawMargin();
        
    }
    

    //=================== graph methods ==================\\


    

    this.graphDrawTitle = function() {
        
        let rtGraph = this.frameBufferGraph;
        
        rtGraph.fill(0);
        rtGraph.noStroke();
        rtGraph.textAlign('center', 'center');
        rtGraph.textStyle(BOLD);
        
        rtGraph.text(this.graph.title,
             (this.layout.plotWidth() / 2) + this.layout.leftMargin,
             this.layout.topMargin - (this.layout.marginSize * 2.5));
        
        rtGraph.textStyle(NORMAL);
        rtGraph.textAlign('left', 'center');
        
        // draw 
        rtGraph.fill(120);
        rtGraph.text("Data source: Satellite sea level observations.",
             (this.layout.plotWidth() / 512) + this.layout.leftMargin,
             this.layout.topMargin - (this.layout.marginSize * 1.4));
        
        rtGraph.text("Credit: NASA Goddard Space Flight Center",
             (this.layout.plotWidth() / 512) + this.layout.leftMargin,
             this.layout.topMargin - (this.layout.marginSize * 0.8));
        
        rtGraph.fill(0);
    
    };
    
    this.setupGraph      = function(){

        // Set min and max years: assumes data is sorted by date.
      
        this.graph.domainX[0] = this.data.getNum(0, 'year+fraction-of-year');
        this.graph.domainX[1] = this.data.getNum(this.data.getRowCount() - 1, 'year+fraction-of-year');
        
        // set static domain x that will never change
        this.graph.orgDomainX[0] = this.data.getNum(0, 'year+fraction-of-year');
        this.graph.orgDomainX[1] = this.data.getNum(this.data.getRowCount() - 1, 'year+fraction-of-year');
      

        // Find min and max pay gap for mapping to canvas height.
        this.graph.domainY[0] = min(this.data.getColumn("gmsl-variation-mm"));      
        this.graph.domainY[1] = max(this.data.getColumn("gmsl-variation-mm"));
        
        // set static domain y that will never change
        this.graph.orgDomainY[0] = min(this.data.getColumn("gmsl-variation-mm"));      
        this.graph.orgDomainY[1] = max(this.data.getColumn("gmsl-variation-mm"));
        
        // set year div mod to 0
        this.zoomOutEnable = true;

        this.layout.plotXTickLabelYearDivMod = 0;
        
        // setup highlighted data point location
        this.graph.highlightedDataPointIndex = this.data.getRowCount() - 1;
        
        // load image 
        this.graph.zoomInfoImage = loadImage("graphs/zoom_helper.png");
        
        this.currentYearSelected = this.graph.orgDomainX[0];

    }
         
  this.graphZoomOutFuture     = function(){
            
        // change x axis year div mod by 10 
        this.layout.plotXTickLabelYearDivMod = 2000;
        
        this.graphSetDomainXMax(this.futureYearMax);
        this.graphSetDomainYMax(this.tfModelPredict( [this.futureYearMax])[0].y);
        
        this.graphSetNiceYAxisScale();
        this.graphZoomToolEnable(true);
        
    }
    this.graphGetNiceNumber     = function( range, shouldRound){
        
        let exponent     = 0.0;
        let fraction     = 0.0;
        let niceFraction = 0.0;
        
        exponent = floor(Math.log10(range));
        fraction = range / Math.pow(10, exponent);

        if (shouldRound) {
            if (fraction < 1.5){
                niceFraction = 1;
            }
            else if (fraction < 3){
                niceFraction = 2;
            }
            else if (fraction < 7){
                niceFraction = 5;
            }
            else{
                niceFraction = 10;
            }
        } 
        else {
            if (fraction <= 1){  
                niceFraction = 1;      
            }
        
            else if (fraction <= 2){
                niceFraction = 2;
            }
            else if (fraction <= 5){
                niceFraction = 5;
            }
            else{
                niceFraction = 10;
            }
            
        }

        return niceFraction * Math.pow(10, exponent);
    }
    
    this.graphSetNiceYAxisScale = function(){
        
        let lowerY    = this.graph.domainY[0];
        let upperY    = this.graph.domainY[1];
        
        let niceNum = this.graphGetNiceNumber;
        
        
        let range = niceNum(upperY - lowerY, false);

        let tickSpacing = niceNum(range / (this.layout.plotYTicksMax - 1), true);   
        let niceMin     = floor(lowerY / tickSpacing) * tickSpacing;
        let niceMax     = ceil(upperY / tickSpacing) * tickSpacing;
       
        // update y domain to make it seem nicer to the eye
        this.graphSetDomainY(niceMin, niceMax);
            
    }
    this.graphGetDomainXRange = function(){
        return this.graph.domainX[1] - this.graph.domainX[0];
    }
    
    this.createTFModel          = function(){
        
        // create a sequential model
        let model = tf.sequential(); 

        // add input layer
        model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));
        // add a single hidden layer of size 128
        model.add(tf.layers.dense({units: 16, activation: 'linear',  useBias: true}));
        // add output layer 
        model.add(tf.layers.dense({units: 1, useBias: true}));

        this.tfModel = model;
        
    }
        
    this.convertDatasetToTensor = function(){
        
        let dataIn    = [];
        
        // get dataset size of this.data
        let dataSize = this.data.getRowCount();
        
        // extract years and gmsl 
        // inputs are "years" and labels are "gmsl"

        for (let i=0; i<dataSize; i++){
            
            dataIn.push({
                        years : this.data.getNum(i, "year+fraction-of-year"),
                        gmsl : this.data.getNum(i, "gmsl-variation-mm")
            });
            
        }
        
        
        this.dataAsNonTensor = dataIn.slice();
        
        this.dataAsTensor    = tf.tidy(() => {
            
            // shuffle data so that the model doesn't learn things 
            // that are purely dependent on the order of data
            tf.util.shuffle(dataIn);

            // convert data to Tensor
            let inputs = dataIn.map(d => d.years);
            let labels = dataIn.map(d => d.gmsl);

            let inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
            let labelTensor = tf.tensor2d(labels, [labels.length, 1]);

            // normalize the data to the range 0 - 1 
            // using min-max scaling
            
            // not normalizing could lead to slow convergence
            let inputMax = inputTensor.max();
            let inputMin = inputTensor.min();  
            let labelMax = labelTensor.max();
            let labelMin = labelTensor.min();

            
            let normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
            let normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

            return {
                inputs: normalizedInputs,
                labels: normalizedLabels,
                // return the min/max bounds so we can use them later.
                inputMax,
                inputMin,
                labelMax,
                labelMin,
            }
        });  
    }
    this.tfTrainModel = async function(){
        
        let {inputs, labels} = this.dataAsTensor;
        let model            = this.tfModel;
        
        // Prepare the model for training.  
        model.compile({
            optimizer: tf.train.adam(learning_rate=0.001),
            loss: tf.losses.meanSquaredError,
            metrics: ['mse'],
        });

        let batchSize = 32;
        let epochs = 16;
        
        
        return await model.fit(inputs, labels, {
            batchSize,
            epochs,
            shuffle: true
        });   
    }
    
    this.graphGetLineYAtYear = function(year){
        let yPredicted = this.tfModelPredict([year])[0].y;
        return yPredicted;
    }
    
    this.tfModelGetGradPerYear = function(){
        
        // get gradient of line of best fit as predicted by tf neural network
        
        let x0 = this.graph.orgDomainX[0];
        let x1 = this.graph.orgDomainX[1];
        
        let preds = this.tfModelPredict([x0,x1]);
        return (preds[1].y - preds[0].y)/(preds[1].x - preds[0].x) ;
        
    }
    


    // predict given 
    this.tfModelPredict = function(inputYears){

        let model = this.tfModel;
        
        let {inputMax, inputMin, labelMin, labelMax} = this.dataAsTensor;  
        
        // Generate prediction for inputYears          
        let [xs, preds] = tf.tidy(() => {
            
            // convert un-normalized inputYears array into a tensor
            let xs     = tf.tensor2d(inputYears, [inputYears.length, 1])
            
            // normalize tensor using min-max scaling 
            xs         = xs.sub(inputMin).div(inputMax.sub(inputMin));

            // predict points
            let preds = model.predict(xs.reshape([inputYears.length, 1]));      

            
            // un-normalize years
            let unNormXs = xs
            .mul(inputMax.sub(inputMin))
            .add(inputMin);

            // un=normalize predictions
            let unNormPreds = preds
            .mul(labelMax.sub(labelMin))
            .add(labelMin);

            // un-normalize the data
            return [unNormXs.dataSync(), unNormPreds.dataSync()];
            });

            // return predictions
            return predictedPoints = Array.from(xs).map((val, i) => {
                return {x: val, y: preds[i]
            }
        });
    }
    
    this.setupPredictor  = function(){
        
        // create model 
        this.createTFModel();
        // convert data to tensor
        this.convertDatasetToTensor();
        
        // train model 
        this.tfTrainModel();
        
    }
    
    
    this.graphDrawInfoLatestMeasurement = function() {
        
        let rtGraph = this.frameBufferGraph;
        
        let lastDateOfEntry = fractYearToDate(this.data.getNum(this.data.getRowCount() - 1,  "year+fraction-of-year"), true)
        let lastGMSLOfEntry = this.data.getNum(this.data.getRowCount() - 1, "gmsl-variation-mm");
        let offsetY         = 140;
        
        rtGraph.textAlign('center', 'center');
        rtGraph.textStyle(BOLD);
        rtGraph.noStroke();
        rtGraph.textSize(16);
 
        
        rtGraph.fill(17, 124, 192);
        rtGraph.fill(110,170,200);
        rtGraph.text("LATEST", this.layout.rightMargin + 110, this.layout.topMargin + 63 + offsetY);
        rtGraph.text("MEASUREMENT", this.layout.rightMargin + 110, this.layout.topMargin + 83 + offsetY);
        
        rtGraph.textStyle(NORMAL);
        rtGraph.fill(0);
        
        rtGraph.text(lastDateOfEntry[0] + "/" +
                     lastDateOfEntry[1] + "/" +
                     lastDateOfEntry[2]
                     , this.layout.rightMargin + 110, this.layout.topMargin + 108 + offsetY);
        rtGraph.fill(120);
        rtGraph.text(lastGMSLOfEntry.toFixed(2) + " (±" + this.graph.imprecision.toFixed(2) + " ) mm"
                     , this.layout.rightMargin + 110, this.layout.topMargin + 130 + offsetY);

        
        

        
    }
    this.graphDrawRateOfChangeOfGMSL = function(){
        
        let rtGraph = this.frameBufferGraph;
        
        let offsetY = 90;
        
        let deltaR  = this.tfModelGetGradPerYear().toFixed(1);
        let deltaRL = (deltaR.toString().length - 3);
        
        rtGraph.textAlign('left', 'center');
        rtGraph.textStyle(BOLD);
        rtGraph.noStroke();
        rtGraph.textSize(16);
 
        
        rtGraph.fill(17, 124, 192);
        rtGraph.fill(110,170,200);
        rtGraph.text("RATE OF CHANGE", this.layout.rightMargin + 40, this.layout.topMargin - 43 + offsetY);
        
        
        rtGraph.textAlign('right', 'center');
        rtGraph.textStyle(NORMAL);
        rtGraph.textSize(40);

        rtGraph.fill(0,0,0);
        rtGraph.text(deltaR, this.layout.rightMargin + 180, this.layout.topMargin - 10 + offsetY);
        
        // draw positive or negative arrow
        let lineX = this.layout.rightMargin + 100 - 18 * deltaRL;
        let lineY = this.layout.topMargin - 0 + offsetY;
        
        rtGraph.stroke(17, 124, 192);
        rtGraph.strokeWeight(2);
        
        if (deltaR > 0){
            rtGraph.line(lineX, lineY, lineX, lineY - 26); 
            rtGraph.line(lineX - 12, lineY - 16, lineX, lineY - 26); 
            rtGraph.line(lineX + 12, lineY - 16, lineX, lineY - 26);
            
        }
        else{
            
            rtGraph.line(lineX, lineY, lineX, lineY - 26); 
            rtGraph.line(lineX - 12, lineY - 10, lineX, lineY); 
            rtGraph.line(lineX + 12, lineY - 10, lineX, lineY);
        }
        rtGraph.noStroke();
        rtGraph.textStyle(NORMAL);
        
        rtGraph.textSize(16);

        rtGraph.noStroke();
        rtGraph.fill(120);
        rtGraph.text("millimeters per year", this.layout.rightMargin + 180, this.layout.topMargin + 20 + offsetY);
        
        rtGraph.fill(0);

    

    }
    this.graphDrawPredictions = function(){
        if (this.graph.drawPredictions){
            
            let rtGraph = this.frameBufferGraph;
        
            let predictedPoints = this.tfModelPredict(tf.linspace(this.graph.domainX[0], this.graph.domainX[1], this.graph.predictionDivisions).dataSync());
            
            for (let i = 1; i < predictedPoints.length; i++){
                
                let x0 = predictedPoints[i-1].x;    
                let x1 = predictedPoints[i].x;    
                
                let y0  = predictedPoints[i-1].y;
                let y1  = predictedPoints[i].y;
                
             
                rtGraph.strokeWeight(3);
                rtGraph.stroke(255, 200, 100, 200);
                
                rtGraph.line(
                    this.mapYearToWidth(x0),
                    this.mapGMSLToHeight(y0),
                    this.mapYearToWidth(x1),
                    this.mapGMSLToHeight(y1)       
                );
                
            }
           
        
        }
    
    }
    


    this.setHighlightedDataPoint = function(year){
        
        // if not enabled, then early exit
        if (!this.graph.drawHighlightedDataPoint){
            return;
        }
        
        // get data as columns
        let dataYears    = this.data.getColumn("year+fraction-of-year");
        let dataGMSL     = this.data.getColumn("gmsl-variation-mm");
        
        
        // find selected year at mouse pos and binary search it 
        let interpolatedYearAtMousePos = this.graphQueryYearAtPos(mouseX);
        let dataIndexAtMouseX          = binarySearchMatchApprox(dataYears, interpolatedYearAtMousePos)[1];
        
        // get predicted year / gmsl at mouse 
        let yPredictedAtMouseX     = this.graphGetLineYAtYear(year);

        // get coordinates on the predicted line given mouseX 
        let xCoordOnLineOnGraph    = this.mapYearToWidth(year);
        let yCoordOnLineOnGraph    = this.mapGMSLToHeight(yPredictedAtMouseX);
        
        // get its position on graph 
        let entryPosXOnGraph = this.mapYearToWidth(dataYears[dataIndexAtMouseX]);
        let entryPosYOnGraph = this.mapGMSLToHeight(dataGMSL[dataIndexAtMouseX]);
        
        // if year is out of bounds, then ... highlight a point on the predicted line of best fit 
        let yearOutOfBounds  = year < this.graph.orgDomainX[0] || year > this.graph.orgDomainX[1];
        
        // get two distances. one from mouse to sampled data pos, and another one from mouse to sampled line pos
        let distSampledPos     = dist(mouseX, mouseY, entryPosXOnGraph, entryPosYOnGraph);
        
        // if year is not in the data set, then place it on the line
        if (yearOutOfBounds){
            this.graph.highlightedDataPointIndex = -1;
            this.graph.highlightedDataPointPos   = [year, yPredictedAtMouseX];  
        }
        else{
            if (distSampledPos < 60){
                this.graph.highlightedDataPointIndex = dataIndexAtMouseX;
                this.graph.highlightedDataPointIndex = dataIndexAtMouseX;
                this.graph.highlightedDataPointPos   = null;
            }
        }
       
   
   
    
    }
    
    
    this.graphZoomToolOnClick = function(){
        this.setupGraph();
        this.graphSetNiceYAxisScale();
        this.graphZoomToolEnable(false);
        
    }
    this.checkGraphZoomToolClicked = function(){
        
        let zoomResetEnabled = this.graph.zoomResetEnable;

        // update old zoom out prediction and update 
        let newBaselinePrediction = this.tfModelPredict([0])[0].y;
        this.graph.zoomOutPredChanged  = this.graph.zoomOutOldPred != newBaselinePrediction;
        this.graph.zoomOutOldPred      = newBaselinePrediction;
        
        
        let mouseWithinZoom = mouseX >= this.layout.leftMargin + 75 && 
                          mouseX <= this.layout.leftMargin + 140 && 
                          mouseY >= this.layout.bottomMargin + 52 &&
                          mouseY <= this.layout.bottomMargin + 77;

    
        
        let mouseWithinSnap  = mouseX >= this.layout.leftMargin + 665 && 
                          mouseX <= this.layout.leftMargin + 715 && 
                          mouseY >= this.layout.bottomMargin + 55 &&
                          mouseY <= this.layout.bottomMargin + 80;
        
             
        let mouseWithinZoomOut = mouseX >= this.layout.leftMargin + 155 && 
                          mouseX <= this.layout.leftMargin + 252 && 
                          mouseY >= this.layout.bottomMargin + 52 &&
                          mouseY <= this.layout.bottomMargin + 105;
        
        
    
        if (mouseWithinZoom && zoomResetEnabled){
            this.graphZoomToolOnClick();
            this.graph.zoomOutEnable = true;

        }
        
        if (mouseWithinZoomOut && this.graph.zoomOutEnable){
            
            this.setupGraph();
            this.graphSetNiceYAxisScale();
            this.graphZoomToolEnable(false);

            this.graphZoomOutFuture();
            
            if (this.graph.zoomOutPredChanged){
                this.graph.zoomOutEnable = true;
            }     

            this.graph.zoomOutEnable = false;
        
        }
        if (mouseWithinSnap){
             saveCanvas('graph-copy', 'PNG');
        }
        
        
        
    }
    this.graphZoomToolEnable = function(b){
        this.graph.zoomResetEnable = b;
    }
    
    
    this.graphDrawZoomTools = function(){
        
        let rtGraph = this.frameBufferGraph;
        
        rtGraph.image(this.graph.zoomInfoImage, this.layout.leftMargin - 50, this.layout.bottomMargin + 50);
        
        // draw button
        
        rtGraph.textAlign('left', 'center');
        rtGraph.textStyle(BOLD);
        rtGraph.noStroke();
        
        if (!this.graph.zoomResetEnable){
            rtGraph.fill(150);
        }
        
        else{
            rtGraph.fill(17, 124, 192);

        }
        
        rtGraph.rect(this.layout.leftMargin + 75, this.layout.bottomMargin + 52, 65, 25, 8);  
        rtGraph.fill(255);
        rtGraph.text("RESET", this.layout.leftMargin + 80, this.layout.bottomMargin + 67);

        // draw zoom out button
   
        if (this.graph.zoomOutEnable){
            rtGraph.fill(17, 124, 192);

        }
        else{
            rtGraph.fill(150);
        }

        
        rtGraph.rect(this.layout.leftMargin + 155, this.layout.bottomMargin + 52, 97, 25, 8);  
        rtGraph.fill(255);
        rtGraph.text("ZOOM OUT", this.layout.leftMargin + 160, this.layout.bottomMargin + 67);

        
        
        // draw snapshot related stuff
        rtGraph.fill(0);
        rtGraph.text("Snapshot:", this.layout.leftMargin + 570, this.layout.bottomMargin + 67);
        
        rtGraph.fill(17, 134, 202);
        rtGraph.text("PNG", this.layout.leftMargin + 665, this.layout.bottomMargin + 67);

        
        
        this.frameBufferGraph.textStyle(NORMAL);
        
        
        
        
    }
    this.drawHighlightedDataPoint = function(){
        
        // if not enabled, then early exit
        if (!this.graph.drawHighlightedDataPoint){
            return;
        }
        
        let rtGraph        = this.frameBufferGraph;
        
        let dataYear = 0;
        let dataGMSL = 0;
        
        if (this.graph.highlightedDataPointPos){
            dataYear = this.graph.highlightedDataPointPos[0];
            dataGMSL = this.tfModelPredict( [this.graph.highlightedDataPointPos[0]] )[0].y;
        
        }
        else{
            
            let dataPointIndex = this.graph.highlightedDataPointIndex;

            dataYear     = this.data.getColumn("year+fraction-of-year")[dataPointIndex];
            dataGMSL     = this.data.getColumn("gmsl-variation-mm")[dataPointIndex];
        
        }
        
  
        let highlightX = this.mapYearToWidth(dataYear);
        let highlightY = this.mapGMSLToHeight(dataGMSL);
        
        if (this.posWithinGraph(highlightX, highlightY)){
            let hAlpha     = (1.0-(((millis()*0.04 % 38))/38))**0.5 * 255;

            // draw circle

            rtGraph.fill(200,0,0, hAlpha);
            rtGraph.noStroke();
            rtGraph.ellipse(highlightX, highlightY, (millis()*0.04 % 38));

            
        }
        
        
        
    }
    
    this.renderGraph     = function() {

        // check if render graph is enabled
        // if not, exit function early
        if (!this.isGraphActive()){
            return;
        }
        
        let rtGraph  = this.frameBufferGraph;
        
        rtGraph.background(255);
        rtGraph.textSize(16);
        
        if (!this.loaded) {
            console.log("Data not yet loaded");
            return;
        }
        
        this.graphReDrawDataPoints();

        // draw predictions (line of best fit)
        this.graphDrawPredictions();
        
        // draw window over line graph to prevent line leakage to canvas
        drawLineGraphWindow(this.layout, width, height, rtGraph)

        // draw graph grid labels
        drawLineGraphGridLabels(this.graph, this.layout, this.mapYearToWidth.bind(this), this.mapGMSLToHeight.bind(this), rtGraph);

        // Draw the title above the plot.
        this.graphDrawTitle();
    
        // Draw x and y axis.
        drawAxis2(this.layout, rtGraph);
        
        // Draw x and y axis labels.
        drawAxisLabels(this.graph.xAxisLabel,
                   this.graph.yAxisLabel,
                   this.layout, rtGraph);
        
        // draw mouse zoom rectangle
        this.graphDrawMouseZoomRectangle();
        
        // draw graph zoom info
        this.graphDrawZoomTools();
        
        // draw data sample info
        this.graphDrawInfoOnNearestMouseSampledData();
        
        // draw highlighted data point circle
        this.drawHighlightedDataPoint();
        
        // draw rate of change of sea level 
        this.graphDrawRateOfChangeOfGMSL();
        
        // draw latest measurement 
        this.graphDrawInfoLatestMeasurement();
        

    }
    
 
    this.graphOnMousePressed = function() { 
        if (this.mouseWithinGraph()){
            this.graph.mouseZoomStartX = mouseX;
            this.graph.mouseZoomEndX   = mouseX;
            this.graph.mouseBeginZoom  = true; 

        }
    } 
    
    this.graphMouseZoomResetState = function(){
        this.graph.mouseZoomStartX = -1;
        this.graph.mouseZoomEndX   = -1;
        this.graph.mouseBeginZoom  = false;
        
    }
    
    this.graphUpdateMouseZoomCoordinates = function(){
        if (this.graph.mouseBeginZoom){
            this.graph.mouseZoomEndX   = constrain(mouseX, this.layout.leftMargin, this.layout.rightMargin);            
        }
    }
    
    this.graphQueryYearAtPos         = function(x){
        return map(x, this.layout.leftMargin, this.layout.rightMargin, this.graph.domainX[0], this.graph.domainX[1]);
    }
    
    this.graphQueryGlobalSeaLevelAtY = function(y){
       
        return map(y, this.layout.topMargin, this.layout.bottomMargin, this.graph.domainY[1], this.graph.domainY[0]);
        
    }
    
    this.graphQueryXDomainSelection = function(){
        
        let y0 = this.graphQueryYearAtPos(this.graph.mouseZoomStartX);
        let y1 = this.graphQueryYearAtPos(this.graph.mouseZoomEndX);
        
        let lowerYear = min(y0, y1);
        let upperYear = max(y0, y1);
    
        return [lowerYear, upperYear]
        
    }

    this.graphSetDomainXMax = function(x0){        
        this.graph.shouldRedraw = true;
        this.graph.domainX = [this.graph.domainX[0], x0];
    }
        
    this.graphSetDomainYMax = function(y0){
        this.graph.shouldRedraw = true;
        this.graph.domainY = [this.graph.domainY[0], y0];
    }
        
    this.graphSetDomainX = function(x0, x1){
        this.graph.shouldRedraw = true;
        this.graph.domainX = [x0, x1];
    }
    
    this.graphSetDomainY = function(y0, y1){
        this.graph.shouldRedraw = true;
        this.graph.domainY = [y0, y1];
    }
    
    this.graphGetYDomainGivenXDomain = function(domainX){
        
        let lowerYear    = domainX[0];
        let upperYear    = domainX[1];
        
        let dataYears    = this.data.getColumn("year+fraction-of-year");
        let dataGMSL     = this.data.getColumn("gmsl-variation-mm");
        
        let gmslMinMax   = minMax(dataGMSL,
                            binarySearchMatchApprox(dataYears, lowerYear)[1],
                            binarySearchMatchApprox(dataYears, upperYear)[1])
        
        return [gmslMinMax[0], gmslMinMax[1]];
        
    }

    this.graphDrawMouseZoomRectangle = function(){
        
        if (this.graph.mouseBeginZoom){
            
            let rtGraph = this.frameBufferGraph;
            
            let x0 = this.graph.mouseZoomStartX;
            let x1 = this.graph.mouseZoomEndX;   
            
            if (abs(x1-x0)>1){
                rtGraph.fill(255, 200, 150, 100);
                rtGraph.stroke(255, 200, 150, 250);
                rtGraph.strokeWeight(1)
             
                rtGraph.rect(x0, this.layout.topMargin, x1-x0, this.layout.bottomMargin - this.layout.topMargin - 1);  
            }
            
          
            

        }
        

        
    }
    this.graphReDrawDataPoints = function(){
        if (this.graph.shouldRedraw){
            
            // redraw line graph only when domains change 
            let rtGraph = this.frameBufferGraph2;
            rtGraph.background(255);

            //plot imprecision line 
            let yDensity = abs((this.layout.topMargin - this.layout.bottomMargin) / (this.graph.domainY[1] - this.graph.domainY[0]))

            let previous;
            let numYears = round(this.graphGetDomainXRange());

            rtGraph.strokeWeight(yDensity * this.graph.imprecision * 1);
            rtGraph.stroke(225, 225, 255);

            for (let i = 0; i < this.data.getRowCount(); i++) {


                // Create an object to store data for the current year.
                var current = {
                // Convert strings to numbers.
                    'year': this.data.getNum(i, 'year+fraction-of-year'),
                    'variation': this.data.getNum(i, 'gmsl-variation-mm')
                };


                if (previous != null) {
                    // Draw line segment connecting previous year to current
                    // year pay gap.


                    rtGraph.line(this.mapYearToWidth(previous.year),
                    this.mapGMSLToHeight(previous.variation),
                    this.mapYearToWidth(current.year),
                    this.mapGMSLToHeight(current.variation));


                }


              previous = current;
            }


            // draw grid 
            drawLineGraphGrid(this.graph, this.layout, this.mapYearToWidth.bind(this), this.mapGMSLToHeight.bind(this), rtGraph);


            // draw line graph now 
            previous = null;
            rtGraph.strokeWeight(2);
            rtGraph.stroke(0);

            for (let i = 0; i < this.data.getRowCount(); i++) {

                // Create an object to store data for the current year.
                var current = {
                // Convert strings to numbers.
                    'year': this.data.getNum(i, 'year+fraction-of-year'),
                    'variation': this.data.getNum(i, 'gmsl-variation-mm')
                };


                if (previous != null) {
                    // Draw line segment connecting previous year to current
                    // year pay gap.

                    rtGraph.line(this.mapYearToWidth(previous.year),
                    this.mapGMSLToHeight(previous.variation),
                    this.mapYearToWidth(current.year),
                    this.mapGMSLToHeight(current.variation));


                }
              previous = current;
            }

            
            this.graph.shouldRedraw = false;
        }
        
        this.frameBufferGraph.image(this.frameBufferGraph2,0,0,width,height);
    }
    this.graphOnMouseReleased = function() {
    
        let newXDomain = this.graphQueryXDomainSelection();
        
        // ignore infinitesimally small domains 
        if (newXDomain[0] == newXDomain[1]){
            this.graphMouseZoomResetState();
            return;
        }
        
        let newYDomain = this.graphGetYDomainGivenXDomain(newXDomain);
        
        this.graphSetDomainX(newXDomain[0], newXDomain[1]);
        this.graphSetDomainY(newYDomain[0], newYDomain[1]);
        
    
        // update y axis domain so that it looks nice 
        this.graphSetNiceYAxisScale();
        this.graphMouseZoomResetState();
        this.graphZoomToolEnable(true);
        this.graph.zoomOutEnable = true;

    }
    
    this.graphDrawInfoOnNearestMouseSampledData = function(){
        
        // if not mouse on graph, exit early
        if (!this.mouseWithinGraph()){
            return;
        }
        
        let rtGraph      = this.frameBufferGraph;
        
        let dataYears    = this.data.getColumn("year+fraction-of-year");
        let dataGMSL     = this.data.getColumn("gmsl-variation-mm");
   
        let interpolatedYearAtMousePos = this.graphQueryYearAtPos(mouseX);
        let dataIndexAtMouseX          = binarySearchMatchApprox(dataYears, interpolatedYearAtMousePos)[1];
        
        let yearDataEntryAtMouse       = dataYears[dataIndexAtMouseX];
        let gmslDataEntryAtMouse       = dataGMSL[dataIndexAtMouseX];
        
        let entryPosXOnGraph = this.mapYearToWidth(yearDataEntryAtMouse);
        let entryPosYOnGraph = this.mapGMSLToHeight(gmslDataEntryAtMouse);
        
        let infoBoxOffsets  = this.layout.dataEntryInfoOffset;
        let infoBoxDraw     = this.layout.drawDataEntryInfo;
        let infoBoxDrawDist = this.layout.dataEntryDistanceDraw;
        
        let infoBoxDateInfo  = fractYearToDate(yearDataEntryAtMouse);
        let infoBoxDateAsStr = infoBoxDateInfo[1] + " " + infoBoxDateInfo[0] + ", "+ infoBoxDateInfo[2];
        
        let infoBoxMeasurement = gmslDataEntryAtMouse.toFixed(1) + " (±" + this.graph.imprecision.toFixed(2)+") mm"; 
        
        let infoBoxDataSince      = fractYearToDate(this.data.getNum(0, 'year+fraction-of-year'));
        let infoBoxDataSinceAsStr = "*Data Since " + infoBoxDataSince[1].slice(0,3) + "." + infoBoxDataSince[0] + ", " + infoBoxDataSince[2];
        
    
        if (this.graph.drawPredictions){
            
            // predicted y value at mouse x
            let yPredictedAtMouseX     = this.graphGetLineYAtYear(interpolatedYearAtMousePos);
        
            // get coordinates on the predicted line given mouseX 
            let xCoordOnLineOnGraph    = this.mapYearToWidth(interpolatedYearAtMousePos);
            let yCoordOnLineOnGraph    = this.mapGMSLToHeight(yPredictedAtMouseX);
            
            
            let distToSampledDataPos     = dist(mouseX, mouseY, entryPosXOnGraph, entryPosYOnGraph);
            let distToSampledLineDataPos = dist(mouseX, mouseY, xCoordOnLineOnGraph, yCoordOnLineOnGraph);
            
            if ( distToSampledDataPos < distToSampledLineDataPos){
                if (distToSampledDataPos < infoBoxDrawDist && infoBoxDraw){
                    
                    rtGraph.noFill();
                    rtGraph.stroke(0,0,0,100);
                    rtGraph.strokeWeight(5);
                    rtGraph.ellipse(entryPosXOnGraph, entryPosYOnGraph, 18);

                    rtGraph.fill(255)
                    rtGraph.stroke(0);
                    rtGraph.strokeWeight(1);

                    // draw info box
                    rtGraph.rect(entryPosXOnGraph - infoBoxOffsets[0], entryPosYOnGraph - infoBoxOffsets[1], 160, 65, 5);

                    rtGraph.textAlign('left', 'center');
                    rtGraph.textSize(13);
                    rtGraph.noStroke();
                    rtGraph.fill(0);

                    // draw date
                    rtGraph.text(infoBoxDateAsStr, entryPosXOnGraph - infoBoxOffsets[0] + 10, entryPosYOnGraph - infoBoxOffsets[1]+15);

                    // draw measurement
                    rtGraph.text(infoBoxMeasurement, entryPosXOnGraph - infoBoxOffsets[0] + 10, entryPosYOnGraph - infoBoxOffsets[1]+33);

                    // draw measurement
                    rtGraph.text(infoBoxDataSinceAsStr, entryPosXOnGraph - infoBoxOffsets[0] + 10, entryPosYOnGraph - infoBoxOffsets[1]+51);


                    
                    
                }
            
            }
            else{
                
                if (distToSampledLineDataPos < infoBoxDrawDist && infoBoxDraw){
                    
                    let dateAtMouseX = fractYearToDate(interpolatedYearAtMousePos);
                    let dataAtMouseXAsStr = dateAtMouseX[1] + " " + dateAtMouseX[0] + ", "+ dateAtMouseX[2];

                    rtGraph.noFill();
                    rtGraph.stroke(0,0,0,100);
                    rtGraph.strokeWeight(5);
                    rtGraph.ellipse(xCoordOnLineOnGraph, yCoordOnLineOnGraph, 18);

                    rtGraph.fill(255, 220, 100)
                    rtGraph.stroke(0);
                    rtGraph.strokeWeight(1);

                    // draw info box
                    rtGraph.rect(xCoordOnLineOnGraph - infoBoxOffsets[0], yCoordOnLineOnGraph - infoBoxOffsets[1], 160, 65, 5);

                    rtGraph.textAlign('left', 'center');
                    rtGraph.textSize(13);
                    rtGraph.noStroke();
                    rtGraph.fill(0);

                    // draw date
                    rtGraph.text(
                        dataAtMouseXAsStr,
                        xCoordOnLineOnGraph - infoBoxOffsets[0] + 10, 
                        yCoordOnLineOnGraph - infoBoxOffsets[1] + 15
                    );

                    // draw measurement
                    rtGraph.text(
                        yPredictedAtMouseX.toFixed(1) + " (±" + this.graph.imprecision.toFixed(2)+") mm",
                        xCoordOnLineOnGraph - infoBoxOffsets[0] + 10, 
                        yCoordOnLineOnGraph - infoBoxOffsets[1] + 33
                    );

                    // draw measurement
                    rtGraph.text("*Predicted", 
                        xCoordOnLineOnGraph - infoBoxOffsets[0] + 10,
                        yCoordOnLineOnGraph - infoBoxOffsets[1] + 51
                    );

                    
                    
                    
                }
                
                
            }


            
        }
        else{


            if (dist(mouseX, mouseY, entryPosXOnGraph, entryPosYOnGraph) < infoBoxDrawDist && infoBoxDraw){

                rtGraph.noFill();
                rtGraph.stroke(0,0,0,100);
                rtGraph.strokeWeight(5);
                rtGraph.ellipse(entryPosXOnGraph, entryPosYOnGraph, 18);

                rtGraph.fill(255)
                rtGraph.stroke(0);
                rtGraph.strokeWeight(1);

                // draw info box
                rtGraph.rect(entryPosXOnGraph - infoBoxOffsets[0], entryPosYOnGraph - infoBoxOffsets[1], 160, 65, 5);

                rtGraph.textAlign('left', 'center');
                rtGraph.textSize(13);
                rtGraph.noStroke();
                rtGraph.fill(0);

                // draw date
                rtGraph.text(infoBoxDateAsStr, entryPosXOnGraph - infoBoxOffsets[0] + 10, entryPosYOnGraph - infoBoxOffsets[1]+15);

                // draw measurement
                rtGraph.text(infoBoxMeasurement, entryPosXOnGraph - infoBoxOffsets[0] + 10, entryPosYOnGraph - infoBoxOffsets[1]+33);

                // draw measurement
                rtGraph.text(infoBoxDataSinceAsStr, entryPosXOnGraph - infoBoxOffsets[0] + 10, entryPosYOnGraph - infoBoxOffsets[1]+51);

            }
            
            
            
        }        
    }
    
    
    
    this.isValidMousePosition = function(){        
        return !this.marginExpanded &&
            (mouseX >=0 && mouseX <= width && mouseY >= this.yearSliderHeight && mouseY <= height);
    }
        
    this.mouseWithinGraph = function(){
        
        return mouseX > this.layout.leftMargin && mouseX < this.layout.rightMargin &&
            mouseY > this.layout.topMargin && mouseY < this.layout.bottomMargin;
        
    }
    this.posWithinGraph = function(x,y){
        return x >= this.layout.leftMargin && x <= this.layout.rightMargin &&
            y >= this.layout.topMargin && y <= this.layout.bottomMargin;
        
    }
    
    this.mapYearToWidth = function(value) {
        return map(value,
                   this.graph.domainX[0],
                   this.graph.domainX[1],
                   this.layout.leftMargin,   
                   this.layout.rightMargin);
        };

    this.mapGMSLToHeight = function(value) {

        return map(value,
                   this.graph.domainY[0],
                   this.graph.domainY[1],
                   this.layout.bottomMargin, 
                   this.layout.topMargin);   
    };
    
    
    //=================| end of graph methods |=================\\
    this.draw = function(){
        
        let t = millis();
        
        this.updateInternals();
        
        // think for non draw related stuff stuff
        this.think();
        
        // render textures to their respective render targets
        this.frameBufferMap.image(this.worldMapBase,  this.internals.x-this.internals.w/2, this.internals.y-this.internals.h/2, this.internals.w , this.internals.h);
        this.frameBufferMap2.image(this.worldMapBase2,  this.internals.x-this.internals.w/2, this.internals.y-this.internals.h/2, this.internals.w , this.internals.h);

        this.frameBufferHeightMap.image(this.worldMapHeight,  this.internals.x-this.internals.w/2, this.internals.y-this.internals.h/2, this.internals.w , this.internals.h);

        // render flood map
        this.renderFloodMap();
        
        
         // render graph 
        this.renderGraph();
        
        // output it to screen 
        image(this.frameBufferOutput, 0, 0, width, height)
        

        // draw overlays
        this.drawMapOverlays();
        
        // output image of graph
        
        if (this.isGraphActive()){
            
            let alphaX = (this.marginLeft + this.marginCurrentOffset) / width;
        
            image(this.frameBufferGraph, 0, 0,  width * alphaX, height, 0, 0, width * alphaX, height);

            
        }

        
        this.drawButtons();
        

    }

    
    //======================== button methods ===========================\\ 
    this.addButton = function(x, y, w, h, drawFunc, onClickFunc, parent){
        
        let btn = {
            x : x,
            y : y,
            w : w,
            h : h,
            hovered : false,
            draw    : drawFunc, 
            onClick : onClickFunc,
            parent  : parent
        }
        this.buttons.push(btn);
    }
    
    this.setupButtons = function(){
        
        
        let closeMarginBtnDraw = function() {
            
            
            if (this.parent.marginExpanded){

            // we need to animate the button's transition
            // it goes from left to right corner on margin expansion 
        
            let alphaX = (this.parent.marginLeft + this.parent.marginCurrentOffset) / width;

                
            let x           = lerp( 0, this.x, alphaX) ;
            let y           = this.y;
            
            
            // draw border rectangle of the symbol
            push()
                
                // draw it differently depending if mouse is hovered on it 
                if (this.hovered){
                    fill(255,0,0, alphaX * 255);
                    rect(x - 5.0, y - 5.0, this.w + 10.0, this.w + 10.0);
                    
                    stroke(255,255,255, alphaX * 255);
                    strokeWeight(2);

                    line(x,y, x + this.w - 1, y + this.w -1 )    
                    line(x,y + this.w - 1, x + this.w -1, y )      
                }
                else{
                    
                    noFill();
                    stroke(255,0,0, alphaX * 255.0);
                    strokeWeight(2);

                    line(x,y, x + this.w, y + this.w )    
                    line(x,y + this.w, x + this.w, y )    
                    
                }

            pop()
            }
        }


        let zoomInButton = function() {
            
            if (!this.parent.isGraphActive()){

                let x           = this.x ;
                let y           = this.y;
   
                // draw border rectangle of the symbol
                push()

                    // draw it differently depending if mouse is hovered on it 

                    if (this.hovered){
                            
     
                        fill(255,230,180);
                        strokeWeight(1);
                        stroke(55);
                
                        rect(x,y,this.w,this.h, 4);
                        strokeWeight(2);
                        stroke(0);
                        line(x + this.w * 0.25,y + this.h * 0.5, x + this.w * 0.75, y + this.h * 0.5);
                        line(x + this.w * 0.5,y + this.h * 0.25, this.x + this.w * 0.5, y + this.h * 0.75);


                    }
                    else{

                        fill(255);
                        strokeWeight(1);
                        stroke(55);
                    
                        
                        rect(x,y,this.w,this.h, 4);
                        strokeWeight(2);
                        stroke(100);
                        line(x + this.w * 0.25,y + this.h * 0.5, x + this.w * 0.75, y + this.h * 0.5);
                        line(x + this.w * 0.5,y + this.h * 0.25, this.x + this.w * 0.5, y + this.h * 0.75);

                    

                    }

                pop();
            }
  
        }
        
        let zoomOutButton = function() {
            
            
            if (!this.parent.isGraphActive()){

                let x           = this.x ;
                let y           = this.y;
                

                // draw border rectangle of the symbol
                push()

                    // draw it differently depending if mouse is hovered on it 

                    if (this.hovered){
                            
     
                        fill(255,230,180);
                        strokeWeight(1);
                        stroke(55);
                
                        rect(x,y,this.w,this.h, 4);
                        strokeWeight(2);
                        stroke(0);
                        line(x + this.w * 0.3,y + this.h * 0.5, x + this.w * 0.7, y + this.h * 0.5);


                    }
                    else{

                        fill(255);
                        strokeWeight(1);
                        stroke(55);
                    
                        
                        rect(x,y,this.w,this.h, 4);
                        strokeWeight(2);
                        stroke(100);
                        line(x + this.w * 0.3,y + this.h * 0.5, x + this.w * 0.7, y + this.h * 0.5);

                    

                    }

                pop();
            }
  
        }
            
        
        let zoomToAfrica = function() {    
            if (!this.parent.isGraphActive()){

                let x           = this.x ;
                let y           = this.y;
                let w           = this.w;
                let h           = this.h;
                
                // draw border rectangle of the symbol
                push()
                    // draw it differently depending if mouse is hovered on it 
                    textAlign('center', 'center');
                
                    strokeWeight(1);
                    stroke(50,50,100);
                
                    if (this.hovered){
                        fill(255,230,180);
                        rect(x,y,w,h, 4);
                    }
                    else{
                        fill(255);
                        rect(x,y,w,h,4);
                    }
                    noStroke();
                    textSize(12);
                    fill(0);
                    text("AF", x + w * 0.5, y + h * 0.55);
                pop();
            }
  
        }
            
        let zoomToAsia = function() {    
            if (!this.parent.isGraphActive()){

                let x           = this.x ;
                let y           = this.y;
                let w           = this.w;
                let h           = this.h;
                
                // draw border rectangle of the symbol
                push()
                    // draw it differently depending if mouse is hovered on it 
                    textAlign('center', 'center');
                
                    strokeWeight(1);
                    stroke(50,50,100);
                
                    if (this.hovered){
                        fill(255,230,180);
                        rect(x,y,w,h, 4);
                    }
                    else{
                        fill(255);
                        rect(x,y,w,h,4);
                    }
                    noStroke();
                    textSize(12);
                    fill(0);
                    text("AS", x + w * 0.5, y + h * 0.55);
                pop();
            }
  
        }
        
        let zoomToEU = function() {    
            if (!this.parent.isGraphActive()){

                let x           = this.x ;
                let y           = this.y;
                let w           = this.w;
                let h           = this.h;
                
                // draw border rectangle of the symbol
                push()
                    // draw it differently depending if mouse is hovered on it 
                    textAlign('center', 'center');
                
                    strokeWeight(1);
                    stroke(50,50,100);
                
                    if (this.hovered){
                        fill(255,230,180);
                        rect(x,y,w,h, 4);
                    }
                    else{
                        fill(255);
                        rect(x,y,w,h,4);
                    }
                    noStroke();
                    textSize(12);
                    fill(0);
                    text("EU", x + w * 0.5, y + h * 0.55);
                pop();
            }
  
        }
                       
              
        let zoomToNA = function() {    
            if (!this.parent.isGraphActive()){

                let x           = this.x ;
                let y           = this.y;
                let w           = this.w;
                let h           = this.h;
                
                // draw border rectangle of the symbol
                push()
                    // draw it differently depending if mouse is hovered on it 
                    textAlign('center', 'center');
                
                    strokeWeight(1);
                    stroke(50,50,100);
                
                    if (this.hovered){
                        fill(255,230,180);
                        rect(x,y,w,h, 4);
                    }
                    else{
                        fill(255);
                        rect(x,y,w,h,4);
                    }
                    noStroke();
                    textSize(12);
                    fill(0);
                    text("NA", x + w * 0.5, y + h * 0.55);
                pop();
            }
  
        }
                
           
        let zoomToOC = function() {    
            if (!this.parent.isGraphActive()){

                let x           = this.x ;
                let y           = this.y;
                let w           = this.w;
                let h           = this.h;
                
                // draw border rectangle of the symbol
                push()
                    // draw it differently depending if mouse is hovered on it 
                    textAlign('center', 'center');
                
                    strokeWeight(1);
                    stroke(50,50,100);
                
                    if (this.hovered){
                        fill(255,230,180);
                        rect(x,y,w,h, 4);
                    }
                    else{
                        fill(255);
                        rect(x,y,w,h,4);
                    }
                    noStroke();
                    textSize(12);
                    fill(0);
                    text("OC", x + w * 0.5, y + h * 0.55);
                pop();
            }
  
        }
        
           
        let zoomToSA = function() {    
            if (!this.parent.isGraphActive()){

                let x           = this.x ;
                let y           = this.y;
                let w           = this.w;
                let h           = this.h;
                
                // draw border rectangle of the symbol
                push()
                    // draw it differently depending if mouse is hovered on it 
                    textAlign('center', 'center');
                
                    strokeWeight(1);
                    stroke(50,50,100);
                
                    if (this.hovered){
                        fill(255,230,180);
                        rect(x,y,w,h, 4);
                    }
                    else{
                        fill(255);
                        rect(x,y,w,h,4);
                    }
                    noStroke();
                    textSize(12);
                    fill(0);
                    text("SA", x + w * 0.5, y + h * 0.55);
                pop();
            }
  
        }
        
           
        let zoomOutRESET = function() {    
            if (!this.parent.isGraphActive()){

                let x           = this.x ;
                let y           = this.y;
                let w           = this.w;
                let h           = this.h;
                
                // draw border rectangle of the symbol
                push()
                    // draw it differently depending if mouse is hovered on it 
                    textAlign('center', 'center');
                
                    strokeWeight(1);
                    stroke(50,50,100);
                
                    if (this.hovered){
                        fill(255,230,180);
                        rect(x,y,w,h, 4);
                    }
                    else{
                        fill(255);
                        rect(x,y,w,h,4);
                    }
                    noStroke();
                    textSize(12);
                    fill(0);
                    text("RESET", x + w * 0.5, y + h * 0.55);
                pop();
            }
  
        }
        
        
                
        let floodMapModeButton = function() { 
            
            if (!this.parent.isGraphActive()){
                    
                let x           = this.x ;
                let y           = this.y;
                let w           = this.w;
                let h           = this.h;
                
                // draw border rectangle of the symbol
                push()
                    // draw it differently depending if mouse is hovered on it 
                    textAlign('center', 'center');
                
                    strokeWeight(1);
                    stroke(50,50,100);
                    
                    if (this.hovered){
                        fill(255,230,180);
                        rect(x,y,w,h, 4);
                    }
                    else{
                        if (this.state){
                            fill(100,255,100);
                          
                        }
                        else{
                            fill(255,100,100);
                        }
                        rect(x,y,w,h,4);
                        
                        
                    }
                
                    if (this.state){
                        // draw gradient info 
                        image(this.parent.gradientInfoTex, 50, 400);
                    }
                    noStroke();
                    textSize(12);
                    fill(0);
                    text("MODE", x + w * 0.5, y + h * 0.55);
                pop();
            }
  
        }
        
        
        
        
        this.addButton(
            100,
            70,
            30,
            22,
            zoomToAfrica,
            function() {
                this.parent.ZoomIntoMapCoordinates(4500,1800);

            },
            this
        )
     
                     

        this.addButton(
            135,
            70,
            30,
            22,
            zoomToAsia,
            function() {
                this.parent.ZoomIntoMapCoordinates(6600,1500);

            },
            this
        )
     

     
        this.addButton(
            170,
            70,
            30,
            22,
            zoomToEU,
            function() {
                this.parent.ZoomIntoMapCoordinates(4280,900);

            },
            this
        )
        
        
        this.addButton(
            205,
            70,
            30,
            22,
            zoomToNA,
            function() {
                this.parent.ZoomIntoMapCoordinates(1800,1111);
            },
            this
        )
        
             
        this.addButton(
            240,
            70,
            30,
            22,
            zoomToOC,
            function() {
                this.parent.ZoomIntoMapCoordinates(7100,2500);
            },
            this
        )
        
        this.addButton(
            275,
            70,
            30,
            22,
            zoomToSA,
            function() {
                this.parent.ZoomIntoMapCoordinates(2700,2300);
            },
            this
        )
            
        this.addButton(
            315,
            70,
            50,
            22,
            zoomOutRESET,
            function() {
                this.parent.mapZoom(-100);
            },
            this
        )
        
        this.addButton(
            375,
            70,
            50,
            22,
            floodMapModeButton,
            function() {
                if (this.state==undefined){ 
                    this.state = true;
                    this.parent.floodMapMode = 1;
                }
                else{
                    this.state = !this.state;
                    this.parent.floodMapMode = this.state ? 1 : 0
                }
            },
            this
        )
        
        
        
        
        
  
        this.addButton(
            width - 30,
            10,
            20,
            20,
            closeMarginBtnDraw,
            function() {this.parent.marginExpanded = false;},
            this
        )

        
        this.addButton(
            50,
            70,
            30,
            30,
            zoomInButton,
            function() {
                this.parent.mapZoom(5, width/2, height/2);
            },
            this
        )
        
      this.addButton(
            50,
            110,
            30,
            30,
            zoomOutButton,
            function() {
                this.parent.mapZoom(-5, width/2, height/2)
            },
            this
        )
        
        
        
    }
    this.drawButtons = function(){
        for (let i=0; i<this.buttons.length; i++){
            this.buttons[i].draw();
        }        
    }
        
    this.buttonsOnMouseClick = function() {
        for (let i=0; i<this.buttons.length; i++){
            
            let btn = this.buttons[i];
            
            // if mouse clicked is within the button's bounds 
            if (mouseX >= btn.x && mouseX <= (btn.x + btn.w) && 
                mouseY >= btn.y && mouseY <= (btn.y + btn.h))
            {
                if (btn.onClick != undefined) {btn.onClick()}
            }
        }
        
    }
    
    this.thinkButtons = function(){
        for (let i=0; i<this.buttons.length; i++){

            let btn = this.buttons[i];
            
            // if mouse is within the button's bounds.. set its hover state to true else false
            if (mouseX >= btn.x && mouseX <= (btn.x + btn.w) && 
                mouseY >= btn.y && mouseY <= (btn.y + btn.h))
            {
                btn.hovered = true;   
            }
            else{
                btn.hovered = false;   
            }
        }
    }
    
        
    //===================== event methods ======================\    
    
    
    this.windowResized = function(){
   
    }
    
    this.mouseDragged = function(){
        if (this.isValidMousePosition() && !this.isGraphActive()){
            this.updateMapPosition(); 
        }
        if (this.isGraphActive()){
            this.graphUpdateMouseZoomCoordinates();

        }
        else{
            
            
            if (mouseY >= 0 && mouseY <= this.yearSliderHeight && !this.isGraphActive()){
                this.yearSliderClickUpdate();
                this.setHighlightedDataPoint(this.currentYearSelected);
            }
         
        }
    }
    
    this.viewPortToMapSpace = function(x, y){
        
        let x0World   = this.internals.x;
        let y0World   = this.internals.y;

        let xWorldMin = x0World;
        let xWorldMax = x0World + this.internals.w;
        
        let yWorldMin = y0World;
        let yWorldMax = y0World + this.internals.h;
        
        let xWorldScreenMin = width - (0.5 * this.internals.w);
        let xWorldScreenMax = this.internals.w * 0.5;
        
        let yWorldScreenMin = height - ( 0.5 * this.internals.h);
        let yWorldScreenMax =  this.internals.h* 0.5;
        
        let dx0  = this.worldMapBase.width / this.internals.w;
        let dy0  = this.worldMapBase.height / this.internals.h;
 
        let xToWorld = this.worldMapBase.width - ((xWorldScreenMax - xWorldMax + x) * -1.0) *  dx0;
        let yToWorld = this.worldMapBase.height - ((yWorldScreenMax - yWorldMax + y) * -1.0) *  dy0;
       
        return [xToWorld, yToWorld];
        
    }
    
       
    this.mapSpaceToViewPort = function(x, y){
        
        let x0World   = this.internals.x;
        let y0World   = this.internals.y;

        let xWorldMin = x0World;
        let xWorldMax = x0World + this.internals.w;
        
        let yWorldMin = y0World;
        let yWorldMax = y0World + this.internals.h;
        
        let xWorldScreenMin = width - (0.5 * this.internals.w);
        let xWorldScreenMax = this.internals.w * 0.5;
        
        let yWorldScreenMin = height - ( 0.5 * this.internals.h);
        let yWorldScreenMax =  this.internals.h* 0.5;
        
        let dx0  = this.worldMapBase.width / this.internals.w;
        let dy0  = this.worldMapBase.height / this.internals.h;
        
        let xToView = ((x - this.worldMapBase.width) / dx0) - xWorldScreenMax + xWorldMax;
        let yToView = ((y - this.worldMapBase.height) / dy0) - yWorldScreenMax + yWorldMax;

        return [xToView, yToView];
        
    } 
    this.mouseClicked = function(){
        this.buttonsOnMouseClick();
        if (this.isGraphActive()){
            
            // click on graph to highlight it 
            if (this.mouseWithinGraph() && !this.graph.mouseBeginZoom){
                this.setHighlightedDataPoint(this.graphQueryYearAtPos(mouseX));
            }

            this.checkGraphZoomToolClicked();       
        }
        
        else{
            
            if (mouseY >= 0 && mouseY <= this.yearSliderHeight){
                this.yearSliderClickUpdate();
                this.setHighlightedDataPoint(this.currentYearSelected);
            }
        }  
    }

    this.mousePressed = function(){
        if (this.isGraphActive())
        {
            this.graphOnMousePressed();
        }
        
    }
    
        
        
    this.mouseReleased = function(){
        if (this.isGraphActive())
        {
            this.graphOnMouseReleased();
        }
    }

    
    this.doubleClicked = function(){
    }
    
    // apply zoom when mouse is scrolled
    this.mouseWheel= function(event){       
        if (this.isValidMousePosition() && !this.isGraphActive()){
            var e = -event.delta;
            this.mapZoom( constrain(e,-1,1) );   
        }
  
    }
}




