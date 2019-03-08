var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* SQL Query */
var sql_query = 'DELETE FROM student_info WHERE ';

// GET
router.get('/', function(req, res, next) {
	res.render('delete', { title: 'Deleting Database Entry' });
});

// POST
router.post('/', function(req, res, next) {
	// Retrieve Information
	var matric  = req.body.matric;
	var name    = req.body.name;
	var faculty = req.body.faculty;
	
	// Construct Specific SQL Query
	var delete_query = sql_query + "matric = '" + matric + "';";
	
	pool.query(delete_query, (err, data) => {
		res.redirect('/select')
	});
});

module.exports = router;
