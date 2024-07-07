const WIDTH  = 50; 
const HEIGHT = 30;
const MINE_COUNT = 100;

const root = document.getElementById("root");
const cells = [];
const board = document.createElement("div");
const switch_button = document.createElement("button");
const HUMAN    = 0;
const COMPUTER = 1;
let current_player = 0;
let game_over = false;
const PLAYER_NAMES = ["human", "computer"];

// 0 - 8: open state
const INITIAL_STATE = 9;
const MINE_STATE    = 10;
const FLAG_STATE    = 11;

function cartesian_product(a, b)
{
  const res = [];
  for (const i of a)
  {
    for (const j of b)
    {
      res.push([i, j]);
    }
  }
  return res;
}

function has_mine(i, j)
{
  const has_mine = cells[i][j].dataset.has_mine === "true";
  return has_mine;
}


function configure_switch_button()
{
  const other_player = 1 - current_player;
  switch_button.innerHTML = `Switch to ${PLAYER_NAMES[other_player]}`
  switch_button.onclick = () => { 
    current_player = other_player;
    configure_switch_button();
  }; 
}

function is_cell_in_range(i, j)
{
  return 0 <= i && i < HEIGHT && 0 <= j && j < WIDTH;
}


function get_adjacent_cell_positions(i, j)
{
  return cartesian_product([i-1, i, i+1], [j-1, j, j+1]).filter(([ci, cj]) => is_cell_in_range(ci, cj) && !(ci == i && cj == j));
}

function get_adjacent_mine_count(i, j)
{
  let mine_count = 0;
  get_adjacent_cell_positions(i, j).forEach(([ci, cj]) => {
    if (has_mine(ci, cj))
      mine_count++;
  });
  return mine_count;
}

function clear_empty_fields(i, j)
{
  const mine_count = get_adjacent_mine_count(i, j);
  console.log(i, j, mine_count);
  cells[i][j].dataset.state = mine_count;
  if (mine_count > 0)
  {
    cells[i][j].innerHTML = mine_count;
    return;
  }
  console.log(get_adjacent_cell_positions(i, j));
  get_adjacent_cell_positions(i, j)
    .filter(([ni, nj]) => parseInt(cells[ni][nj].dataset.state) === INITIAL_STATE)
    .forEach(([ni, nj]) => clear_empty_fields(ni, nj));
}


function on_cell_right_click(i, j)
{
  if (parseInt(cells[i][j].dataset.state) === INITIAL_STATE)
  {
    cells[i][j].dataset.state = FLAG_STATE;
  }
  else if (parseInt(cells[i][j].dataset.state) === FLAG_STATE)
  {
    cells[i][j].dataset.state = INITIAL_STATE;
  }
}

function on_cell_click(i, j)
{
  console.log(MouseEvent.button);
  if (game_over || current_player === COMPUTER || parseInt(cells[i][j].dataset.state) !== INITIAL_STATE)
  {
    return;
  }
  if (has_mine(i, j))
  {
    alert("You died :)");
    game_over = true;
    return;
  }
  const mine_count = get_adjacent_mine_count(i, j);
  if (mine_count === 0)
  {
    clear_empty_fields(i, j);
  }
  else
  {
    cells[i][j].dataset.state = mine_count;
    cells[i][j].innerHTML = mine_count;
  }
}

function create_cell(i, j)
{
  const cell = document.createElement("div");
  cell.onclick = () => on_cell_click(i, j);
  cell.oncontextmenu = () => on_cell_right_click(i, j);
  cell.classList.add("cell");
  cell.dataset.state = INITIAL_STATE;
  cell.dataset.has_mine = false;
  return cell;
}

function create_cells()
{
  for (let i = 0; i < HEIGHT; i++)
  {
    cells.push([]);
    for (let j = 0; j < WIDTH; j++)
    {
      cells[i].push(create_cell(i, j));
    }
  }
}

function shuffle(arr)
{
  for (let i = 0; i < arr.length; i++)
  {
    let j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[j];
    arr[j] = arr[i];
    arr[i] = tmp;
  }
}

function add_mines_to_cells()
{
  const pairs = cartesian_product([...Array(HEIGHT).keys()], [...Array(WIDTH).keys()]);
  shuffle(pairs);
  for (const [i, j] of pairs.slice(0, MINE_COUNT))
  {
    console.log(i, j);
    cells[i][j].dataset.has_mine = true;
  }
}

function init()
{
  create_cells();
  add_mines_to_cells();
  configure_switch_button();
  cells
    .forEach(cell_row => 
  {
    const row = document.createElement("div");
    row.classList.add("row");
    cell_row.forEach(cell => row.appendChild(cell));
    board.appendChild(row);
  });
  root.appendChild(switch_button);
  root.appendChild(board);
}


init();


