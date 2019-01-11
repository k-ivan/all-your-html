const links = document.querySelectorAll('a');
let polygons =  [].slice.call(document.querySelector(".svg-holder").querySelectorAll("polygon"));

let currentId = 'yeojin';

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

  fromPolygonArray.forEach((obj, i) => {
    toPolygonArray[i].onUpdate = () => {
      polygons[i].setAttribute("points", `${obj.one},${obj.two} ${obj.three},${obj.four} ${obj.five},${obj.six}`);
      polygons[i].setAttribute("fill", obj.fill);
    };
    TweenLite.to(obj, 1, toPolygonArray[i]);
  });
};

// add points attribute values to arrays
const updatePolygonArrays = (idToAnimateTo) => {
  animatePolygons(currentId, idToAnimateTo);
  currentId = idToAnimateTo;
}

// click on link listener
[].forEach.call(links, function(el, i, els) {
  el.addEventListener("click", function(event) {
    const idToAnimateTo = this.hash.substring(1);

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