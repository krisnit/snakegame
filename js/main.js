let timer,
  score = 0,
  highScore = 0,
  svgHeight = 800,
  svgWidth = 800,
  currentdirection = "right",
  foodTimer,
  fx,
  fy,
  snakeElements,
  sx,
  sy,
  splFoodTimer;

let svgArea = (h, w) =>
  d3
    .select("#snakegame__svg")
    .append("svg")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h);

// snake
// create initial snake elements
const generateSnakeElements = () => {
  let elements = Array.from({ length: 11 })
    .map((a, i) => ({
      x: i * 16,
      y: 0
    }))
    .reverse();
  return elements;
};

const snakeTemplate = elements =>
  d3
    .select("svg")
    .append("g")
    .attr("class", "snake")
    .selectAll("rect")
    .data(elements)
    .enter();
const createSnake = elements =>
  snakeTemplate(elements)
    .append("rect")
    .attr("width", 16)
    .attr("height", 16)
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("stroke", "#fff")
    .style("fill", "rgb(218, 165, 32)");

const moveSnake = (elements, a, b, fx, fy) => {
  let { x, y } = elements[0];
  let snakeHit = false;
  for (i = 4; i < elements.length; i++) {
    if (elements[0].x === elements[i].x && elements[0].y === elements[i].y)
      snakeHit = true;
  }
  if (snakeHit) {
    clearInterval(timer);
    clearTimeout(foodTimer);
    clearTimeout(splFoodTimer);
    gameOver();
    return;
  }

  let newElement = { x: x + a, y: y + b };
  elements.unshift(newElement);

  if (fx === newElement.x && fy === newElement.y) {
    clearFood();
    score += 1;
    if (score > highScore) changeScoreColor(score);
    updateScore(score);
    return elements;
  }

  if (
    sx - 14 < newElement.x + 8 &&
    newElement.x + 8 < sx + 14 &&
    sy - 14 < newElement.y + 8 &&
    newElement.y + 8 < sy + 14
  ) {
    clearSplFood();
    sx = -900;
    sy = -900;
    score += 9;
    if (score > highScore) changeScoreColor(score);
    updateScore(score);
    let newElement = { x: x + a, y: y + b };
    elements.unshift(newElement);
    return elements;
  }
  elements.pop();
  return elements;
};

// Snake Food

//create snake food
const createFood = (x, y, h, w, color) =>
  d3
    .select("svg")
    .append("g")
    .attr("class", "normalfood")
    .append("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("height", h)
    .attr("width", w)
    .attr("fill", color);

//create snake food
const createSplFood = (x, y, h, w, color) =>
  d3
    .select("svg")
    .append("g")
    .attr("class", "splfood")
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 14)
    .attr("fill", color);
//create food coordinates
const foodCords = (x, y, a, b) => {
  return {
    fx: Math.round((Math.random() * (x - (x % a))) / a) * a,
    fy: Math.round((Math.random() * (y - (y % b))) / b) * b
  };
};

//schedule food corordinates creation
const autoFoodGeneration = () => {
  foodTimer = setTimeout(() => {
    clearFood();
    let res = foodCords(svgWidth, svgHeight, 16, 16);
    fx = res.fx;
    fy = res.fy;
    createFood(fx, fy, 16, 16, "red");
    autoFoodGeneration();
  }, (() => (Math.floor(Math.random() * 5) + 5) * 1000)());
};

//schedule special food coordinates creation
const autoSplFoodGeneration = () => {
  splFoodTimer = setTimeout(() => {
    clearSplFood();
    let res = foodCords(svgWidth, svgHeight, 28, 28);
    sx = res.fx;
    sy = res.fy;
    if (sx < 14) sx = sx + 14;
    if (sy < 14) sy = sy + 14;
    if (sx > svgWidth - 14) sx = sx - 14;
    if (sy > svgHeight - 14) sy = sy - 14;
    let color = `rgb(${randomColor()},${randomColor()},${randomColor()})`;
    createSplFood(sx, sy, 28, 28, color);
    autoSplFoodGeneration();
  }, (() => (Math.floor(Math.random() * 3) + 2) * 1000)());
};
//any random number between 0 and 150
const randomColor = () => {
  return Math.floor(Math.random() * 150);
};

