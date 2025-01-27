import connection from "../connection.js";
import CustomError from "../classes/CustomError.js";

function index(req, res) {
    // Recupero tutti i libri e per ciascun film il numero delle recensioni e la media voto totale:
    const sql = `SELECT movies.*, AVG(reviews.vote) AS vote_average, COUNT(reviews.text) AS commenti
                FROM movies
                LEFT JOIN reviews 
                ON reviews.movie_id = movies.id
                GROUP BY movies.id`;
    // Uso il metodo query() per passargli la query SQL e una funzione di callback:
    connection.query(sql, (err, results) => {
        // Se rilevo un errore nella chiamata al database, restituisco l'errore HTTP 500 Internal Server Error” e un messaggio personalizzato:
        if (err) res.status(500).json({ error: 'Errore del server' });
        // console.log(results);
        // Creo un oggetto contenente il conteggio totale dei libri e il risultato della query SQL:
        const response = {
            count: results.length,
            items: results,
        }
        //Rispondo con l'oggetto JSON riempito con i data ricevuti dall'interrogazione fatta al database:
        res.json(response);
    });
}

function show(req, res) {
    const id = parseInt(req.params.id);
    // Recupero tutti i libri e per ciascun film il numero delle recensioni e la media voto totale:
    const sql = `SELECT movies.*, AVG(reviews.vote) AS vote_average, COUNT(reviews.text) AS commenti
                FROM reviews
                RIGHT JOIN movies 
                ON movies.id = reviews.movie_id
                WHERE movies.id = ?`;
    // Uso il metodo query() per passargli la query SQL e una funzione di callback:
    connection.query(sql, [id], (err, results) => {
        // Se rilevo un errore nella chiamata al database, restituisco l'errore HTTP 500 Internal Server Error” e un messaggio personalizzato:
        if (err) return res.status(500).json({
            error: 'Errore del server'
        });
        // Assegno alla costante item i dati ritornati dalla query:
        const item = results[0];
        if (item.id == null) return res.status(404).json({ error: 'film non trovato' });
        // Creo la query SQL con le Prepared statements (? al posto di id) per evitare le SQL Injections:
        const sqlReviews = "SELECT * FROM `reviews` WHERE `movie_id` = ?";
        // Uso il metodo query() per passargli la query SQL, il valore di di id nel segnaposto "?", e una funzione di callback:
        connection.query(sqlReviews, [id], (err, reviews) => {
            if (err) return res.status(500).json({ error: "Error server" });
            // Aggiungo all'oggetto item una chiave/proprietà che conterrà i commenti associati:
            item.reviews = reviews;
            // Ritorno l'oggetto (item)
            res.json(item);
        });
    });
}

function store(req, res) {
}

function update(req, res) {
}
function destroy(req, res) {
    const id = parseInt(req.params.id);
    // Uso il metodo query() per passargli la query SQL, il valore di "?", e una funzione di callback:
    connection.query("DELETE FROM `movies` WHERE `id` = ?", [id], (err) => {
        // Se rilevo un errore restituisco l'errore HTTP 500 Internal Server Error” e un messaggio personalizzato:
        if (err) return res.status(500).json({ error: 'Errore del server! Cancellazione fallita' });
        // Invio lo status 204: il server ha completato con successo la richiesta, ma restituisco alcun contenuto
        res.sendStatus(204);
    });
}

export { index, show, store, update, destroy };
