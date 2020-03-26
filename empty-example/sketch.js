var g;
var c;

function setup() {
  createCanvas(710, 400)
  g = createGraphics(710, 400, WEBGL);

}

function draw() {
  g.background(100);
  g.noFill();
  g.stroke(0);
  g.sphere(300);
  g.rotateX(0.01)

  background(0)
  image(g, 0, 0)
}