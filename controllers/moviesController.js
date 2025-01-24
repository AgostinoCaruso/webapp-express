import CustomError from "../classes/CustomError.js";
import connection from "../connection.js";

function index(req, res) {
  const sql = `
  SELECT movies.*, AVG(reviews.vote) AS vote_average, COUNT(reviews.text) AS commenti
  FROM movies
  LEFT JOIN reviews 
	  ON reviews.movie_id = movies.id
  GROUP BY movies.id;`;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({
      error: `Database query failed`
    });
    res.json(results);
  })
}

function show(req, res) {
  const id = parseInt(req.params.id);

  // Prima query: Recupera i dettagli del libro
  const sqlMovieDetails = `SELECT * FROM movies WHERE id = ?;`;

  connection.query(sqlMovieDetails, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query failed' });

    const item = results[0]; // Prendi il primo libro
    if (!item) return res.status(404).json({ error: 'Movie not found' });

    // Seconda query: Recupera tutti i commenti associati al libro
    const sqlMovieReviews = `SELECT * FROM reviews WHERE movie_id = ?;`;

    connection.query(sqlMovieReviews, [id], (err, reviews) => {
      if (err) return res.status(500).json({ error: 'Error server' });

      // Aggiungi i commenti ai dettagli del libro
      item.reviews = reviews;

      res.json(item); // Rispondi con il libro completo e i commenti
    });
  });
}
// const response= {
//   id: results[0].id,
//   pizza_name: results[0].pizza_name,
//   ingredients: results.map(ele => ele.ingredient_name),
// };

function store(req, res) {
  let newId = 0;
  for (let i = 0; i < books.length; i++) {
    if (books[i].id > newId) {
      newId = books[i].id;
    }
  }
  newId += 1;
  console.log(req.body);
  // new data is in req.body
  const newItem = {
    id: newId,
    ...req.body,
  };

  books.push(newItem);
  res.status(201).json(newItem);
}

function update(req, res) {
  const id = parseInt(req.params.id);
  const item = books.find((item) => item.id === id);
  if (!item) {
    throw new CustomError("L'elemento non esiste", 404);
  }

  //console.log(req.body);
  for (key in item) {
    if (key !== "id") {
      item[key] = req.body[key];
    }
  }

  //console.log(books);
  res.json(item);
}

function destroy(req, res) {

  const { id } = req.params;

  connection.query('DELETE FROM movies WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({
      error: 'Failed to delete movie'
    });
    res.sendStatus(204)
  });
}

export { index, show, store, update, destroy };
