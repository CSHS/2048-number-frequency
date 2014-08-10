//animationDelay = 100;
//minSearchTime = 100;
//minEnemyTime = 50;

animationDelay = 0;
minSearchTime = 0;
minEnemyTime = 0;

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  var manager = new GameManager(4, KeyboardInputManager, HTMLActuator);
});
