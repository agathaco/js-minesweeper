document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  const flagsLeft = document.querySelector('#flags-left')
  const result = document.querySelector('#result')
  const newGameBtn = document.querySelector('#refresh')
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
  const flagIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Flag" fill="#574c8c" x="0px" y="0px" viewBox="0 0 403.04 403.04" style="enable-background:new 0 0 403.04 403.04;" xml:space="preserve"><g><path d="M370.604,50.16L370.604,50.16c-2.948-1.487-6.507-1.011-8.96,1.2c-21.68,19.44-41.6,28.88-60.96,28.88s-38.16-8.96-61.52-29.2c-50.72-43.28-100.56-43.2-158.8-1.84c-4.08,2.88-4.08,2.88-3.36,86.16c0,32.72,0.56,73.28,0,78.96c-1.106,4.278,1.465,8.642,5.742,9.748c2.572,0.665,5.306,0.01,7.298-1.748c20.301-15.662,45.085-24.409,70.72-24.96c16.693,0.091,33.132,4.092,48,11.68c16.247,8.709,34.294,13.529,52.72,14.08c96.64,0,112.56-158.16,113.2-164.88C375.125,54.962,373.504,51.751,370.604,50.16z"/></g><g><path d="M52.364,0h-7.52c-9.146,0-16.56,7.414-16.56,16.56v369.92c0,9.146,7.414,16.56,16.56,16.56h7.52c9.146,0,16.56-7.414,16.56-16.56V16.56C68.924,7.414,61.51,0,52.364,0z"/></g></svg>'
  let root = document.documentElement;
  let selectedLevel = levels[0];
  let flags = 0
  let tiles = [];
  let isGameOver = false
  let numberColors = ['#2baef6', '#42dfbc', '#e989ec', '#625edc', '#f8d31e', '#b54874', '#21709b', '#34495e'];


  function clearBoard() {
    console.clear();
    isGameOver = false;
    flags = 0;
    tiles.forEach(tile => {
      tile.remove();
    });
    tiles = [];
    result.innerHTML = ''
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
      console.log(tile)
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
        tile.style.color= numberColors[total - 1];
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
        tile.innerHTML = flagIcon
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
    menu.classList.toggle('show');
  }

  function handleOptionSelected(e) {
    e.target.parentNode.classList.toggle('show'); // using parentnode to get the menu  elementfrom option elements
    dropdownTitle.textContent = e.target.textContent;
    // here: select current level form levels object
    selectedLevel = levels.find(level => level.name === e.target.textContent)
    clearBoard();
  }

  //bind listeners to these elements
  dropdownTitle.addEventListener('click', toggleMenuDisplay);
  dropdownOptions.forEach(option => option.addEventListener('click', handleOptionSelected));

})