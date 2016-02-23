

var ObjectHandler = {
    //public method
    getCloneOfObject: function(oldObject) {
        var tempClone = {};

        if (typeof(oldObject) == "object")
            for (prop in oldObject)
                // for array use private method getCloneOfArray
                if ((typeof(oldObject[prop]) == "object") &&
                                (oldObject[prop]).__isArray)
                    tempClone[prop] = this.getCloneOfArray(oldObject[prop]);
                // for object make recursive call to getCloneOfObject
                else if (typeof(oldObject[prop]) == "object")
                    tempClone[prop] = this.getCloneOfObject(oldObject[prop]);
                // normal (non-object type) members
                else
                    tempClone[prop] = oldObject[prop];

        return tempClone;
    },

    //private method (to copy array of objects) - getCloneOfObject will use this internally
    getCloneOfArray: function(oldArray) {
        var tempClone = [];

        for (var arrIndex = 0; arrIndex <= oldArray.length; arrIndex++)
            if (typeof(oldArray[arrIndex]) == "object")
                tempClone.push(this.getCloneOfObject(oldArray[arrIndex]));
            else
                tempClone.push(oldArray[arrIndex]);

        return tempClone;
    }
};

//global fun and object
var CANVAS = document.getElementById("backgroundCanvas");
function MIO(name , src){
window["W__"+name] = new Image();
window["W__"+name].src = src;
window["W__"+name].onload = function(){console.log("resourceloaded "+name);}
}

MIO("b1" , "background1.png");
MIO("zen" , "zenica.png");

// Getting elements
var pad = document.getElementById("pad");
var ball = document.getElementById("ball");
var svg = document.getElementById("svgRoot");
var message = document.getElementById("message");


var LEVEL_DATA = 10;

// Ball
var ballRadius = ball.r.baseVal.value;
var ballX;
var ballY;
var previousBallPosition = { x: 0, y: 0 };
var ballDirectionX;
var ballDirectionY;
var ballSpeed = 11;

// Pad
var padWidth = pad.width.baseVal.value;
var padHeight = pad.height.baseVal.value;
var padX;
var padY;
var padSpeed = 0;
var inertia = 0.80;

// Bricks
var bricks = [];
var destroyedBricksCount;
var brickWidth = function() {return window.innerWidth/100*5};
var brickHeight = 20;
var bricksRows = 3;
var bricksCols = 10;
var bricksMargin = function() {return window.innerWidth/100*1};
var bricksTop = 20;

// Misc.
var minX = ballRadius;
var minY = ballRadius;
var maxX;
var maxY;
var startDate;




/////////////////////////////
// face1
/////////////////////////////


//////////////////////////////
//nidza oko
//////////////////////////////
var FACE1 = new Object();
FACE1.X = function(){return window.innerWidth/100*50;};
FACE1.Y = function(){return window.innerHeight/100*21;};

var OKO = new Object();
OKO.X = function(){return window.innerWidth/100*79;};
OKO.Y = function(){return window.innerHeight/100*38;};
OKO.W = function(){return window.innerHeight/100*5;};
OKO.H = function(){return window.innerHeight/100*5;};
OKO.angle = function(){ return Math.atan((  (this.Y()+this.H()/2) - ballY ) / ( (this.X()+this.W()/2) -ballX))  * (180 / Math.PI);};
OKO.KVAD = function(){ return Math.atan2((  (this.Y()+this.H()/2) - ballY ) , ( (this.X()+this.W()/2) -ballX)) ;};
OKO.TETRA = 0;
OKO.RADIUS = 10;
OKO.x=function() { return this.RADIUS*Math.cos(this.TETRA); }
OKO.y=function() { return this.RADIUS*Math.sin(this.TETRA); }

