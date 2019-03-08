var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* SQL Query */
var sql_query = 'UPDATE student_info SET ';

// GET
router.get('/', function(req, res, next) {
	res.render('update', { title: 'Updating Database' });
});

// POST
router.post('/', function(req, res, next) {
	// Retrieve Information
	var matric  = req.body.matric;
	var name    = req.body.name;
	var faculty = req.body.faculty;
	
	// Construct Specific SQL Query
	var update_query = sql_query + "name = '" + name + "', faculty = '" + faculty + "' WHERE matric = '" + matric + "';";
	
	pool.query(update_query, (err, data) => {
		res.redirect('/select')
	});
});

module.exports = router;
