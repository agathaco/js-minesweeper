document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  const flagsLeft = document.querySelector('#flags-left')
  const result = document.querySelector('#result')
  const newGameBtn = document.querySelector('.btn')

  const levels = [
    {
      name:'Easy',
      width: 10,
      bombs: 20
    },
    {
      name:'Medium',
      width: 15,
      bombs: 30
    },
    {
      name:'Hard',
      width: 20,
      bombs: 70
    },
  ]
  let root = document.documentElement;
  let selectedLevel = levels[0];
  let flags = 0
  let tiles = [];
  let isGameOver = false
  let numberColors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d'];

  function clearBoard() {
    isGameOver = false;
    flags = 0;
    tiles.forEach(tile => {
      tile.remove();
    });
    createBoard();
  }
  newGameBtn.addEventListener('click', () => clearBoard())


  function createBoard() {
    flagsLeft.innerHTML = selectedLevel.bombs
    const width = selectedLevel.width
    const tileWidth = parseInt((getComputedStyle(root).getPropertyValue('--tile-width')))
    root.style.setProperty('--grid-width', width * tileWidth)

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
    const randomTiles = tiles.sort(() => Math.random() - 0.5).slice(0, selectedLevel.bombs).map(tile => tile.id) // suffle tile's id and select 20 firsts to get 20 random tiles
    tiles.forEach((tile) => randomTiles.includes(tile.id) ? tile.classList.add('has-bomb') : tile.classList.add('is-empty')) // if tile's id is in ramdomTile array, add bomb
    tiles.sort((a, b) => a.id - b.id); //sort array by id again


    //add numbers
    for (let i = 0; i < tiles.length; i++) {
      let total = 0
      const isLeftEdge = (i % width === 0)
      const isRightEdge = (i % width === width - 1)

      if (!tiles[i].classList.contains('has-bomb')) {
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
    const width = selectedLevel.width
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
    if (!tile.classList.contains('checked') && (flags < selectedLevel.bombs)) {
      if (!tile.classList.contains('flag')) {
        tile.classList.add('flag')
        tile.innerHTML = ' 🚩'
        flags++
        flagsLeft.innerHTML = selectedLevel.bombs - flags
        checkForWin()
      } else {
        tile.classList.remove('flag')
        tile.innerHTML = ''
        flags--
        flagsLeft.innerHTML = selectedLevel.bombs - flags
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
      if (matches === selectedLevel.bombs) {
        result.innerHTML = 'YOU WIN!'
        isGameOver = true

        // reveal all remaining tiles
        if (!tile.classList.contains('checked')) {
          tile.classList.add('checked')
        }
      }
    })
  }

  // dropdown menu functions
  const dropdownTitle = document.querySelector('.dropdown .title');
  const dropdownOptions = document.querySelectorAll('.dropdown .option');

  function toggleMenuDisplay(e) {
    const dropdown = e.target.parentNode; //getting the parent selector
    const menu = dropdown.querySelector('.menu'); //selecting 'menu' fron the parent selector
    menu.classList.toggle('close-menu');
  }

  function handleOptionSelected(e) {
    e.target.parentNode.classList.toggle('close-menu'); // using parentnode to get the menu  elementfrom option elements
    dropdownTitle.textContent = e.target.textContent;
    // here: select current level form levels object
    selectedLevel = levels.find(level => level.name === e.target.textContent)
    clearBoard();
  }

  //bind listeners to these elements
  dropdownTitle.addEventListener('click', toggleMenuDisplay);
  dropdownOptions.forEach(option => option.addEventListener('click', handleOptionSelected));

})