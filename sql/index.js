const sql = {}

sql.query = {
	showuser:  'select* from Users',

	//insert
	add_user: 'INSERT INTO Users (uid, username, password, phone, region, country) VALUES ($1,$2,$3,$4,$5,$6)',

	// Update
	update_info: 'UPDATE Users SET phone=$2, region=$3, country=$4 WHERE username=$1',
	update_pass: 'UPDATE Users SET password=$2 WHERE username=$1',

	//complaints
	findUid: 'select uid from Users WHERE lower(username) LIKE $1',
	write_complaints: 'INSERT INTO writeComplaints (cid, complaint, dateTime, uid) VALUES ($1,$2,$3,$4)',

	// Login
	userpass: 'SELECT * FROM Users WHERE username=$1',

	// Search
	search_user: 'SELECT * FROM Users WHERE lower(username) LIKE $1',
	search_stuff: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions NATURAL JOIN Users WHERE lower(stuffName) LIKE $1',

	// Discover
	discover: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions NATURAL JOIN Users WHERE Descriptions.pickUpLocation = (SELECT region FROM Users WHERE username = $1) OR Descriptions.returnLocation = (SELECT region FROM Users WHERE username = $1)',

	// Borrowed
	borrowed: 'SELECT * FROM (select sid, stuffname, nextminimumbid, returntime, returnlocation FROM Stuffs NATURAL JOIN Descriptions) as R NATURAL JOIN Borrows B WHERE B.uid = $1',

	// Lending
	lending: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions AS R WHERE NOT EXISTS (SELECT 1 FROM Borrows B WHERE B.sid = R.sid) and uid = $1',

	// Lent
	lent: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions AS R WHERE EXISTS (SELECT 1 FROM Borrows B WHERE B.sid = R.sid) and uid = $1',

	// Lent_Details
	details: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions WHERE sid = $1',

	// Lend_New_Stuff
	checkLender: 'SELECT COUNT(uid) AS num FROM Lenders WHERE uid = $1 GROUP BY uid',
	insertToLenders: 'INSERT INTO Lenders(uid) VALUES ($1)',
	insertToStuff: 'INSERT INTO Stuffs(sid, stuffName, nextMinimumBid) VALUES ($1, $2, $3)',
	insertToLends: 'INSERT INTO Lends(sid, uid) VALUES ($1, $2)',
	insertToDescription: 'INSERT INTO Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) VALUES ($1, $2, $3, $4, $5, $6, $7)',

	// Information
	page_lims: 'SELECT * FROM Users ORDER BY ranking ASC LIMIT 10 OFFSET $1',
	// Bidding
	bidding: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions NATURAL JOIN Users WHERE sid=$1',

	//Bid action
	bids: 'INSERT INTO Bids (uid, sid, bid) VALUES ($1,$2,$3)',

	//Delete Lent
	delete_lent: 'DELETE FROM Stuffs WHERE sid = $1',

	//Find Highest Bid
	find_max_bid: 'SELECT * FROM Bids WHERE sid = $1 ORDER BY bid DESC LIMIT 1',

	//Accept
	accept: 'INSERT INTO Borrows(uid, sid) VALUES ($1, $2)'
}

module.exports = sql