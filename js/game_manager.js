var iterations = 0;
var loop = 0;
function GameManager(size, InputManager, Actuator) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.running      = false;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.inputManager.on('think', function() {
    var best = this.ai.getBest();
    this.actuator.showHint(best.move);
  }.bind(this));


  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('Auto-run');
    } else {
      iterations = prompt("Please enter number of iterations",0);
      loop=0;
      this.running = true;
      this.run()
      this.actuator.setRunButton('Stop');
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton('Auto-run');
  this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);
  this.grid.addStartTiles();

  this.ai           = new AI(this.grid);

  this.score        = 0;
  this.over         = false;
  this.won          = false;

  // Update the actuator
  this.actuate();
};


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over:  this.over,
    won:   this.won
  });
};

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  var result = this.grid.move(direction);
  this.score += result.score;
   

  

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove(this.ai);
      for (var x=0; x<4; x++) {
    for (var y=0; y<4; y++) {
      if (this.grid.cellOccupied(this.grid.indexes[x][y])) {
        var value = this.grid.cellContent(this.grid.indexes[x][y]).value;
        if (value==2)
          array[0]++;
        else if (value==4)
          array[1]++;
        else if (value==8)
          array[2]++;
        else if (value==16)
          array[3]++;
        else if (value==32)
          array[4]++;
        else if (value==64)
          array[5]++;
        else if (value==128)
          array[6]++;
        else if (value==256)
          array[7]++;
        else if (value==512)
          array[8]++;
        else if (value==1024)
          array[9]++;
        else if (value==2048)
          array[10]++;
      }
    }
  }
    }
  } else {
    this.won = true;
  }

  //console.log(this.grid.valueSum());

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
  }

  this.actuate();
}

// moves continuously until game is over
GameManager.prototype.run = function() {
  //insert how many interations to run and record frequency of numbers captured.
  
  if (iterations!=null)
  {
    var best = this.ai.getBest();
    this.move(best.move);
    var timeout = animationDelay;
    if (this.running && !this.over && !this.won && loop<(iterations-1)) {
      loop++;
      var self = this;
      setTimeout(function(){
        self.run();
      }, timeout);
    }
    else{
      var print = "[ ";
      for (var index=0;index<array.length;index++){
        print+= array[index]+", ";
      }
      print+="]";
      console.log(print);
      }
  }
  
}
