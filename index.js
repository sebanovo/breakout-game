const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

// canvas
canvas.width = 600
canvas.height = 400

// ball
const π = Math.PI
let ballX = canvas.width / 2
let ballY = canvas.height - 30
const ballRadius = 5
const ballStartAngle = 0
const ballEndAngle = 2 * π
let balldx = 2
let balldy = 2

// pallete
let palleteX = canvas.width / 2
let palleteY = canvas.height - 20
let palleteVelocity = 20
const palleteWidth = 100
const palleteHeight = 5

// bricks -> ladrillos
const bricks = []
const RowCountBricks = 10
const ColCountBricks = 4
const padding = 15
const widthBrick = 30
const heightBrick = 20
const bricksX =  80
const bricksY = 20

for (let f = 0; f < RowCountBricks; f++) {
  bricks[f] = []
  for (let c = 0; c < ColCountBricks; c++) {
    bricks[f][c] = { x: 0, y: 0, status: true }
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') {
    palleteX += -palleteVelocity
  } else if (e.key === 'ArrowRight') {
    palleteX += palleteVelocity
  }
})

function drawBall() {
  ctx.beginPath()
  ctx.arc(ballX, ballY, ballRadius, ballStartAngle, ballEndAngle)
  ctx.fillStyle = 'red'
  ctx.fill()
  ctx.closePath()

  ballX += balldx
  ballY += -balldy
}

function drawPallete() {
  ctx.fillStyle = 'blue'
  ctx.fillRect(palleteX - palleteWidth / 2, palleteY, palleteWidth, palleteHeight)
  ctx.closePath()
}

function drawBricks() {
  for (let f = 0; f < RowCountBricks; f++) {
    for (let c = 0; c < ColCountBricks; c++) {
      if (!bricks[f][c].status) continue
      let brickX = f * (widthBrick + padding) + bricksX
      let brickY = c * (heightBrick + padding) + bricksY 
      bricks[f][c].x = brickX
      bricks[f][c].y = brickY

      ctx.fillStyle = 'green'
      ctx.beginPath()
      ctx.fillRect(brickX, brickY, widthBrick, heightBrick)
      ctx.closePath()
    }
  }
}

function checkCollision() {
  if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
    balldx = -balldx
  } else if (ballY + ballRadius > canvas.height) {
    ballX = canvas.width / 2
    ballY = canvas.height - 30
    balldx = 2
    balldy = 2 
    document.location.reload()
  } else if (ballY - ballRadius < 0) {
    balldy = -balldy
  } else if (
    ballY + ballRadius > palleteY &&
    ballY + ballRadius < palleteY + palleteHeight &&
    ballX + ballRadius > palleteX &&
    ballX + ballRadius < palleteX + palleteWidth
  ) {
    balldy = -balldy
  }
  checkCollisionBricks()
}

function checkCollisionBricks() {
  for (let f = 0; f < RowCountBricks; f++) {
    for (let c = 0; c < ColCountBricks; c++) {
      let ref = bricks[f][c]
      const { x, y } = ref
      if (!ref.status) continue

      let brickTop = ref.y;
      let brickBottom = ref.y + heightBrick;
      let brickLeft = ref.x;
      let brickRight = ref.x + widthBrick;

      let ballTop = ballY - ballRadius;
      let ballBottom = ballY + ballRadius;
      let ballLeft = ballX - ballRadius;
      let ballRight = ballX + ballRadius;

      if (
        ballBottom > brickTop && 
        ballTop < brickBottom && 
        ballRight > brickLeft && 
        ballLeft < brickRight
      ) {
        let overlapX = Math.min(ballRight - brickLeft, brickRight - ballLeft);
        let overlapY = Math.min(ballBottom - brickTop, brickBottom - ballTop);

        if (overlapX < overlapY) {
          balldx = -balldx;
        } else {
          balldy = -balldy;
        }

        ref.status = false;
      }
        
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBricks()
  drawBall()
  drawPallete()
  checkCollision()
  requestAnimationFrame(draw) 
}

draw()