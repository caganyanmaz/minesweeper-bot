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

function get_sorted_unique(arr)
{
  arr.sort();
  if (arr.length < 1)
    return [];
  const res = [arr[0]];
  for (let i = 1; i < arr.length; i++)
  { 
    if (arr[i][0] !== arr[i-1][0] || arr[i][1] !== arr[i-1][1])
    {
      res.push(arr[i]);
    }
  }
  return res;
}

function is_cell_in_range(i, j)
{
  return 0 <= i && i < HEIGHT && 0 <= j && j < WIDTH;
}

function get_adjacent_cell_positions(i, j)
{
  return cartesian_product([i-1, i, i+1], [j-1, j, j+1]).filter(([ci, cj]) => is_cell_in_range(ci, cj) && !(ci == i && cj == j));
}

function get_adjacent_states(i, j, state)
{
  return get_adjacent_cell_positions(i, j)
    .filter(([ni, nj]) => parseInt(cells[ni][nj].dataset.state) === state)
}

function get_adjacent_state_count(i, j, state)
{
  return get_adjacent_states(i, j, state)
    .reduce((acc, _) => acc + 1, 0);
}


