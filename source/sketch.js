
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;
function setup() {
    // Create a canvas to fill the content div from index.html.
    canvasContainer = select('#app');
    var c = createCanvas(1024, 576);
    c.parent('app');

    // Create a new gallery object.
    gallery = new Gallery();

    // Add the visualisation objects here.
    gallery.addVisual(new TechDiversityRace());
    gallery.addVisual(new TechDiversityGender());
    gallery.addVisual(new PayGapByJob2017());
    gallery.addVisual(new PayGapTimeSeries());
    gallery.addVisual(new ClimateChange());
    gallery.addVisual(new RisingSeaLevel());

}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}


function mouseDragged(){
  if (gallery.selectedVisual != null) {
    if (gallery.selectedVisual.mouseDragged != undefined){
        gallery.selectedVisual.mouseDragged();
        
    }
  }
}


function mouseMoved(){
  if (gallery.selectedVisual != null) {
    if (gallery.selectedVisual.mouseMoved != undefined){
        gallery.selectedVisual.mouseMoved();
        
    }
  }
}


function mouseWheel(event){
  if (gallery.selectedVisual != null) {
    if (gallery.selectedVisual.mouseWheel != undefined){
        gallery.selectedVisual.mouseWheel(event);
        
    }
  }
}

function mouseClicked(){
  if (gallery.selectedVisual != null) {
    if (gallery.selectedVisual.mouseClicked != undefined){
        gallery.selectedVisual.mouseClicked();
        
    }
  }
}

function mousePressed(){
  if (gallery.selectedVisual != null) {
    if (gallery.selectedVisual.mousePressed != undefined){
        gallery.selectedVisual.mousePressed();
        
    }
  }
}


function mouseReleased(){
  if (gallery.selectedVisual != null) {
    if (gallery.selectedVisual.mouseReleased != undefined){
        gallery.selectedVisual.mouseReleased();
        
    }
  }
}



function doubleClicked(){
  if (gallery.selectedVisual != null) {
    if (gallery.selectedVisual.doubleClicked != undefined){
        gallery.selectedVisual.doubleClicked();
        
    }
  }
}