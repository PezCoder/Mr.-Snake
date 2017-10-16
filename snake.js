//iife to make variables safe
;(function(){
"use strict";
  var canvas = document.getElementById('canvas'),
    width = canvas.width = window.innerWidth,
    height = canvas.height = window.innerHeight * 0.9,
    ctx = canvas.getContext('2d'),
    snakeWidth=25,
    snakeHeight=25,
    snakeHeadColor="#3f51b5",
    snakeBodyColor = snakeHeadColor,
    snakeBoundary = "#8c9eff",
    //location of snakke
    x=100,
    y=100,
    //speed of snake
    dx=snakeWidth,
    dy=snakeWidth,
    length=1,
    //button pressed state
    leftPressed=false,
    rightPressed=false,
    downPressed=false,
    upPressed=false,
    previousReleased = false,
    foodWidth = 25,
    foodHeight = 25,
    foodX = getRandom(width-foodWidth),
    foodY = getRandom(height-foodHeight),
    foodColor = "#8bc34a",
    //blocks after the head
    tails = [],
    lives = 3,
    heart = new Image(),
    mouse = new Image(),
    score = 0,
    running = false,
    previousPress = "default",
    collided = false,
    motionSpeedTimer = 150;

  heart.src="clippedHeart.png";
  mouse.src="mouse.png";


  function getRandom(upto){
    //return random no between from 0 to upto
    return Math.floor(Math.random()*upto);
  }
  //each block after the head (function constructor)
  function SnakeBlocks(x,y){
    this.x = x;
    this.y = y;
    this.direction = this.setDirection();
  }

  SnakeBlocks.prototype.move = function(){
    //movement of tail blocks are independent of the button pressed 
    //depends on the direction each block have
    if(this.direction==="left"){
      this.x-=dx;
    }else if(this.direction==="right"){
      this.x+=dx;
    }else if(this.direction==="up"){
      this.y-=dy;
    }else if(this.direction==="down"){
      this.y+=dy;
    }
  };
  //paints our tails
  SnakeBlocks.prototype.paint = function(){
    ctx.fillStyle=snakeBodyColor;
    ctx.fillRect(this.x+1,this.y+1,snakeWidth-1,snakeHeight-1);
    ctx.strokeStyle=snakeBoundary;
    ctx.strokeRect(this.x,this.y,snakeWidth+2,snakeHeight+2);
  };

  //sets the direction of tail block according to where the next block is.
  SnakeBlocks.prototype.setDirection = function(snake){
    //by default give head parameters
    //snake => SnakeBlocks object that is next to it
    snake = snake || {x:x,y:y};
    if(this.x === snake.x){
      if(this.y > snake.y){
        this.direction="up";
      }else{
        this.direction="down";
      }
    }else if(snake.y === this.y){
      if(this.x < snake.x){
        this.direction="right";
      }else{
        this.direction="left";
      }
    }
  };

  //event listeners
  document.addEventListener('keydown',handleKeyDown,false);

  function handleKeyDown(e){
    //restrict left <=> right or up <=> down movements. 
    if(e.keyCode === 37 && previousPress !=="right"){
      //reset all press states
      disableAll();
      //sets what's active 
      leftPressed = true;
      previousPress = "left";
    }else if(e.keyCode === 39 && previousPress !=="left"){
      disableAll();
      rightPressed = true;
      previousPress = "right";
    }else if(e.keyCode === 38 && previousPress!=="down"){
      disableAll();
      upPressed = true;
      previousPress ="up";
    }else if(e.keyCode===40 && previousPress!=="up"){
      disableAll();
      downPressed = true;
      previousPress= "down";
    }
  }

  function disableAll(){
    leftPressed= false;
    rightPressed= false;
    upPressed= false;
    downPressed = false;
    //make it run whenever the valid key's are pressed
    running = true;
  }

  function createSnake(){
    //creates SnakeBlocks  Object at correct pos acc to where the next one is
    var previousSnake = tails[tails.length-1] || {x:x,y:y,direction:'right'};
    if(previousSnake.direction=="left"){
      tails.push(new SnakeBlocks(previousSnake.x + snakeWidth,previousSnake.y));
    }else if(previousSnake.direction=="right"){
      tails.push(new SnakeBlocks(previousSnake.x - snakeWidth,previousSnake.y));
    }else if(previousSnake.direction=="up"){
      tails.push(new SnakeBlocks(previousSnake.x ,previousSnake.y + snakeHeight));
    }else if(previousSnake.direction=="down"){
      tails.push(new SnakeBlocks(previousSnake.x,previousSnake.y-snakeHeight));
    }
  }

  //UPDATES & PAINT EVERYTHIN ( MAIN GAME LOOP )
  function draw(){
    ctx.clearRect(0,0,width,height);
    if(lives===0){
      alert("Game Over !! :( ");
      document.location.reload();
    }
    //reset directions on each block acc to next one
    for(var i=0;i<tails.length;i++){
      tails[i].setDirection(tails[i-1]);
    }

    //paint everything
    drawFood();
    for(var i=0;i<tails.length;i++){
      tails[i].paint();
    }
    drawHead();

    drawLives();
    drawScore();

    updateHead();
    if(running){
      for(var i=0;i<tails.length;i++){
        tails[i].move();
      }
    }

    checkFoodCollision();
    //requestAnimationFrame(draw);
    setTimeout(draw, motionSpeedTimer);
  }
  draw();

  //by default create one tail
  createSnake();

  function drawLives(){
    for(var i=0;i<lives;i++){
      ctx.drawImage(heart,25 +35*i,25);
    }
  }

  function drawScore(){
    ctx.fillStyle="#8EB73D";
    ctx.font = "20px Roboto,Arial";
    ctx.fillText("Yummy, Mouses : " + score, width-250,45);
  }

  //checks food collision with head
  function checkFoodCollision(){
    if(x+snakeWidth + dx/8>=foodX && x <=foodX + foodWidth){
      if(y+snakeHeight+dy/8>=foodY && y<=foodY + foodHeight){
        //generate new snake
        createSnake();
        foodX = getRandom(width-foodWidth),
          foodY = getRandom(height-foodHeight);
        score+=1;

        // increment speed after every 5 increment score
        if(score >= 5 && score % 5 === 0){
          motionSpeedTimer -=5;
          console.log('decrementing',motionSpeedTimer);
        }

        collided = true;
      }
    }
  }

  function drawFood(){
    ctx.fillStyle=foodColor;
    ctx.drawImage(mouse,foodX,foodY);
  }

  function drawHead(){
    //head background
    ctx.fillStyle=snakeHeadColor;
    ctx.fillRect(x+1,y+1,snakeWidth-1,snakeHeight-1);
    ctx.strokeStyle=snakeBoundary;
    ctx.strokeRect(x,y,snakeWidth+2,snakeHeight+2);

    //eye1
    ctx.fillStyle = "#e8eaf6";
    drawArc("fill",x+snakeWidth/4,y+snakeHeight/4,2,0,2*Math.PI);

    //eye2
    drawArc("fill",x+snakeWidth*3/4,y+snakeHeight/4,2,0,2*Math.PI);

    ctx.strokeStyle = "#e8eaf6";
    if(collided){
      //eating face
      drawArc("stroke",x+snakeWidth/2,y+snakeHeight/1.5, 5 ,0,Math.PI*2);
      collided = false;
    }else{
      //cute smile
      drawArc("stroke",x+snakeWidth/2,y+snakeHeight/2, 5 ,45*Math.PI/180,Math.PI-4*Math.PI/180);
    }
  }

  //just dry code to draw arc
  function drawArc(style,x,y,radius,startAngle,endAngle){
    ctx.beginPath();
    ctx.arc(x,y,radius,startAngle,endAngle);
    if(style=="stroke"){
      ctx.stroke();
    }else if(style=="fill"){
      ctx.fill();
    }
    ctx.closePath();
  }

  function updateHead(){
    //move head acc to what is pressed
    if(leftPressed){
      x-=dx;
    }else if(rightPressed){
      x+=dx;
    }else if(upPressed){
      y-=dy;
    }else if(downPressed){
      y+=dy;
    }
    //boundary detection
    if(x+snakeWidth>width){
      lives-=1;
      stopMotion({horizontal:true,length: -dx*4});
      x -=dx*5;
    }else if(x+dy<0){
      lives-=1;
      stopMotion({horizontal:true,length: dx*4});
      x+=dx*5;
    }
    if(y<0){
      lives-=1;
      stopMotion({horizontal:false,length: dy*4});
      y+=dy*5;
    }else if(y+snakeHeight>height){
      lives-=1;
      stopMotion({horizontal:false,length: -dy*4});
      y-=dy*5;
    }

  }

  //resets the positions of snake and stops it
  function stopMotion(pos){
    running = false;
    leftPressed=0;
    rightPressed=0;
    downPressed=0;
    upPressed=0;
    if(pos.horizontal){
      //position the x direction
      for(var i=0;i<tails.length;i++){
        tails[i].x +=pos.length;
      }
    }else{
      //position the y direction
      for(var i=0;i<tails.length;i++){
        tails[i].y += pos.length;
      }
    }
  }

}());
