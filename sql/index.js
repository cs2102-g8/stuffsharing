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
	borrowed: 'SELECT * FROM (sid, stuffname, nextMinimumBid, returnTime, returnLocation Stuffs NATURAL JOIN Descriptions) NATURAL JOIN Borrows WHERE uid = $1',

	// Lent
	lent: 'SELECT sid, stuffname, pickupTime, returnTime, pickupLocation, returnLocation FROM Stuffs NATURAL JOIN Descriptions WHERE uid = $1',

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
	bid_action: 'INSERT INTO Bids (uid, sid, bid) VALUES ($1,$2,$3)',
}

module.exports = sql