//automatically move snake on key press
const autoMoveSnake = (prevDir, currDir, a, b, fx, fy) => {
  if (currentdirection === prevDir) return;
  currentdirection = currDir;
  clearInterval(timer);

  timer = setInterval(() => {
    //when the snake head goes out of svg decrease the svg width and height by 113 px
    let { x, y } = snakeElements[0];
    if (x < 0 || x > svgWidth || y < 0 || y > svgHeight) {
      clearInterval(timer);
      svgWidth -= 113;
      svgHeight -= 113;
      if (svgHeight < 113 || svgWidth < 113) gameOver();
      snakeElements = modifySnake(snakeElements, svgWidth, svgHeight);
      currentdirection = modifyCurrentDirection(snakeElements);
      resizeSvg(svgWidth, svgHeight);
      newSnake(svgWidth, svgHeight, snakeElements);
      return;
    }
    if (snakeElements.length < 1) return;
    snakeElements = moveSnake(snakeElements, a, b, fx, fy);
    newSnake(svgWidth, svgHeight, snakeElements);
  }, 100);
};

//   -------------------------------------------------

document.addEventListener("keydown", e => {
  if (snakeElements.length < 1) return;
  switch (e.keyCode) {
    //   left arrow
    case 37:
      autoMoveSnake("right", "left", -16, 0, fx, fy);
      return;
    //   up arrow
    case 38:
      autoMoveSnake("down", "up", 0, -16, fx, fy);
      return;
    //   right arrow
    case 39:
      autoMoveSnake("left", "right", 16, 0, fx, fy);
      return;
    //   down arrow
    case 40:
      autoMoveSnake("up", "down", 0, 16, fx, fy);
      return;
  }
});

const modifySnake = (elements, w, h, currentdirection) => {
  let results = [...elements];
  if (elements[0].x < 0) {
    const ax = 0 - results[0].x;
    results = results.map(a => ({ x: a.x + ax - ((a.x + ax) % 16), y: a.y }));
  }
  if (elements[0].y < 0) {
    let ay = 0 - elements[0].y;
    results = results.map(a => ({ x: a.x, y: a.y + ay - ((a.y + ay) % 16) }));
  }
  if (elements[0].x > w) {
    let ax = elements[0].x - w + 16;
    results = results.map(a => ({ x: a.x - ax - ((a.x - ax) % 16), y: a.y }));
  }
  if (elements[0].y > h) {
    let ay = elements[0].y - h + 16;
    results = results.map(a => ({ x: a.x, y: a.y - ay - ((a.y - ay) % 16) }));
  }

  results.reverse();
  return results;
};

//clear the snake
const clearSnake = () => {
  d3.selectAll(".snake").remove();
};
const clearFood = () => {
  d3.select(".normalfood").remove();
};

const clearSplFood = () => {
  d3.select(".splfood").remove();
};
const resizeSvg = (w, h) => {
  d3.select("svg").remove();
  svgArea(w, h);
};
//function to create snake in new coordinates
const newSnake = (w, h, elements, fx, fy) => {
  clearSnake();
  // console.log(elements);
  createSnake(elements, fx, fy);
};
//generate interval at which the food has to appear

const updateScore = score => {
  document.getElementById("snakegame__score").innerHTML = `Score : ${score}`;
};

const changeScoreColor = () => {
  document.getElementById("snakegame__score").classList.add("highscore");
};

const gameOver = () => {
  highScore = score;
  snakeElements = [];
  document.getElementById("snakegame__score").classList.remove("highscore");
  d3.select("#snakegame__svg")
    .selectAll("*")
    .remove();

  d3.select("#snakegame__svg")
    .append("h1")
    .text("Game Over");
  let resetButton = d3
    .select("#snakegame__svg")
    .append("button")
    .text("Play Again")
    .style("background", "coral")
    .style("padding", "1rem")
    .attr("id", "resetbutton")
    .attr("padding", "0");
  resetButton.on("click", startGame);
};

const startGame = () => {
  svgWidth = 800;
  svgHeight = 800;
  ishigh = false;
  score = 0;
  d3.select("#snakegame__svg")
    .selectAll("*")
    .remove();
  svgArea(svgWidth, svgWidth);
  snakeElements = generateSnakeElements();
  autoFoodGeneration();
  autoSplFoodGeneration();
  createSnake(snakeElements);
  updateScore(score);
};
startGame();

const modifyCurrentDirection = elements => {
  if (elements[0].x - elements[1].x > 0 && elements[0].y === elements[1].y)
    return "right";
  if (elements[0].x - elements[1].x < 0 && elements[0].y === elements[1].y)
    return "left";
  if (elements[0].x - elements[1].x === 0 && elements[0].y > elements[1].y)
    return "down";
  if (elements[0].x - elements[1].x === 0 && elements[0].y < elements[1].y)
    return "up";
};
