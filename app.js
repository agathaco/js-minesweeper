document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  const flagsLeft = document.querySelector('#flags-left')
  const result = document.querySelector('#result')
  const newGameBtn = document.querySelector('.btn')

  let width = 10
  let bombAmount = 20
  let flags = 0
  let tiles = [];
  let isGameOver = false
  let numberColors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d'];

  function clearBoard() {
    console.log('clearing');
    isGameOver = false;
    flags = 0;
    tiles.forEach(tile => {
      console.log('removing tiles')
      tile.remove();
    });
    createBoard();
  }
  newGameBtn.addEventListener('click', () => clearBoard())


  function createBoard() {
    flagsLeft.innerHTML = bombAmount

    //add tiles
    for (let i = 0; i < width * width; i++) {
      const tile = document.createElement('div');
      tile.setAttribute('id', i);
      tile.classList.add('tile')
      grid.appendChild(tile)
      tiles.push(tile)

      //left click
      tile.addEventListener('click', () => clickTile(tile))

      //ctrl and right click
      tile.oncontextmenu = (e) => {
        e.preventDefault()
        addFlag(tile)
      }
    }

    //add bombs
    const randomTiles = tiles.sort(() => Math.random() - 0.5).slice(0,bombAmount).map(tile => tile.id) // suffle tile's id and select 20 firsts to get 20 random tiles
    tiles.forEach((tile) => randomTiles.includes(tile.id) ? tile.classList.add('has-bomb') : tile.classList.add('is-empty')) // if tile's id is in ramdomTile array, add bomb
    tiles.sort((a, b) => a.id - b.id); //sort array by id again


    //add numbers
    for (let i = 0; i < tiles.length; i++) {
      let total = 0
      const isLeftEdge = (i % width === 0)
      const isRightEdge = (i % width === width - 1)

      if (!tiles[i].classList.contains('has-bomb')) {
        console.log(tiles[i])
        if (!isLeftEdge) {
          if (tiles[i - 1] && tiles[i - 1].classList.contains('has-bomb')) total++
          if (tiles[i - 1 + width] && tiles[i - 1 + width].classList.contains('has-bomb')) total++
          if (tiles[i - 1 - width] && tiles[i - 1 - width].classList.contains('has-bomb')) total++
        }

        if (!isRightEdge) {
          if (tiles[i + 1] && tiles[i + 1].classList.contains('has-bomb')) total++
          if (tiles[i + 1 + width] && tiles[i + 1 + width].classList.contains('has-bomb')) total++
          if (tiles[i + 1 - width] && tiles[i + 1 - width].classList.contains('has-bomb')) total++
        }

        if (tiles[i - width] && tiles[i - width].classList.contains('has-bomb')) total++
        if (tiles[i + width] && tiles[i + width].classList.contains('has-bomb')) total++

        tiles[i].setAttribute('data', total)

      }
    }

  }

  createBoard()

  //click on tile
  function clickTile(tile) {
    let currentId = tile.id
    if (isGameOver) return
    if (tile.classList.contains('checked') || tile.classList.contains('flag')) return
    if (tile.classList.contains('has-bomb')) {
      console.log(tile)
      gameOver()
    } else {
      let total = tile.getAttribute('data')
      if (total != 0) {
        tile.classList.add('checked')
        tile.style.color = numberColors[total - 1];
        tile.innerHTML = total
        return
      }
      checktile(currentId)
    }
    tile.classList.add('checked')
  }

  //check neighboring tiles once tile is clicked
  function checktile(currentId) {
    const isLeftEdge = (currentId % width === 0)
    const isRightEdge = (currentId % width === width - 1)
    const parsedId = parseInt(currentId);

    function loopThroughtiles(tileId) {
      const newId = tileId.id
      const newTile = document.getElementById(newId)
      clickTile(newTile)
    }

    setTimeout(() => {
      if (!isRightEdge) {
        if (tiles[parsedId + 1 - width]) loopThroughtiles(tiles[parsedId + 1 - width])
        if (tiles[parsedId + 1]) loopThroughtiles(tiles[parsedId + 1])
        if (tiles[parsedId + 1 + width]) loopThroughtiles(tiles[parsedId + 1 + width])
      }
      if (!isLeftEdge) {
        if (tiles[parsedId - 1]) loopThroughtiles(tiles[parsedId - 1])
        if (tiles[parsedId - 1 - width]) loopThroughtiles(tiles[parsedId - 1 - width])
        if (tiles[parsedId - 1 + width]) loopThroughtiles(tiles[parsedId - 1 + width])
      }
      if (tiles[parsedId - width]) loopThroughtiles(tiles[parsedId - width])
      if (tiles[parsedId + width]) loopThroughtiles(tiles[parsedId + width])
    }, 50)
  }

  //game over
  function gameOver() {
    result.innerHTML = 'BOOM! Game Over!'
    isGameOver = true

    //show all the bombs
    tiles.forEach(tile => {
      if (tile.classList.contains('has-bomb')) {
        tile.innerHTML = '💣'
        tile.classList.remove('has-bomb')
        tile.classList.add('checked')
      }
    })
  }

  //add Flag with right click
  function addFlag(tile) {
    if (isGameOver) return
    if (!tile.classList.contains('checked') && (flags < bombAmount)) {
      if (!tile.classList.contains('flag')) {
        tile.classList.add('flag')
        tile.innerHTML = ' 🚩'
        flags++
        flagsLeft.innerHTML = bombAmount - flags
        checkForWin()
      } else {
        tile.classList.remove('flag')
        tile.innerHTML = ''
        flags--
        flagsLeft.innerHTML = bombAmount - flags
      }
    }
  }

  //check for win
  function checkForWin() {
    let matches = 0
    tiles.forEach(tile => {
      if (tile.classList.contains('flag') && tile.classList.contains('has-bomb')) {
        matches++
      }
      if (matches === bombAmount) {
        result.innerHTML = 'YOU WIN!'
        isGameOver = true

        // reveal all remaining tiles
        if (!tile.classList.contains('checked')) {
          console.log('revealing tile')
          tile.classList.add('checked')
        }
      }
    })
  }

})