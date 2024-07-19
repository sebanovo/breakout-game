const canvas = document.getElementById('breakout')
const ctx = canvas.getContext('2d')
const sprites = document.getElementById('sprites')
const score = document.getElementById('score')
const highScore = document.getElementById('high-score')

canvas.width = 500
canvas.height = 375

const audioBrickCollision = new Audio('./audio/brickCollision.wav')
audioBrickCollision.playbackRate = 2.5
const audioBoundaryCollision = new Audio('./audio/boundaryCollision.wav')

// level
const FPS = 60
const interval = 1000 / FPS

highScore.textContent = window.localStorage.getItem('highScore') || score.textContent
// time out
let setIntervalId

// ball
let ballX = canvas.width / 2
let ballY = canvas.height - 30
const ballRadius = 5
const ballStartAngle = 0
const ballEndAngle = 2 * Math.PI
const ballVelocity = 5
const max = ballVelocity
const min = -ballVelocity
let balldx = Math.random() * (max - min + 1) + min // da igual
let balldy = ballVelocity // positivo

// paddle
const paddleWidth = 83
const paddleHeight = 17
let paddleX = canvas.width / 2 - paddleWidth / 2
let paddleY = canvas.height - 20
let paddleVelocity = 10

// bricks
const bricks = []
const bricksX = 68
const bricksY = 20
const bricksRowCount = 10
const bricksColCount = 4
const bricksPadding = 9
const brickWidth = 30
const brickHeight = 20

for (let f = 0; f < bricksRowCount; f++) {
  bricks[f] = []
  for (let c = 0; c < bricksColCount; c++) {
    bricks[f][c] = { x: 0, y: 0, status: true }
  }
}

// keydown
let rightPressed = false
let leftPressed = false

// game over
let gameOver = false
// win
let win = false

document.addEventListener('keydown', keyDownHandler, false)
document.addEventListener('keyup', keyUpHandler, false)
document.addEventListener('mousemove', mouseMoveHandler, false)
document.addEventListener('keydown', enterHandler)

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

function enterHandler(e) {
  if (e.key === 'Enter' && (gameOver || win)) {
    document.location.reload()
  }
}

function moveBall() {
  ballX += balldx
  ballY += -balldy
}

function drawBall() {
  ctx.fillStyle = 'white'
  ctx.lineWidth = 5
  ctx.strokeStyle = 'black'
  ctx.beginPath()
  ctx.arc(ballX, ballY, ballRadius, ballStartAngle, ballEndAngle)
  ctx.fill()
  ctx.stroke()
  ctx.closePath()
}

function drawPaddle() {
  ctx.fillStyle = 'blue'
  ctx.drawImage(
    sprites,
    326,
    506,
    paddleWidth,
    paddleHeight,
    paddleX,
    paddleY,
    paddleWidth,
    paddleHeight
  )
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

function checkBoundaryCollision() {
  if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
    balldx = -balldx
    audioBoundaryCollision.play()
  } else if (ballY - ballRadius < 0) {
    balldy = -balldy
    audioBoundaryCollision.play()
  }
}

function checkCollision() {
  if (ballY + ballRadius > canvas.height) {
    balldy = 0
    balldx = 0
    gameOver = true
  } else if (
    ballY + ballRadius > paddleY &&
    ballX > paddleX &&
    ballX < paddleX + paddleWidth
  ) {
    balldy = -balldy
    ballY = paddleY - ballRadius
  }
}

function checkBrickCollision() {
  for (let f = 0; f < bricksRowCount; f++) {
    for (let c = 0; c < bricksColCount; c++) {
      let ref = bricks[f][c]
      const { x, y, status } = ref
      if (!status) continue

      let brickTop = y
      let brickBottom = y + brickHeight
      let brickLeft = x
      let brickRight = x + brickWidth

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

        audioBrickCollision.play()
        score.textContent++
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
  if (gameOver) {
    clearInterval(setIntervalId)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'black'
    ctx.font = '50px Arial'
    ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2)
    ctx.font = '30px Arial'
    ctx.fillText('Press Enter', canvas.width / 2 - 100, canvas.height / 2 + 30)
    const currenScore = +score.textContent
    const oldScore = +window.localStorage.getItem('highScore') || currenScore
    if (oldScore <= currenScore) {
      window.localStorage.setItem('highScore', score.textContent)
    }
  }
}

function checkWin() {
  // check if every brick is broken
  win = bricks.every(row => row.every(brick => !brick.status))
  if (win) {
    confetti()
    clearInterval(setIntervalId)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'black'
    ctx.font = '50px Arial'
    ctx.fillText('You Win', canvas.width / 2 - 120, canvas.height / 2)
    ctx.font = '30px Arial'
    ctx.fillText('Press Enter', canvas.width / 2 - 100, canvas.height / 2 + 30)
    window.localStorage.setItem('highScore', score.textContent)
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  checkGameOver()
  checkWin()
  checkBrickCollision()
  checkBoundaryCollision()
  checkCollision()
  drawBricks()
  drawBall()
  drawPaddle()
  moveBall()
  movePaddle()
}

function play() {
  setIntervalId = setInterval(draw, interval)
}

play()
