window.onload = function () {
  const delay = 110;
  const canvasWidth = 900;
  const canvasHeight = 600;
  const blockSize = 30;
  let ctx;
  let kaa;
  let mowgli;
  const widthInBlocks = canvasWidth / blockSize;
  const heightInBlocks = canvasHeight / blockSize;
  let score;

  // Toggle button for the background song
  const bgMusic = document.getElementById("bg-music");
  const toggleButton = document.getElementById("toggle-music");

  toggleButton.addEventListener("click", function () {
    if (bgMusic.paused) {
      bgMusic.play();
      toggleButton.textContent = "🔇";
    } else {
      bgMusic.pause();
      toggleButton.textContent = "🔊";
    }
  });

  init();

  // Able to initialize the 1st position of Kaa, the snake and Mowgli, the human
  function init() {
    let canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.border = "1px solid";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    kaa = new Kaa([[6, 4]], "right");
    mowgli = new Mowgli([10, 10]);
    score = 0;
    refreshCanvas();
  }

  //Able to refresh the state of Kaa by clearing the previous content of the canvas then draw the snake in its new position and advance it
  function refreshCanvas() {
    kaa.advance();
    if (kaa.checkCollision()) {
      gameOver();
    } else {
      if (kaa.isEatingMowgli(mowgli)) {
        score++;
        kaa.ateMowgli = true;
        do {
          mowgli.setNewPosition();
        } while (mowgli.isOnKaa(kaa));
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      kaa.draw();
      mowgli.draw();
      displayScore();
      setTimeout(refreshCanvas, delay);
    }
  }

  // Set when the game is over
  function gameOver() {
    ctx.save();
    ctx.fillText("Game Over", 5, 15);
    ctx.fillText("Push space to retry", 5, 30);
    ctx.restore();
  }

  // Allow to restart the game
  function restartGame() {
    kaa = new Kaa([[6, 4]], "right");
    mowgli = new Mowgli([10, 10]);
    score = 0;
    refreshCanvas();
  }

  // Display the score on the board
  function displayScore() {
    ctx.save();
    ctx.fillText(score.toString(), 5, canvasHeight - 5);
    ctx.restore();
  }

  // Able to draw Kaa on the screen
  function drawBlock(ctx, position) {
    let x = position[0] * blockSize;
    let y = position[1] * blockSize;
    ctx.fillRect(x, y, blockSize, blockSize);
  }

  function Kaa(body, direction) {
    this.body = body;
    this.direction = direction;
    this.ateMowgli = false;
    this.draw = function () {
      ctx.save();
      ctx.fillStyle = "#33cc33";
      for (let i = 0; i < this.body.length; i++) {
        drawBlock(ctx, this.body[i]);
      }
      ctx.restore();
    };

    // Able to advance and change Kaa's direction with arrows on keyboard
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
      if (!this.ateMowgli) this.body.pop();
      else this.ateMowgli = false;
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

    //Check if there are some collisions with Kaa
    this.checkCollision = function () {
      let wallCollision = false;
      let kaaBite = false;
      const kaaHead = this.body[0];
      const kaaX = kaaHead[0];
      const kaaY = kaaHead[1];
      const minX = 0;
      const minY = 0;
      const maxX = widthInBlocks - 1;
      const maxY = heightInBlocks - 1;
      if (kaaX < minX || kaaX > maxX || kaaY < minY || kaaY > maxY) {
        wallCollision = true;
      }
      for (let i = 1; i < this.body.length; i++) {
        if (kaaX === this.body[i][0] && kaaY === this.body[i][1]) {
          kaaBite = true;
        }
      }

      return wallCollision || kaaBite;
    };

    // Check if Kaa is eating Mowgli
    this.isEatingMowgli = function (mowgliToEat) {
      let kaaHead = this.body[0];
      return (
        kaaHead[0] === mowgliToEat.position[0] &&
        kaaHead[1] === mowgliToEat.position[1]
      );
    };
  }

  // Allow to make Mowgli appear
  function Mowgli(position) {
    this.position = position;
    this.draw = function () {
      ctx.save();
      ctx.fillStyle = "#573739";
      ctx.beginPath();
      const radius = blockSize / 2;
      let x = this.position[0] * blockSize + radius;
      let y = this.position[1] * blockSize + radius;
      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    };

    //Able to set random position for Mowgli
    this.setNewPosition = function () {
      let newX = Math.round(Math.random() * (widthInBlocks - 1));
      let newY = Math.round(Math.random() * (heightInBlocks - 1));
      this.position = [newX, newY];
    };

    // To prevent Mowgli from being on Kaa
    this.isOnKaa = function (kaaToCheck) {
      let isOnKaa = false;
      for (let i = 0; i < kaaToCheck.body.length; i++) {
        if (
          this.position[0] === kaaToCheck.body[i][0] &&
          this.position[1] === kaaToCheck.body[i][1]
        ) {
          isOnKaa = true;
        }
      }
      return isOnKaa;
    };

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
        case 32:
          restartGame();
          return;
        default:
          return;
      }
      kaa.setDirection(newDirection);
    };
  }
};
