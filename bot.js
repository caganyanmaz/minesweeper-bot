const NOT_FLAGGED   = 0;
const FLAGGED_EMPTY = 1;
const FLAGGED_MINE  = 2;

const flags         = [];
const possibilities = [];
let total_possibilities = 0;
let states = [];
let border = [];

function init_bot()
{
  for (let i = 0; i < HEIGHT; i++)
  {
    frow = [];
    prow = [];
    for (let j = 0; j < WIDTH; j++)
    {
      frow.push(NOT_FLAGGED);
      prow.push(0);
    }
    flags.push(frow);
    possibilities.push(prow);
  }
}

function find_edges(arr)
{
  const edges = [];
  for (const [i, j] of cartesian_product([...Array(HEIGHT).keys()], [...Array(WIDTH).keys()]))
  {
    if (0 < arr[i][j] && arr[i][j] < 9 && get_adjacent_state_count(i, j, INITIAL_STATE) > 0)
    {
      edges.push([i, j]);
    }
  }
  return edges;
}

function get_border(edges)
{
  const border_with_duplicates = edges
                                  .map(([i, j]) => get_adjacent_states(i, j, INITIAL_STATE))
                                  .reduce((acc, cur) => acc.concat(cur), []);
  return get_sorted_unique(border_with_duplicates);
}

function reset_cell(i, j)
{
  flags[i][j] = NOT_FLAGGED;
  possibilities[i][j] = 0;
}


function reset_all_cells()
{
  cartesian_product([...Array(HEIGHT).keys()], [...Array(WIDTH).keys()])
    .forEach(([i, j]) => reset_cell(i, j));
}


function update_possibilities()
{
  total_possibilities++;
  border.forEach(([i, j]) => {
    if (flags[i][j] === FLAGGED_EMPTY)
    {
      possibilities[i][j]++;
    }
  });
}


let current_edge_predicted_mine_count = 0;
function calculate_predicted_adjacent_mine_count(i, j)
{
  const prev_flag_count = get_adjacent_state_count(i, j, FLAG_STATE);
  const current_flag_count = get_adjacent_cell_positions(i, j)
                              .filter(([i, j]) => flags[i][j] === FLAGGED_MINE)
                              .reduce((acc, _) => acc + 1, 0);
  return prev_flag_count + current_flag_count;
}

function dfs(edges, edge_index, border_index)
{
  if (edge_index === edges.length)
  {
    update_possibilities(edges);
    return;
  }
  const [i, j] = edges[edge_index];
  if (current_edge_predicted_mine_count > states[i][j])
  {
    return;
  }
  if (border_index >= get_adjacent_state_count(i, j, INITIAL_STATE) && current_edge_predicted_mine_count === states[i][j])
  {
    if (edge_index + 1 < edges.length)
    {
      current_edge_predicted_mine_count = calculate_predicted_adjacent_mine_count(...edges[edge_index+1]);
    }
    dfs(edges, edge_index + 1, 0);
    current_edge_predicted_mine_count = states[i][j];
    return;
  }
  if (border_index >= get_adjacent_state_count(i, j, INITIAL_STATE))
  {
    return;
  }
  const [ci, cj] = [...get_adjacent_states(i, j, INITIAL_STATE)][border_index];
  if (flags[ci][cj] !== NOT_FLAGGED)
  {
    dfs(edges, edge_index, border_index + 1);
    return;
  }
  flags[ci][cj] = FLAGGED_EMPTY;
  dfs(edges, edge_index, border_index + 1);
  flags[ci][cj] = FLAGGED_MINE;
  current_edge_predicted_mine_count++;
  dfs(edges, edge_index, border_index + 1);
  current_edge_predicted_mine_count--;
  flags[ci][cj] = NOT_FLAGGED;
}

const guaranteed_moves = [];

function find_next_move(arr)
{
  if (guaranteed_moves.length > 1)
  {
    const res = guaranteed_moves[guaranteed_moves.length-1];
    guaranteed_moves.pop();
    return res;
  }
  states = arr;
  edges = find_edges(arr);
  border = get_border(edges);
  if (border.length < 1)
  {
    return [REVEAL_ACTION, Math.floor(Math.random() * HEIGHT), Math.floor(Math.random() * WIDTH)]; // <- Buggy, because it might pick a flagged state
  }
  reset_all_cells();
  total_possibilities = 0;
  current_edge_predicted_mine_count = calculate_predicted_adjacent_mine_count(...edges[0]);
  dfs(edges, 0, 0);
  const definite_mines = border.filter(([i, j]) => possibilities[i][j] === 0);
  const definite_safes = border.filter(([i, j]) => possibilities[i][j] === total_possibilities);
  if ((definite_safes.length + definite_mines.length) > 0)
  {
    guaranteed_moves.push(...definite_mines.map(([i, j]) => [FLAG_ACTION, i, j]).concat(definite_safes.map(([i, j]) => [REVEAL_ACTION, i, j])));
    return find_next_move(arr);
  }
  const most_likely_empty = border.reduce(([mi, mj], [i, j]) => (possibilities[i][j] > possibilities[mi][mj]) ? [i, j] : [mi, mj]);
  return [REVEAL_ACTION, ...most_likely_empty];
}