OKO.draw = function(){
if (this.KVAD() > 0) {
if (this.angle() > 0){
this.TETRA = (this.angle()+180)* (Math.PI/180);
}else {this.TETRA = this.angle()* (Math.PI/180);}
}
else {
if (this.angle() > 0){
this.TETRA = this.angle()* (Math.PI/180);
}else {this.TETRA = (this.angle()+180)* (Math.PI/180);}
}

context.drawImage( W__zen , this.X() + this.x()  , this.Y() +this.y() , this.W() , this.H() );
context.drawImage( W__b1 , FACE1.X() , FACE1.Y() , window.innerWidth/100*45 , window.innerHeight/100*55 );

context.lineWidth = 2;
};



var OKO2 = ObjectHandler.getCloneOfObject(OKO);
OKO2.X = function(){return window.innerWidth/100*69;};
OKO2.Y = function(){return window.innerHeight/100*38;};


var OKO3 = ObjectHandler.getCloneOfObject(OKO);
OKO3.X = function(){return window.innerWidth/100*39;};
OKO3.Y = function(){return window.innerHeight/100*38;};

/////////////////////
// Brick function
/////////////////////
function Brick(x, y) {
    var isDead = false;
    var position = { x: x, y: y };

    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    svg.appendChild(rect);

    rect.setAttribute("width", brickWidth());
    rect.setAttribute("height", brickHeight);

    // Random green color
    var chars = "456789abcdef";
    var color = "";
    for (var i = 0; i < 2; i++) {
        var rnd = Math.floor(chars.length * Math.random());
        color += chars.charAt(rnd);
    }
    rect.setAttribute("fill", "#00" + color + "00");

    this.drawAndCollide = function () {
        if (isDead)
            return;
        // Drawing
        rect.setAttribute("x", position.x);
        rect.setAttribute("y", position.y);

        // Collision
        if (ballX + ballRadius < position.x || ballX - ballRadius > position.x + brickWidth())
            return;

        if (ballY + ballRadius < position.y || ballY - ballRadius > position.y + brickHeight)
            return;

        // Dead
        this.remove();
        isDead = true;
        destroyedBricksCount++;

        // Updating ball
        ballX = previousBallPosition.x;
        ballY = previousBallPosition.y;

        ballDirectionY *= -1.0;
		
		 
    };

    // Killing a brick
    this.remove = function () {
        if (isDead)
            return;
        svg.removeChild(rect);
    };
}

// Collisions
function collideWithWindow() {
    if (ballX < minX) {
        ballX = minX;
        ballDirectionX *= -1.0;
    }
    else if (ballX > maxX) {
        ballX = maxX;
        ballDirectionX *= -1.0;
    }

    if (ballY < minY) {
        ballY = minY;
        ballDirectionY *= -1.0;
    }
    else if (ballY > maxY) {
        ballY = maxY;
        ballDirectionY *= -1.0;
        lost();
    }
}

function collideWithPad() {
    if (ballX + ballRadius < padX || ballX - ballRadius > padX + padWidth)
        return;

    if (ballY + ballRadius < padY)
        return;

    ballX = previousBallPosition.x;
    ballY = previousBallPosition.y;
    ballDirectionY *= -1.0;

    var dist = ballX - (padX + padWidth / 2);

    ballDirectionX = 2.0 * dist / padWidth;

    var square = Math.sqrt(ballDirectionX * ballDirectionX + ballDirectionY * ballDirectionY);
    ballDirectionX /= square;
    ballDirectionY /= square;
}

// Pad movement
function movePad() {
    padX += padSpeed;

    padSpeed *= inertia;

    if (padX < minX)
        padX = minX;

    if (padX + padWidth > maxX)
        padX = maxX - padWidth;
}

registerMouseMove(document.getElementById("gameZone"), function (posx, posy, previousX, previousY) {
    padSpeed += (posx - previousX) * 0.2;
});

window.addEventListener('keydown', function (evt) {
    switch (evt.keyCode) {
        // Left arrow
        case 37:
            padSpeed -= 10;
            break;
        // Right arrow   
        case 39:
            padSpeed += 10;
            break;
    }
}, true);


var LEVEL = 1;

