let svg = d3
  .select("#snakegame__svg")
  .append("svg")
  .attr("width", 800)
  .attr("height", 800);

// create initial snake elements
let snakeElements = Array.from({ length: 3 }).map((a, i) => ({
  x: i * 16,
  y: 0
}));

let snake = elements =>
  svg
    .selectAll("rect")
    .data(elements)
    .enter();

let createSnake = snake(snakeElements)
  .append("rect")
  .attr("width", 16)
  .attr("height", 16)
  .attr("x", d => d.x)
  .attr("y", d => d.y)
  .style("fill", "green")
  .style("padding", "2px");

console.log(snakeElements);
