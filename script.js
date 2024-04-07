window.onload = function () {
  const delay = 150;
  const canvasWidth = 900;
  const canvasHeight = 600;
  const blockSize = 30;
  let ctx;
  let kaa;
  let redapple;
  const widthInBlocks = canvasWidth / blockSize;
  const heightInBlocks = canvasHeight / blockSize;

  init();

  // Able to initialize the 1st position of the snake and the red apple on the board
  function init() {
    let canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.border = "1px solid";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    kaa = new Snake(
      [
        [6, 4],
        [5, 4],
        [4, 4],
      ],
      "right"
    );
    redapple = new Apple([10, 10]);
    refreshCanvas();
  }

  //Able to refresh the state of the snake by clearing the previous content of the canvas then draws the snake in its new position and advances it
  function refreshCanvas() {
    kaa.advance();
    if (kaa.checkCollision()) {
      // GAME OVER
    } else {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      kaa.draw();
      redapple.draw();
      setTimeout(refreshCanvas, delay);
    }
  }

  // Able to draw the snake on the screen
  function drawBlock(ctx, position) {
    let x = position[0] * blockSize;
    let y = position[1] * blockSize;
    ctx.fillRect(x, y, blockSize, blockSize);
  }

  function Snake(body, direction) {
    this.body = body;
    this.direction = direction;
    this.draw = function () {
      ctx.save();
      ctx.fillStyle = "#33cc33";
      for (let i = 0; i < this.body.length; i++) {
        drawBlock(ctx, this.body[i]);
      }
      ctx.restore();
    };

    // Able to advance and change direction for the snake with arrows on keyboard
    this.advance = function () {
      let nextPosition = this.body[0].slice();
      switch (this.direction) {
        case "left":
          nextPosition[0]--;
          break;
        case "right":
          nextPosition[0]++;
          break;
        case "down":
          nextPosition[1]++;
          break;
        case "up":
          nextPosition[1]--;
          break;
        default:
          throw "Invalid direction";
      }
      this.body.unshift(nextPosition);
      this.body.pop();
    };

    // Allow directions to create new directions
    this.setDirection = function (newDirection) {
      let allowedDirections;
      switch (this.direction) {
        case "left":
        case "right":
          allowedDirections = ["up", "down"];
          break;
        case "down":
        case "up":
          allowedDirections = ["left", "right"];
          break;
        default:
          throw "Invalid direction";
      }
      if (allowedDirections.indexOf(newDirection) > -1) {
        this.direction = newDirection;
      }
    };

    //Check if there are some collisions with the snake
    this.checkCollision = function () {
      let wallCollision = false;
      let snakeBite = false;
      const snakeHead = this.body[0];
      const snakeX = snakeHead[0];
      const snakeY = snakeHead[1];
      const minX = 0;
      const minY = 0;
      const maxX = widthInBlocks - 1;
      const maxY = heightInBlocks - 1;
      if (snakeX < minX || snakeX > maxX || snakeY < minY || snakeY > maxY) {
        wallCollision = true;
      }
      for (let i = 1; i < this.body.length; i++) {
        if (snakeX === this.body[i][0] && snakeY === this.body[i][1]) {
          snakeBite = true;
        }
      }

      return wallCollision || snakeBite;
    };
  }

  // Allow to make an apple appear
  function Apple(position) {
    this.position = position;
    this.draw = function () {
      ctx.save();
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      const radius = blockSize / 2;
      let x = position[0] * blockSize + radius;
      let y = position[1] * blockSize + radius;
      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    };
  }

  // Allow to use the keyboard arrows according to their code
  document.onkeydown = function handleKeyDown(e) {
    let key = e.keyCode;
    let newDirection;
    switch (key) {
      case 37:
        newDirection = "left";
        break;
      case 38:
        newDirection = "up";
        break;
      case 39:
        newDirection = "right";
        break;
      case 40:
        newDirection = "down";
        break;
      default:
        return;
    }
    kaa.setDirection(newDirection);
  };
};
