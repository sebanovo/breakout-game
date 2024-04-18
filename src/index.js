const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const sprites = document.getElementById('sprites')
const score = document.getElementById('score')

// canvas
canvas.width = 600
canvas.height = 400

// ball
let ballX = canvas.width / 2
let ballY = canvas.height - 30
const ballRadius = 5
const ballStartAngle = 0
const ballEndAngle = 2 * Math.PI
const ballVelocity = 6
let balldx = ballVelocity
let balldy = ballVelocity

// paddle
const paddleWidth = 100
const paddleHeight = 15
let paddleX = canvas.width / 2 - paddleWidth / 2
let paddleY = canvas.height - 20
let paddleVelocity = 10

// bricks
const bricks = []
const bricksX = 110
const bricksY = 20
const bricksRowCount = 10
const bricksColCount = 4
const bricksPadding = 9
const brickWidth = 30
const brickHeight = 20

// keydown
let rightPressed = false
let leftPressed = false

// game over
let gameOver = false
// win
let win = false

for (let f = 0; f < bricksRowCount; f++) {
  bricks[f] = []
  for (let c = 0; c < bricksColCount; c++) {
    bricks[f][c] = { x: 0, y: 0, status: true }
  }
}

function keyDownHandler(e) {
  if (e.keyCode === 39) {
    rightPressed = true
  } else if (e.keyCode === 37) {
    leftPressed = true
  }
}
function keyUpHandler(e) {
  if (e.keyCode === 39) {
    rightPressed = false
  } else if (e.keyCode === 37) {
    leftPressed = false
  }
}

function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2
  }
}

document.addEventListener('keydown', keyDownHandler, false)
document.addEventListener('keyup', keyUpHandler, false)
document.addEventListener('mousemove', mouseMoveHandler, false)

function drawBall() {
  ctx.fillStyle = 'white'
  ctx.lineWidth = 5
  ctx.strokeStyle = 'black'
  ctx.beginPath()
  ctx.arc(ballX, ballY, ballRadius, ballStartAngle, ballEndAngle)
  ctx.fill()
  ctx.stroke()
  ctx.closePath()

  ballX += balldx
  ballY += -balldy
}

function drawPaddle() {
  ctx.fillStyle = 'blue'
  ctx.drawImage(sprites, 326, 506, 83, 17, paddleX, paddleY, 83, 17)
}

function drawBricks() {
  for (let f = 0; f < bricksRowCount; f++) {
    for (let c = 0; c < bricksColCount; c++) {
      if (!bricks[f][c].status) continue
      let brickX = f * (brickWidth + bricksPadding) + bricksX
      let brickY = c * (brickHeight + bricksPadding) + bricksY
      bricks[f][c].x = brickX
      bricks[f][c].y = brickY

      ctx.strokeStyle = 'black'
      ctx.lineWidth = 5
      ctx.fillStyle = '#c0c0c0'
      ctx.beginPath()
      ctx.strokeRect(brickX, brickY, brickWidth, brickHeight)
      ctx.fillRect(brickX, brickY, brickWidth, brickHeight)
      ctx.closePath()
    }
  }
}

function checkCollision() {
  if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
    balldx = -balldx
  } else if (ballY - ballRadius < 0) {
    balldy = -balldy
  } else if (ballY + ballRadius > canvas.height) {
    ballX = canvas.width / 2
    ballY = canvas.height - 30
    balldx = 2
    balldy = 2
    gameOver = true
    document.location.reload()
  } else if (
    ballY + ballRadius > paddleY &&
    ballX > paddleX &&
    ballX < paddleX + paddleWidth
  ) {
    balldy = -balldy
    ballY = paddleY - ballRadius
  } else {
    checkCollisionBricks()
  }
}

function checkCollisionBricks() {
  for (let f = 0; f < bricksRowCount; f++) {
    for (let c = 0; c < bricksColCount; c++) {
      let ref = bricks[f][c]
      const { x, y } = ref
      if (!ref.status) continue

      let brickTop = ref.y
      let brickBottom = ref.y + brickHeight
      let brickLeft = ref.x
      let brickRight = ref.x + brickWidth

      let ballTop = ballY - ballRadius
      let ballBottom = ballY + ballRadius
      let ballLeft = ballX - ballRadius
      let ballRight = ballX + ballRadius

      if (
        ballBottom > brickTop &&
        ballTop < brickBottom &&
        ballRight > brickLeft &&
        ballLeft < brickRight
      ) {
        let overlapX = Math.min(ballRight - brickLeft, brickRight - ballLeft)
        let overlapY = Math.min(ballBottom - brickTop, brickBottom - ballTop)

        if (overlapX < overlapY) {
          balldx = -balldx
        } else {
          balldy = -balldy
        }

        +score.textContent++
        ref.status = false
      }
    }
  }
}

function movePaddle() {
  if (rightPressed && paddleX + paddleWidth < canvas.width) {
    paddleX += paddleVelocity
  } else if (leftPressed && paddleX > 0) {
    paddleX -= paddleVelocity
  }
}

function checkGameOver() {
  if (!gameOver) return
  alert('Game Over')
  if(win){
    alert('You Win')
    document.location.reload()
  }
}

function checkWinner() {
  for (let f = 0; f < bricksRowCount; f++) {
    for(let c = 0; c < bricksColCount; c++) {
      if(bricks[f][c].status){
        return
      }
    }
  }
  win = true
  gameOver = true
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBricks()
  checkCollision()
  drawBall()
  drawPaddle()
  movePaddle()
  checkGameOver()
  checkWinner()
  requestAnimationFrame(draw)
}

draw()
