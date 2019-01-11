const links = document.querySelectorAll('a');

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const [w, h] = [canvas.clientWidth, canvas.clientHeight];
// let dpx = devicePixelRatio;
let dpx = 2;
canvas.width = w * dpx;
canvas.height = h * dpx;
ctx.scale(dpx, dpx);

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
      toPolygonArray[i].onComplete = resolve;
      TweenLite.to(obj, 1, toPolygonArray[i]);
    })
  }))
    .then(() => isAnimating = false);
};

function render(polygonArray) {
  ctx.clearRect(0, 0, w, h);
  polygonArray.forEach((item, idx) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(item.one, item.two);
    ctx.lineTo(item.three, item.four);
    ctx.lineTo(item.five, item.six);
    ctx.closePath();
    ctx.fillStyle = item.fill;
    ctx.fill();
    ctx.restore();
  });
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