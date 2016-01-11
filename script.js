'use strict';

function Game() {

	// Constants 
	var blockSize = 50;
	var totalSize = 600;
	var blocksInLine = totalSize / blockSize;
	var blocksTotal = blocksInLine * blocksInLine;
	var foodDuration = 5000;
	var enemySpeed = 500;

	// Objects
	var $gameBlock = document.getElementById('gameBlock'); 
	var $PLAYER;
	var $FOOD;
	var $ENEMY;
	var spawnInterval;
	var spawnTimeout;
	var enemyStepInterval;

	var totalPoints = 0;
	var startTime = tim

	// Initialize
	(function() {
		$gameBlock.style.width  = totalSize + 'px';
		$gameBlock.style.height = totalSize + 'px';

		document.addEventListener('keydown', keyDownEvent, false);
		spawnInterval = setInterval(spawnFood, foodDuration);

		createBlocks();
		spawnPlayer();
		spawnEnemy();
	})();

	function createBlocks() {
		var fragment = document.createDocumentFragment();
		var id = 1;
		for (var i = 1; i <= blocksInLine; i++) {
			for (var j = 1; j <= blocksInLine; j++, id++) {
				var node = document.createElement('div');
				node.className = 'block';
				node.id = 'block-' + id;
				node.style.width = blockSize + 'px';
				node.style.height = blockSize + 'px';
				node.setAttribute('data-col', i);
				node.setAttribute('data-row', j);
				fragment.appendChild(node);
			}
		}

		$gameBlock.appendChild(fragment);
	}

	function spawnPlayer() {
		var position = getRandomId();
		var $player = document.getElementById('block-' + position);
		$player.className = 'block player';
		$player.setAttribute('data-isEntity', true);

		$PLAYER = $player;
	}

	function spawnEnemy() {
		destroyBlock($ENEMY);
		clearInterval(enemyStepInterval);
		clearTimeout(spawnTimeout);
		clearTimeout(respawn);


		var respawn = setTimeout(function() {
			var id = getRandomId();
			var position = getRandomPosition(id);

			if (isEntityInPosition(position[0], position[1])) {
				spawnEnemy();
			}

			var $enemy = document.getElementById('block-' + id);
			$enemy.className = 'block enemy';
			$enemy.setAttribute('data-isEntity', true);

			$ENEMY = $enemy;

			enemyStepInterval = setInterval(enemyGoes, enemySpeed);
			// spawnTimeout = setTimeout(spawnEnemy, 5000);
		}, 5000);
	}

	function enemyGoes() {
		destroyBlock($ENEMY);
		var x = getXPosition($ENEMY);
		var y = getYPosition($ENEMY);

		var $enemy;

		step();
		function step() {
			var random = getRandomArbitary(0, 4);

			switch (random) {
				case 0: // left
					if (x == 1) { step() }
					$enemy = getBlockByPosition(x - 1, y);
					break;
				case 1: // Up
					if (y == 1) { step() }
					$enemy = getBlockByPosition(x, y - 1);
					break;
				case 2: // Right
					if (x == blocksInLine) { step() }
					$enemy = getBlockByPosition(x + 1, y);
					break;
				case 3: // Down
					if (y == blocksInLine) { step() }
					$enemy = getBlockByPosition(x, y + 1);
					break;
			}
		}

		if (!$enemy) { step() }

		$enemy.className = 'block enemy';
		$enemy.setAttribute('data-isEntity', true);
		$ENEMY = $enemy;
	}

	function spawnFood() {
		// Remove last food if any
		if ($FOOD) {
			$FOOD.className = $FOOD.className.replace('food', '');
		}

		var id = getRandomId();
		var position = getRandomPosition(id);

		if (isEntityInPosition(position[0], position[1])) {
			spawnFood();
		}

		var $food = getBlockById(id);
		$food.className = 'block food';
		$food.setAttribute('data-isEntity', true);

		$FOOD = $food;
	}

	function positionPlayer(x, y) {
		var $block = getBlockByPosition(x, y);
		
		if ($block.getAttribute('data-isEntity') === 'true') {
			var classes = $block.className;
			console.log(classes);

			if (classes.indexOf('food') >= 0) {
				playerEatFood();
			} else if (classes.indexOf('enemy') >= 0) {
				enemyGotPlayer();
				return;
			}
		}

		destroyBlock($PLAYER);
		$block.className = 'block player';
		$PLAYER = $block;
		$PLAYER.setAttribute('data-isEntity', true);
	}

	function playerEatFood() {
		totalPoints += 1;
		console.log('+1! Total:' + totalPoints);
	}

	function enemyGotPlayer() {
		clearTimeout(spawnTimeout);

		totalPoints -= 1;

		if (totalPoints < 0) {
			destroyBlock($FOOD);
			destroyBlock($PLAYER);

			clearInterval(spawnInterval);

			document.removeEventListener('keydown', keyDownEvent);

			console.log('You failed!');
		} else {
			console.log('-1! Total:' + totalPoints);
			spawnEnemy();
		}

		
	}

	function destroyBlock($block) {
		if ($block) {
			$block.className = 'block';
			$block.setAttribute('data-isEntity', false);
		}
	}

	function keyDownEvent(event) {
		switch (event.keyCode) {
			case 37:
				playerGoLeft();
				break;
			case 38:
				playerGoUp();
				break;
			case 39:
				playerGoRight();
				break;
			case 40:
				playerGoDown();
				break;
		}
	}

	function playerGoLeft() {
		var $player = $PLAYER;
		var xPosition = getXPosition($player);

		if (xPosition !== 1) {
			var yPosition = getYPosition($player);

			positionPlayer(xPosition - 1, yPosition);
		} 
	}

	function playerGoUp() {
		var $player = $PLAYER;
		var yPosition = getYPosition($player);

		if (yPosition !== 1) {
			var xPosition = getXPosition($player);

			positionPlayer(xPosition, yPosition - 1);
		} 
	}

	function playerGoRight() {
		var $player = $PLAYER;
		var xPosition = getXPosition($player);

		if (xPosition !== blocksInLine) {
			var yPosition = getYPosition($player);

			positionPlayer(xPosition + 1, yPosition);
		} 
	}

	function playerGoDown() {
		var $player = $PLAYER;
		var yPosition = getYPosition($player);

		if (yPosition !== blocksInLine) {
			var xPosition = getXPosition($player);

			positionPlayer(xPosition, yPosition + 1);
		} 
	}

	function getRandomArbitary(min, max) {
	  	return ~~(Math.random() * (max - min) + min);
	}


	function getRandomId() {
		return getRandomArbitary(1, blocksTotal);
	}

	function getRandomPosition(id) {
		id = id || getRandomId();
		var $block = getBlockById(id);

		return [$block.getAttribute('data-row'), $block.getAttribute('data-col')];
	}

	function getXPosition($block) {
		return ~~$block.getAttribute('data-row');
	}

	function getYPosition($block) {
		return ~~$block.getAttribute('data-col');
	}

	function getBlockByPosition(x, y) {
		return document.querySelector("div[data-row='" + x + "'][data-col='" + y + "']");
	}

	function getBlockById(id) {
		return document.getElementById('block-' + id);
	}

	function isEntityInPosition(x, y) {
		var $block = getBlockByPosition(x, y);
		if ($block && $block.getAttribute('data-isEntity') === 'true') {
			return true;
		} 
	}

	function isAnythingInRange(x, y, range) {
		var yMin = y - range;
		var yMax = +y + range;
		var xMin = x - range;
		var xMax = +x + range;
		y = yMin;
		x = xMin;

		while (y <= yMax) {
			if (y < 1) { 
				y++; 
				continue; 
			}

			if (y > blocksInLine) { 
				y = yMin; 
				continue; 
			}

			x = xMin;
			while (true) {
				if (x < 1) { 
					x++; 
					continue; 
				}

				if (x > xMax || x > blocksInLine) { 
					y++;
					break; 
				}

				var $block = getBlockByPosition(x, y);
				if ($block.getAttribute('data-isEntity')) {
					return true;
				}

				x++;
			}
		}

		return false;
	}

		

}

