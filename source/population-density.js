function PopulationDensity() {

    this.name = 'Global Population Density (2020)';

    this.id = 'population-density';
    
    
    // title
    this.title = "World Population Density: 2020"
    
    this.subTitle = "This visualization shows the population density throughout the world in 2020. The height of the column represents the density in that specific area. Please be patient while loading and processing the density data (64,800 points). To view this visualization, your browser must support WEBGL.";
    
    this.footer = "This map is based on open data. The earth map is based on a download from the Nasa Earth observatory. The density information was downloaded from the SocioEconomic Data and Application Center."

    // has data been loaded?
    this.loaded = false;
    
    // globe tex
    this.globeTexture;
    this.cloudsTexture;
    this.moonTexture;
    this.sunTexture;

    // rt textures
    this.frameBuffer0;
    this.frameBuffer1;
    this.frameBuffer2;

    
    // overlay properties
    this.displayInfo = true;
    
    // event properties 
    this.lastMouseDraggedEvent = 0;
    
    // scene properties
    this.angularVel    = [0,0,0];
    this.currentAngles = [220,720,0];
    this.currentFOV = 90;
    this.densityFieldColor = [255,255,255, 50];
    
    
    // number of points downsample 
    this.dataDownSample = 2;
    
    // initialize has setup to false
    // so that certain things don't get 
    // re-created whenever you switch visualizations
    
    this.hasSetup = false;
    
    this.setupTimer = 0.0;
    
    this.preload = function() {
        
        // load font
        this.font = loadFont("./resources/Aaargh.ttf");
        
        this.globeTexture = loadImage("datasets/map2.png");
        this.cloudsTexture = loadImage("imgmisc/clouds.png");
        this.moonTexture   = loadImage("imgmisc/moon.jpg");
        this.sunTexture    = loadImage("imgmisc/sun.jpg");
        this.starsTexture  = loadImage("imgmisc/stars.png");

        // load shaders
        this.loadShaders();

        
        var self = this;
        this.data = loadTable(
        './datasets/population_density/gpw_v4_population_density_rev11_2020_1_deg.txt', 'txt',
        
        function(table) {
            
            self.loaded = true;
            self.preProcessData();
            self.createSphereDensityField();
            

        });
        
        
    };
    
    this.loadShaders = function(){
        
        // load shader
        let shaderMerge = loadShader('resources/shaders/merge.vert', 'resources/shaders/merge.frag');
        this.shaderMerge = shaderMerge;
    
    }
    
    
    this.setup = function() {
        

        // only setup render targets once  
        if (!this.hasSetup){
            // where everything will get written to in the end
            this.frameBuffer0 =  createGraphics(width, height);
            this.frameBuffer0.clear();
            
            // where 3d geometry will be rendered 
            this.frameBuffer1 =  createGraphics(width, height, WEBGL);   
            
            // where density points will be rendered 
            this.frameBuffer2 =  createGraphics(width, height, WEBGL);        

            // Font defaults.
            this.frameBuffer0.textFont(this.font);
            this.frameBuffer0.textAlign('center', 'center');
            this.frameBuffer0.textStyle(BOLD);

            
            // setup buttons
            this.setupButtons();
            
            // set to true so that this block of code doesn't get re-run on next visualization switch
            this.hasSetup = true;
            
            // timer for intro animation
            this.setupTimer = millis() * 0.001;
        
            // pre-draw overlay info
            this.drawInfo();
        }
      
        
    };
    
    
    this.preProcessData = function(){
        
        let data = this.data.getArray();
        
        // create density data object
        let densityData = {
            header : {min : -1, max : -1},
            data   : [],
            
        };
        
        // retrieve downsample rate 
        let downSampleRate = this.dataDownSample;
        
        // collapse density data into a one dimensional array with a header
        // and content data
        
        for (let longitude = 0; longitude < data[0].length - 2; longitude+=downSampleRate){
            for (let latitude = 0; latitude < data.length - 2; latitude+=downSampleRate){  
                    
                
                let densityAtCoordinate = data[latitude][longitude];
                
                // reduce the amount of density points near polar region
                // as data there isn't interesting
                
                let polarDensityMask    = latitude <= 30 ? 
                                          latitude <= 20 ? longitude % 16 == 0 
                                          : longitude % 2 == 0 : true;
                
                if (polarDensityMask){

                    if (densityAtCoordinate!=-9999){
                        
                        // resample density to lower the amount of data points that are rendered
                        let resampledDensity = nearestNeighborAverage(data, latitude, longitude, downSampleRate, downSampleRate);
                        
                        // initialize min max value of the entire dataset of densities
                        if (densityData.header.max == -1){
                            densityData.header.max = resampledDensity;
                            densityData.header.min = densityAtCoordinate;
                        }


                        densityData.data.push({

                            longitude : longitude,
                            latitude  : latitude,
                            density   : parseFloat(densityAtCoordinate),


                        });

                        
                        // update density data header
                        densityData.header.max = max(densityData.header.max, densityAtCoordinate);
                        densityData.header.min = min(densityData.header.min, densityAtCoordinate);     
                    
                    }
                }                   
            }
        }
        

        
        
        
     
        this.densityField = densityData;
    }
    
    
    this.buildMeshCache = function(mesh){
        
        
        // build mesh cache so that 
        // we can render more polygons at a fraction
        // of cost of drawing them using the cpu
        
        let vertices = [];
        let faces    = [];
        
        let t = millis() * 0.001;
        
        console.log("building mesh cache")
        
        // build mesh cache
        
        // format vertices and faces to .OBJ file format standard
        for (let cubeIndex=0; cubeIndex < mesh.length; cubeIndex++){
            
            let nverts = mesh[cubeIndex].length;
            
            for (let i=0; i<mesh[cubeIndex].length; i++){
                
                vertices.push("v " + mesh[cubeIndex][i][0] + " " + mesh[cubeIndex][i][1] + " " + mesh[cubeIndex][i][2])
  
                if (i%4==0){
                    faces.push("f " + (cubeIndex * nverts + i+1) + " " + (cubeIndex * nverts + i+2) 
                              + " " + ( cubeIndex * nverts + i+3) + " " + ( cubeIndex * nverts + i+4) );
                }
            }

        }
        
        // join vertices and faces together
        let objFile = vertices.concat(faces);
        
        // load p5 geometric model from faces and vertices strings array
        let model   = loadModelFromStrings(objFile);
        
        // save cached geometric model
        this.mesh = model;
        
        print("finished in ", millis() * 0.001 - t + " seconds")
 
    }
    this.createCubeOnSphere = function(pos, normal, npos, size, radius, height){
        
        
        // calculate tangential axis 
        let tangent = [npos[0] - pos[0], npos[1] - pos[1], npos[2] - pos[2]];
        
        // get tangent length
        let tangentLength = Math.sqrt(tangent[0] ** 2 + tangent[1] ** 2 + tangent[2] ** 2);
        
        // normalize tangent vector
        tangent = [tangent[0] / tangentLength, tangent[1] / tangentLength, tangent[2] / tangentLength];
        
        // get bitangent given tangent and normal 
        let bitangent = [
            tangent[1] * normal[2] - tangent[2] * normal[1],
            tangent[2] * normal[0] - tangent[0] * normal[2],
            tangent[0] * normal[1] - tangent[1] * normal[0]
        ]
            
        
        // sphere surface vertices 
        let vert1 = [pos[0] + tangent[0] * size, 
                     pos[1] + tangent[1] * size,
                     pos[2] + tangent[2] * size]
        
        let vert2 = [pos[0] + bitangent[0] * size, 
                     pos[1] + bitangent[1] * size,
                     pos[2] + bitangent[2] * size]

        let vert3 = [pos[0] + tangent[0] * -size, 
                     pos[1] + tangent[1] * -size,
                     pos[2] + tangent[2] * -size]
        
        let vert4 = [pos[0] + bitangent[0] * -size, 
                     pos[1] + bitangent[1] * -size,
                     pos[2] + bitangent[2] * -size]    
        
        
        // vertices plus normal * height
        
        let vert5 = [pos[0] + tangent[0] * size + normal[0] * height, 
                     pos[1] + tangent[1] * size + normal[1] * height,
                     pos[2] + tangent[2] * size + normal[2] * height]
        
        let vert6 = [pos[0] + bitangent[0] * size + normal[0] * height, 
                     pos[1] + bitangent[1] * size + normal[1] * height,
                     pos[2] + bitangent[2] * size + normal[2] * height]

        let vert7 = [pos[0] + tangent[0] * -size + normal[0] * height, 
                     pos[1] + tangent[1] * -size + normal[1] * height,
                     pos[2] + tangent[2] * -size + normal[2] * height]
        
        let vert8 = [pos[0] + bitangent[0] * -size + normal[0] * height, 
                     pos[1] + bitangent[1] * -size + normal[1] * height,
                     pos[2] + bitangent[2] * -size + normal[2] * height ]    
        
        // oh lord, forgive me for I'm about to sin with the code below 
        // this is basically a hack for P5.js as there's a problem
        // with rendering models that are loaded on spot
        
        let verts = [
           
            vert1,vert2,vert3,vert4, 
            vert1,vert2,vert3,vert4, 
            vert1,vert2,vert3,vert4, 
   
            vert5,vert8,vert7,vert6,
            vert5,vert8,vert7,vert6,
            vert5,vert8,vert7,vert6,
           
            vert1,vert5,vert6,vert2,
            vert1,vert5,vert6,vert2,
            vert1,vert5,vert6,vert2,
           
            vert2,vert6,vert7,vert3,
            vert2,vert6,vert7,vert3,
            vert2,vert6,vert7,vert3,
     
            vert3,vert7,vert8,vert4,
            vert3,vert7,vert8,vert4,
            vert3,vert7,vert8,vert4,
  
            vert5,vert1, vert4,vert8,
            vert5,vert1, vert4,vert8,
            vert5,vert1, vert4,vert8,
           
        ];
       
        
        return verts;
    }

    this.getVectorFromLatLong = function(lat, lon, radius) {
        
        // convert latitute and longitude to a vector
        
        var phi   = radians(lat);
        var theta = radians(lon);
        
        var x = cos(phi) * cos(theta) * -radius;
        var y = sin(phi) * radius;
        var z = radius   * cos(phi) * sin(theta);
        
        return [x,y,z];
    }
    
    this.createSphereDensityField = function(){

        let PI = Math.PI;

        let radius    = 300;
        let lengthInv = 1.0 / radius;

        let data = this.data.getArray();

        let cubes = [];

        for (let i=0; i<this.densityField.data.length; i++){
            
            let data = this.densityField.data[i];
            
            // retrieve density data and set offsets to lat and long
            let density = data.density;
            let longitude = 91 + data.longitude - 180 ;
            let latitude  = (data.latitude + 90) * -1;
           
            // calculate pos and future pos of cubes
            let pos   = this.getVectorFromLatLong(latitude, longitude, 300);
            let pos2  = this.getVectorFromLatLong(latitude + 0.00001, longitude + 0.00001, 300);
                
            // calculate cube normals
            let nx = pos[0] * lengthInv;
            let ny = pos[1] * lengthInv;
            let nz = pos[2] * lengthInv;

            // merge cube mesh with cubes mesh 
            cubes.push(
                this.createCubeOnSphere(pos, [nx,ny,nz], pos2, 1.4 * this.dataDownSample, radius, 2 + density / 25)
            );
            
        }
        
        // build cache 
        this.buildMeshCache(cubes);

    
    }
   
    this.sceneRotate = function(rt, x,y,z){
        
        // rotate scene given render target and angles in radians
        rt.rotateX(x);
        rt.rotateY(y);
        rt.rotateZ(z);
        
    }
    
    this.drawStars = function(x,y,z){
        
        let shaderStars = this.shaderStars;        
        let rtScene = this.frameBuffer1;
        let starFieldDensity = 10;
        
        rtScene.fill(255,255,255,0);
        
        rtScene.texture(this.starsTexture);
        
        let angX = 0;
        let angY = 0;
        let angZ = 0;
        
        // draw field of stars
        // at different angles and offsets relative to each other
        // this produces parallax effect
        for (let i=0; i<starFieldDensity; i++){
            
            let alpha = -(i/starFieldDensity)*0.05;
            this.sceneRotate(rtScene, x * alpha, y * alpha , z * alpha );        
            rtScene.sphere(2000, 16, 16);    
            
        }
        rtScene.fill(255,255,255,0);

    }
    
    this.drawMoon = function(){

        // draw moon 
        let rtScene = this.frameBuffer1;
    
        rtScene.texture(this.moonTexture);
        rtScene.translate(1000, 0, 0);
        rtScene.sphere(50, 32, 32);
        rtScene.translate(-1000, 0, 0);
 
    }
    
    this.drawInfo  = function(){
        
        // don't draw info if it's not enabled
        
        if (!this.displayInfo){
            return;
        }
        
        let rtInfo = this.frameBuffer0;
        
        rtInfo.noStroke();
        rtInfo.fill(0,0,0,80);
        rtInfo.rect(0,0,width,100);
        
        rtInfo.fill(255);
        rtInfo.textAlign('center', 'center');
        rtInfo.textStyle(BOLD);
        rtInfo.textSize(30);
        
        // draw title
        rtInfo.text(this.title, 500, 25);
        rtInfo.textAlign('center', 'center');

        // draw sub-title
        rtInfo.textSize(10);
        rtInfo.text(this.subTitle, 100, 70, width * 0.8);
        
        // draw footer 
        rtInfo.text(this.footer, 100, height - 50, width * 0.8);
    }
    this.drawSun = function(){

        // draw sun 
        
        let rtScene = this.frameBuffer1;
        rtScene.texture(this.sunTexture);
        rtScene.translate(0, 0, 5000);
        rtScene.plane(5000);
        rtScene.translate(0, 0, -5000);
 

    }
        
    
    this.drawEarth = function(x,y,z){
        
        // get render targets
        let rtScene  = this.frameBuffer1;        
        let rtScene2 = this.frameBuffer2;
        
        // this probably doesn't work? 
        // p5.js isn't really that great of a tool for doing webgl stuff
        rtScene._renderer._applyColorBlend(ADD);

        this.sceneRotate(rtScene, x, y, z);
        this.sceneRotate(this.frameBuffer2, x, y, z);
        
        // draw earth 
        rtScene.texture(this.globeTexture);
        rtScene.sphere(300, 32, 16);
                
        // draw atmosphere
        rtScene.texture(this.cloudsTexture);
        rtScene.sphere(310, 16, 16);
    
        
        
        // if mesh created
        if (this.mesh){
            
            // get mesh scale 
            let meshScale = smoothstep(0, 1, (min(millis() * 0.001 - this.setupTimer, 5.0) / 5.0));
            
            // draw sphere mark for mesh
            // without this, cubes will be see-through 
            
            rtScene2.fill(0,0,0, 255)
            rtScene2.sphere(300, 16, 16);
            
            rtScene2.fill(
                this.densityFieldColor[0],
                this.densityFieldColor[1],
                this.densityFieldColor[2],
                this.densityFieldColor[3]
            )
            
            rtScene2.scale(meshScale);
            
            rtScene2.model(this.mesh);
            
    
        }
    
        
        // draw sun 
        this.drawSun();
        
        // draw moon 
        this.drawMoon(x, y, z);
        
      
    
    
    }
    
    
    this.mouseDragged = function(){
        
        // update last mouse dragged event so that 
        // the scene knows when to begin to auto rotate
        
        this.lastMouseDraggedEvent = millis() * 0.001;
        
        // update angular velocity on two axis 
        this.angularVel[0] += (mouseX-pmouseX) * 0.01;
        this.angularVel[1] += (mouseY-pmouseY) * -0.01;

    }
    
    this.mouseWheel = function(event){
        // update fov (zoom) when mouse scrolls
        this.currentFOV += (event.delta / 100);
    }
    
    
    this.updateSceneAngularVelocity = function(){
        
        // auto rotate when last dragged event was more than 5 seconds ago
        let shouldAutoRotate = millis() * 0.001 - this.lastMouseDraggedEvent > 5 ? true : false;
        
        
        if (shouldAutoRotate){
            
            let timeDiffSinceDragged = constrain(millis() * 0.001 - this.lastMouseDraggedEvent, 5, 10);
            let angularVelAlpha = (timeDiffSinceDragged - 5) / 5; 
            this.angularVel[0] = lerp(0.0, 0.1, angularVelAlpha);
            
        }
        
        // update current angle 
        this.currentAngles[0] += this.angularVel[0];
        this.currentAngles[1] += this.angularVel[1];
        this.currentAngles[2] += this.angularVel[2];
        
        // dampen angular vel 
        
        this.angularVel[0] *= 0.9;
        this.angularVel[1] *= 0.9;
        this.angularVel[2] *= 0.9;
        
        
    }
    
    
    
    this.drawScene = function(){
        
        
        // draw scene 
        let rtScene  = this.frameBuffer1;
        let rtScene2 = this.frameBuffer2;
        let rtOut    = this.frameBuffer0;
        
        // do not enable stroke
        rtScene.noStroke();
        rtScene2.noStroke();
        
        // retrieve shader merge for merging two 
        // render targets together without alpha blending
        
        let shaderMerge = this.shaderMerge;
        
        // disable stroke for upcoming render operations
        rtScene.noStroke();
        rtScene2.noStroke();
        rtOut.noStroke();
        
        // set fov (or rather zoom level) for both scenes
        rtScene.perspective(radians(this.currentFOV));
        rtScene2.perspective(radians(this.currentFOV));

        // set camera angles
        let rotX = radians(this.currentAngles[1])
        let rotY = radians(this.currentAngles[0]);
        let rotZ = radians(350);
        
        this.drawEarth(rotX, rotY, rotZ);
        this.drawStars(rotX, rotY, rotZ);
        
        
        rtScene.shader(shaderMerge);
        shaderMerge.setUniform('rt0', rtScene);
        shaderMerge.setUniform('rt1', rtScene2);
        rtScene.rect(0,0,width,height);

        
    }
    this.draw = function() {

        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }        
        // clear buffers
        this.frameBuffer1.background(0);
        this.frameBuffer2.background(0);

        // update angular velocity
        this.updateSceneAngularVelocity();
        
        // draw scene
        this.drawScene();

        
        // reset canvases to their original state w/o translations / rotations / scaling
        this.frameBuffer1.reset();
        this.frameBuffer2.reset();

        
        image(this.frameBuffer1, 0.0, 0.0, width, height);
        
        // button related function calls
    
        this.drawButtons();
        
        // display overlay if it's meant to be drawn
    
        if (this.displayInfo){
            image(this.frameBuffer0, 0.0, 0.0, width, height);
            
        }
       
    };
    
    
    this.setupButtons = function(){
        
        
        let toggleInfo = function() { 

            let x           = this.x ;
            let y           = this.y;
            let w           = this.w;
            let h           = this.h;

            // draw border rectangle of the symbol
            push()
                // draw it differently depending if mouse is hovered on it 
                textAlign('center', 'center');

                strokeWeight(1);
                stroke(155, 155, 155, 50);
                textSize(35);

                if (this.hovered){


                    if (this.state){
                        fill(255,255,255, 255);
                    }
                    else{
                        fill(255,255,255, 200);
                    }

                    ellipse(x + w * 0.5, y + h * 0.5, w * 0.5);

                    noStroke();
                    fill(0);
                    text("ⓘ", x + w * 0.5, y + h * 0.50);


                }
                else{

                    if (!this.state){

                        fill(55,55,55, 200);
                        ellipse(x + w * 0.5, y + h * 0.5, w * 0.5);

                        noStroke();
                        fill(255);
                        text("ⓘ", x + w * 0.5, y + h * 0.50);

                    }


                    else{

                        fill(255,255,255, 200);
                        ellipse(x + w * 0.5, y + h * 0.5, w * 0.5);

                        noStroke();
                        fill(0);
                        text("ⓘ", x + w * 0.5, y + h * 0.50);

                    }


                }

            pop();

        }
        
        // add button that changes alpha 
        let toggleAlpha = function() { 
             
            let x           = this.x ;
            let y           = this.y;
            let w           = this.w;
            let h           = this.h;

            // draw border rectangle of the symbol
            push()
                // draw it differently depending if mouse is hovered on it 
                textAlign('center', 'center');

                strokeWeight(1);
                stroke(155, 155, 155, 50);
                textSize(25);
                
                if (this.hovered){
                    
                    
                    if (this.state){
                        fill(255,255,255, 255);
                    }
                    else{
                        fill(255,255,255, 200);
                    }
                    
                    ellipse(x + w * 0.5, y + h * 0.5, w * 0.5);

                    noStroke();
                    fill(0);
                    text("A", x + w * 0.5, y + h * 0.50);

                    
                }
                else{
           
                    if (!this.state){
                        
                        fill(55,55,55, 200);
                        ellipse(x + w * 0.5, y + h * 0.5, w * 0.5);

                        noStroke();
                        fill(255);
                        text("A", x + w * 0.5, y + h * 0.50);

                    }


                    else{
                        
                        fill(255,255,255, 200);
                        ellipse(x + w * 0.5, y + h * 0.5, w * 0.5);

                        noStroke();
                        fill(0);
                        text("A", x + w * 0.5, y + h * 0.50);

                    }
                    

                }

            pop();

        }
           
           
        // add button that changes globe's alpha 
        buttons.addButton(
            940,
            height * 0.45,
            80,
            80,
            toggleAlpha,
            
            function() {
                this.state = !this.state;
                this.parent.densityFieldColor[3] = (this.parent.densityFieldColor[3] + 25) % 255; 
            },
            
            this
            
        )
        
        
        // add button that toggles info
        buttons.addButton(
            940,
            height * 0.35,
            80,
            80,
            toggleInfo,
            
            function() {
                this.state = !this.state;
                this.parent.displayInfo = this.state;
            },
            
            this
            
        )
        

        
        
    }
    
    
    this.mouseClicked = function(){
        buttons.buttonsOnMouseClick(this);
    }

    this.drawButtons = function(){
        buttons.thinkButtons(this);
        buttons.drawButtons(this);
    }


}