function NEXT_LEVEL () {

 LEVEL++;
 
 var STEP_UP = setInterval( function() {
 
 
 
 LEVEL_DATA++;
 checkWindow() 
 
 if (LEVEL_DATA > 100) { clearInterval(STEP_UP); }
 
 
 } , 100 );


}


function checkWindow() {
    maxX = window.innerWidth - minX;
    maxY = window.innerHeight - LEVEL_DATA - minY;
    padY = maxY - 30;
}

function gameLoop() {
    movePad();

    // Movements
    previousBallPosition.x = ballX;
    previousBallPosition.y = ballY;
    ballX += ballDirectionX * ballSpeed;
    ballY += ballDirectionY * ballSpeed;

    // Collisions
    collideWithWindow();
    collideWithPad();
	
	
	
	//nidza
	//context.fillStyle = "white";
	//context.fillRect(20 , padY , window.innerWidth , 20);
	 clearCanvas();
	 
		OKO.draw()
	    OKO2.draw()
	
    // Bricks
    for (var index = 0; index < bricks.length; index++) {
        bricks[index].drawAndCollide();
    }

    // Ball
    ball.setAttribute("cx", ballX);
    ball.setAttribute("cy", ballY);

    // Pad
    pad.setAttribute("x", padX);
    pad.setAttribute("y", padY);
    

	

	
	
	
    // Victory ?
    if (destroyedBricksCount == bricks.length) {
        win();
    }
	
	
	
	
	
}

function generateBricks() {

   var XMARGIN = function(){ return window.innerWidth /100*10;};

    // Removing previous ones
    for (var index = 0; index < bricks.length; index++) {
        bricks[index].remove();
    }

    // Creating new ones
    var brickID = 0;

    var offset = (window.innerWidth - bricksCols * (brickWidth() + bricksMargin())) / 2.0;
 
    for (var x = 0; x < bricksCols; x++) {
		
        for (var y = 0; y < bricksRows; y++) {
			if (x >=5 ){ 
			
			XMARGIN=function(){return window.innerWidth/100*25;};      
			bricks[brickID++] = new Brick(  x * (brickWidth() +  bricksMargin() )+ XMARGIN(), y * (brickHeight + bricksMargin()) + bricksTop);
	 
			}
			else {
			XMARGIN=function(){return window.innerWidth/100*10;};  
            bricks[brickID++] = new Brick(  x * (brickWidth() +   bricksMargin() )+ XMARGIN(), y * (brickHeight + bricksMargin()) + bricksTop);
	 
			}
        
		}
    }
}

var gameIntervalID = -1;
function lost() {
    clearInterval(gameIntervalID);
    gameIntervalID = -1;
    
    message.innerHTML = "Game over !";
    message.style.visibility = "visible";
}

function win() {
    clearInterval(gameIntervalID);
    gameIntervalID = -1;

    var end = (new Date).getTime();

    message.innerHTML = "Victory ! (" + Math.round((end - startDate) / 1000) + "s)";
    message.style.visibility = "visible"; 
}

function initGame() {
    message.style.visibility = "hidden";

    checkWindow();
    
    padX = (window.innerWidth - padWidth) / 2.0;

    ballX = window.innerWidth / 2.0;
    ballY = maxY - 60;

    previousBallPosition.x = ballX;
    previousBallPosition.y = ballY;
    
    padSpeed = 0;

    ballDirectionX = Math.random();
    ballDirectionY = -1.0;

    generateBricks();
    gameLoop();
}

function startGame() {
    initGame();

    destroyedBricksCount = 0;

    if (gameIntervalID > -1)
        clearInterval(gameIntervalID);

    startDate = (new Date()).getTime(); ;
    gameIntervalID = setInterval(gameLoop, 16);
}

document.getElementById("newGame").onclick = startGame;

//window.onresize = initGame;
window.onresize = function(){

initGame()

CANVAS.width =  window.innerWidth - 2;
CANVAS.height =  window.innerHeight - 2;


};




initGame();
CANVAS.width =  window.innerWidth - 2;
CANVAS.height =  window.innerHeight - 2;





// OKO












