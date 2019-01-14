var running = 0;

// PIXI INIT STAGE
var renderer = new PIXI.Application(800, 600, {
    backgroundColor: 0x000000
});
document.getElementById("pixi").appendChild(renderer.view);
var container = new PIXI.Container();
renderer.stage.addChild(container);

// render image
var img1 = PIXI.Sprite.fromImage('img/1.jpg');
img1.width = 650;
img1.height = 500;
img1.position.x = 75;
img1.position.y = 50;
container.addChild(img1);

// render second image
var img2 = PIXI.Sprite.fromImage('img/2.jpg');
img2.width = 650;
img2.height = 500;
img2.position.x = 75;
img2.position.y = 50;
img2.alpha = 0;
container.addChild(img2);

// add Filters
var disSprite = PIXI.Sprite.fromImage('img/map4.png');
disSprite.width = 800;
disSprite.height = 600;
var displacementFilter = new PIXI.filters.DisplacementFilter(disSprite);
displacementFilter.scale.set(0.1);
container.addChild(disSprite);

container.filters = [displacementFilter];

function draw() {
    renderer.render(renderer.stage);
    window.requestAnimationFrame(draw);
}
draw();

document.body.addEventListener('click', function() {
  if (running) return;

  running = 1;
  var tl = new TimelineMax();

  tl
    .to(displacementFilter.scale, 1, { y: 600, x: 0.1 })
    .to(displacementFilter.scale, 1, { y: 0.1, x: 0.1 })
    .call(function() {
      running = 0;
      img2 = [img1, img1 = img2][0];
    });

  tl
    .to(img2, 1, { alpha: 1 }, 1)
    .to(img1, 0.9, { alpha: 0 }, 1.1)

  // tl.fromTo(img2.scale, 1, {
  //   y: img2.scale.y * 2
  // }, {
  //   y: img2.scale.y
  // }, 1)
});