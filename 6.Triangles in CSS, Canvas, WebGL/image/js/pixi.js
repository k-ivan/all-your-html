const links = document.querySelectorAll('a');

const canvas = document.querySelector('canvas');
const [w, h] = [canvas.clientWidth, canvas.clientHeight];
const dpx = devicePixelRatio || 1;

function rgb2hex(rgb){
  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (rgb && rgb.length === 4) ? "#" +
    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

function parseColor(strColor) {
  strColor = rgb2hex(strColor);
  return parseInt(strColor.substring(1), 16)
}

let app = new PIXI.Application({
    view: canvas,
    width: w,
    height: h,
    autoResize: true,
    resolution: dpx,
    forceCanvas: false,
    preserveDrawingBuffer: true,
    antialias: false,
    transparent: true
});

// let stage = new PIXI.Container();
let graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

let currentId = 'yeojin';
let isAnimating = false;

const getCoordinates = (polygon) => {
  return polygon.getAttribute("points").match(/(-?[0-9][0-9\.]*),(-?[0-9][0-9\.]*)\ (-?[0-9][0-9\.]*),(-?[0-9][0-9\.]*)\ (-?[0-9][0-9\.]*),(-?[0-9][0-9\.]*)/);
};

const createPolygonPointsObject = (polygons) => {
  const polygonsArray = [];

  polygons.forEach((polygon, i) => {
    const coordinates = getCoordinates(polygon);

    polygonsArray.push({
      fill: polygon.getAttribute("fill"),
      one: coordinates[1],
      two: coordinates[2],
      three: coordinates[3],
      four: coordinates[4],
      five: coordinates[5],
      six: coordinates[6]
    });
  });

  return polygonsArray;
}

let data = [...document.querySelectorAll('svg.hidden')].reduce((acc, cur, idx, arr) => {
  let svgPolygons = cur.querySelectorAll('polygon')
  acc[cur.id] = createPolygonPointsObject(svgPolygons);
  return acc;
}, {});

console.log(data);

const animatePolygons = (fromId, toId) => {
  let fromPolygonArray = data[fromId].map(o => Object.assign({}, o));
  let toPolygonArray = data[toId].map(o => Object.assign({}, o));

  isAnimating = true;

  function update() {
    if (!isAnimating) return;
    render(fromPolygonArray);
    requestAnimationFrame(update);
  }

  update();

  Promise.all(fromPolygonArray.map((obj, i) => {
    return new Promise((resolve) => {
      toPolygonArray[i].onComplete = function() {
        resolve();
        render(fromPolygonArray);
      };
      TweenLite.to(obj, 1, toPolygonArray[i]);
    })
  })).then(() => isAnimating = false);
};

function render(polygonArray) {
  graphics.clear();
  polygonArray.forEach((item, idx) => {
    graphics.beginFill(parseColor(item.fill));
    graphics.moveTo(item.one, item.two);
    graphics.lineTo(item.three, item.four);
    graphics.lineTo(item.five, item.six);
    graphics.endFill();
  });
  // stage.addChild(graphics);
  // app.renderer.render(stage);
  app.render();
}

// add points attribute values to arrays
const updatePolygonArrays = (idToAnimateTo) => {
  animatePolygons(currentId, idToAnimateTo);
  currentId = idToAnimateTo;
}

// click on link listener
[].forEach.call(links, function(el, i, els) {
  el.addEventListener("click", function(event) {
    if (isAnimating) return;

    const idToAnimateTo = this.getAttribute("href").substring(1);

    [].forEach.call(els, function(el) {
      if (el !== this) {
        el.classList.remove("active");
      } else {
        this.classList.add("active");
      }
    }, this);

    event.preventDefault();
    this.classList.add("active");
    updatePolygonArrays(idToAnimateTo);
  });
});

animatePolygons('yeojin', 'yeojin');