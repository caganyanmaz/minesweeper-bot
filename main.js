const root = document.getElementById("root");
const cells = [];
const board = document.createElement("div");
const switch_button = document.createElement("button");
const HUMAN    = 0;
const COMPUTER = 1;
let current_player = 0;
let game_over = false;
let game_lock = false;
const PLAYER_NAMES = ["human", "computer"];
const BOT_WAIT_TIME = 10;

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

function get_adjacent_mine_count(i, j)
{
  return get_adjacent_cell_positions(i, j)
    .filter(([ni, nj]) => has_mine(ni, nj))
    .reduce((acc, _) => acc + 1, 0);
}

function clear_empty_fields(i, j)
{
  const mine_count = get_adjacent_mine_count(i, j);
  cells[i][j].dataset.state = mine_count;
  if (mine_count > 0)
  {
    cells[i][j].innerHTML = mine_count;
    return;
  }
  get_adjacent_cell_positions(i, j)
    .filter(([ni, nj]) => parseInt(cells[ni][nj].dataset.state) === INITIAL_STATE || parseInt(cells[ni][nj].dataset.state) === FLAG_STATE)
    .forEach(([ni, nj]) => clear_empty_fields(ni, nj));
}


function reveal_cell(i, j)
{
  if (game_over || parseInt(cells[i][j].dataset.state) !== INITIAL_STATE)
  {
    return;
  }
  if (has_mine(i, j))
  {
    alert(`Game Over ${i} ${j}`);
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


function on_cell_right_click(i, j)
{
  const cell_state = parseInt(cells[i][j].dataset.state);
  if (cell_state === INITIAL_STATE)
  {
    cells[i][j].dataset.state = FLAG_STATE;
  }
  else if (cell_state === FLAG_STATE)
  {
    cells[i][j].dataset.state = INITIAL_STATE;
  }
}


function on_cell_click(i, j)
{
  if (current_player === COMPUTER || game_lock)
  {
    return;
  }
  const cell_state = parseInt(cells[i][j].dataset.state);
  if (cell_state === INITIAL_STATE)
  {
    reveal_cell(i, j);
  }
  else if (0 < cell_state && cell_state < 9 && cell_state === get_adjacent_state_count(i, j, FLAG_STATE))
  {
    get_adjacent_cell_positions(i, j)
      .filter(([ni, nj]) => parseInt(cells[ni][nj].dataset.state) === INITIAL_STATE)
      .forEach(([ni, nj]) => reveal_cell(ni, nj));
  }
}


function create_cell(i, j)
{
  const cell = document.createElement("div");
  cell.onclick = () => on_cell_click(i, j);
  cell.oncontextmenu = (event) => 
  { 
    event.preventDefault(); 
    on_cell_right_click(i, j)
  };
  cell.classList.add("cell");
  cell.dataset.state = INITIAL_STATE;
  cell.dataset.has_mine = false;
  cell.dataset.pos = `${i}-${j}`;
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


function add_mines_to_cells()
{
  const pairs = cartesian_product([...Array(HEIGHT).keys()], [...Array(WIDTH).keys()]);
  shuffle(pairs);
  for (const [i, j] of pairs.slice(0, MINE_COUNT))
  {
    cells[i][j].dataset.has_mine = true;
  }
}

function bot_cycle()
{
  if (current_player !== COMPUTER)
  {
    return;
  }
  game_lock = true;
  states = cells.map(row => row.map(cell => parseInt(cell.dataset.state)));
  [action, i, j] = find_next_move(states);
  if (action === REVEAL_ACTION)
  {
    reveal_cell(i, j);
  }
  else
  {
    cells[i][j].dataset.state = FLAG_STATE;
  }
  game_lock = false;
}

function run_bot_loop()
{
  if (game_over)
    return;
  if (!game_lock && current_player === COMPUTER)
  {
    bot_cycle();
  }
  setTimeout(run_bot_loop, BOT_WAIT_TIME);
}

function init()
{
  init_bot();
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
  run_bot_loop();
}


init();

