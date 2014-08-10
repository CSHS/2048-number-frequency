function AI(grid) {
  this.grid = grid;
}

AI.prototype.getAvailableScores = function() {
  var generationSelector = document.getElementById("generation-selector");
  var maxValue = Math.pow(2,parseInt(generationSelector.options[generationSelector.selectedIndex].value));
  var result = {};
  for (var value = 2; value <= maxValue; value *=2) {
    result[value] = [];
  }
  return result;
}

// static evaluation function
AI.prototype.eval = function() {
  var emptyCells = this.grid.availableCells().length;

  var smoothWeight = 0.1,
      //monoWeight   = 0.0,
      //islandWeight = 0.0,
      mono2Weight  = 1.0,
      emptyWeight  = 2.7,
      maxWeight    = 1.0;

  return this.grid.smoothness() * smoothWeight
       //+ this.grid.monotonicity() * monoWeight
       //- this.grid.islands() * islandWeight
       + this.grid.monotonicity2() * mono2Weight
       + Math.log(emptyCells) * emptyWeight
       + this.grid.maxValue() * maxWeight;
};

// alpha-beta depth first search
AI.prototype.search = function(depth, alpha, beta, positions, cutoffs, isEnemy) {
  var bestScore;
  var bestMove = -1;
  var bestEnemy = -1;
  var result;

  // the maxing player
  if (this.grid.playerTurn) {
    bestScore = alpha;
    for (var direction in [0, 1, 2, 3]) {
      var newGrid = this.grid.clone();
      if (newGrid.move(direction).moved) {
        positions++;
        if (newGrid.isWin()) {
          return { move: direction, enemy: -1, score: 10000, positions: positions, cutoffs: cutoffs };
        }
        var newAI = new AI(newGrid);

        if (depth == 0) {
          result = { move: direction, score: newAI.eval() };
        } else {
          result = newAI.search(depth-1, bestScore, beta, positions, cutoffs, isEnemy);
          if (result.score > 9900) { // win
            result.score--; // to slightly penalize higher depth from win
          }
          positions = result.positions;
          cutoffs = result.cutoffs;
        }

        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = direction;
          if (result.enemy != -1)
            bestEnemy = result.enemy;
        }
        if (bestScore > beta) {
          cutoffs++
          return { move: bestMove, enemy: -1, score: beta, positions: positions, cutoffs: cutoffs };
        }
      }
    }
  }

  else { 
    bestScore = beta;

    if (isEnemy) { // if playing as the computer properly check all possible moves for best option.
      for (var x=0; x<4; x++) {
        for (var y=0; y<4; y++) {
          var position = {x:x, y:y};
          var scores = this.getAvailableScores();
          if (this.grid.cellAvailable(position)) {
            for (var value in scores) {
              var newGrid = this.grid.clone();
              var tile = new Tile(position, parseInt(value,10) );
              newGrid.insertTile(tile);
              newGrid.playerTurn = true;
              positions++;
              newAI = new AI(newGrid);
              //console.log('inserted tile, players turn is', newGrid.playerTurn);
              result = newAI.search(depth, alpha, bestScore, positions, cutoffs, isEnemy);
              positions = result.positions;
              cutoffs = result.cutoffs;

              if (result.score < bestScore) {
                bestScore = result.score;
                bestEnemy = [position, parseInt(value,10)];
              }
              if (bestScore < alpha) {
                cutoffs++;
                return { move: bestMove, enemy: bestEnemy, score: bestScore, positions: positions, cutoffs: cutoffs };
              }
            }
          }
        }
      }
    } else { // Player's move, we'll do heavy pruning to keep the branching factor low
      // try a 2 and 4 in each cell and measure how annoying it is
      // with metrics from eval
      var candidates = [];
      var cells = this.grid.availableCells();
      var scores = this.getAvailableScores();
      for (var value in scores) {
        for (var i in cells) {
          scores[value].push(null);
          var cell = cells[i];
          var tile = new Tile(cell, parseInt(value, 10));
          this.grid.insertTile(tile);
          scores[value][i] = -this.grid.smoothness()*5 + this.grid.islands();
          this.grid.removeTile(cell);
        }
      }

      // now just pick out the most annoying moves
      var maxScore = Math.max(Math.max.apply(null, scores[2]), Math.max.apply(null, scores[4]));
      for (var value in scores) { // 2 and 4
        for (var i=0; i<scores[value].length; i++) {
          if (scores[value][i] == maxScore) {
            candidates.push( { position: cells[i], value: parseInt(value, 10) } );
          }
        }
      }

      // search on each candidate
      for (var i=0; i<candidates.length; i++) {
        var position = candidates[i].position;
        var value = candidates[i].value;
        var newGrid = this.grid.clone();
        var tile = new Tile(position, value);
        newGrid.insertTile(tile);
        newGrid.playerTurn = true;
        positions++;
        newAI = new AI(newGrid);
        result = newAI.search(depth, alpha, bestScore, positions, cutoffs, isEnemy);
        positions = result.positions;
        cutoffs = result.cutoffs;

        if (result.score < bestScore) {
          bestScore = result.score;
          bestEnemy = [position, value];
        }
        if (bestScore < alpha) {
          cutoffs++;
          return { move: null, enemy: bestEnemy, score: alpha, positions: positions, cutoffs: cutoffs };
        }
      }
    }
  }

  return { move: bestMove, enemy: bestEnemy, score: bestScore, positions: positions, cutoffs: cutoffs };
}

// performs a search and returns the best move
AI.prototype.getBest = function() {
  return this.iterativeDeep();
}

// performs a search and returns the best move
AI.prototype.getEnemy = function() {
  return this.iterativeEnemy();
}

// performs iterative deepening over the alpha-beta search
AI.prototype.iterativeDeep = function() {
  var start = (new Date()).getTime();
  var depth = 0;
  var best;
  do {
    var newBest = this.search(depth, -10000, 10000, 0 ,0, false);
    if (newBest.move == -1) {
      break;
    } else {
      best = newBest;
    }
    depth++;
  } while ( (new Date()).getTime() - start < minSearchTime);
  return best
}

AI.prototype.iterativeEnemy = function() {
  var start = (new Date()).getTime();
  var depth = 0;
  var best;
  do {
    var newBest = this.search(depth, -10000, 10000, 0 ,0, true);
    if (newBest.enemy == -1) {
      break;
    } else {
      best = newBest;
    }
    depth++;
  } while ( (new Date()).getTime() - start < minEnemyTime);
  return best;
}

AI.prototype.translate = function(move) {
 return {
    0: 'up',
    1: 'right',
    2: 'down',
    3: 'left'
  }[move];
}

