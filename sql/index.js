const sql = {}

sql.query = {
	showuser:  'select* from Users',

	//insert
	add_user: 'INSERT INTO Users (uid, username, password, phone, address, city, country) VALUES ($1,$2,$3,$4,$5,$6,$7)',

	// Update
	update_info: 'UPDATE Users SET phone=$2, address=$3, city=$4, country=$5 WHERE username=$1',
	update_pass: 'UPDATE Users SET password=$2 WHERE username=$1',

	// Login
	userpass: 'SELECT * FROM Users WHERE username=$1',

	// Search
	search_user: 'SELECT * FROM Users WHERE lower(username) LIKE $1',

	// Information
	page_lims: 'SELECT * FROM Users ORDER BY ranking ASC LIMIT 10 OFFSET $1',
}

module.exports = sql