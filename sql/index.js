const sql = {}

sql.query = {
    // Insert
    add_user: 'INSERT INTO Users (uid, username, password, phone, region, country) VALUES ($1,$2,$3,$4,$5,$6)',

    // Update
    update_info: 'UPDATE Users SET phone=$2, region=$3, country=$4 WHERE username=$1',
    update_pass: 'UPDATE Users SET password=$2 WHERE username=$1',

    // Feedback
    findUid: 'select uid from Users WHERE lower(username) LIKE lower($1)',
    submit_feedback: 'INSERT INTO Feedbacks (fid, feedback, dateTime, uid) VALUES ($1,$2,$3,$4)',

    // Login
    userpass: 'SELECT * FROM Users WHERE username=$1',

    // Search
    search: 'SELECT * FROM Stuffs WHERE sid = $1',
    search_stuff: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions NATURAL JOIN Users NATURAL JOIN Belongs WHERE lower(stuffName) LIKE lower($1) OR lower(username) LIKE lower($1) OR lower(categoryName) like lower($1)',
    categorySearch: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions NATURAL JOIN Users NATURAL JOIN Belongs WHERE categoryName=$1',

    // Discover
    discover: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions NATURAL JOIN Users WHERE Descriptions.pickUpLocation = (SELECT region FROM Users WHERE username = $1) OR Descriptions.returnLocation = (SELECT region FROM Users WHERE username = $1)',
    discover_all: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions NATURAL JOIN Users ORDER BY stuffName',

    // Borrowed
    borrowed: 'SELECT R2.sid, stuffname, nextminimumbid, pickuptime, pickuplocation, returntime, returnlocation, U.username from (SELECT R.sid, stuffname, nextminimumbid, pickuptime, pickuplocation, returntime, returnlocation, R.uid FROM (select * FROM Stuffs NATURAL JOIN Descriptions) as R JOIN Borrows B ON B.uid = $1 AND R.sid = B.sid) AS R2 JOIN Users U ON R2.uid = U.uid',

    // Lending
    lending: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions AS R WHERE NOT EXISTS (SELECT 1 FROM Borrows B WHERE B.sid = R.sid) and uid = $1',

    // Lent
    lent: 'SELECT Stuffs.sid as sid, Stuffs.stuffname as stuffname, Users.username as name FROM Stuffs NATURAL JOIN Descriptions JOIN (Borrows NATURAL JOIN Users) on Stuffs.sid = Borrows.sid WHERE EXISTS (SELECT 1 FROM Borrows B WHERE B.sid = Stuffs.sid) and Descriptions.uid = $1',

    // Lent_Details
    details: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions WHERE sid = $1',

    // Lend_New_Stuff
    checkLender: 'SELECT uid FROM Lenders WHERE uid = $1',
    insertToLenders: 'INSERT INTO Lenders(uid) VALUES ($1)',
    insertToStuff: 'INSERT INTO Stuffs(sid, stuffName, originalPrice, nextMinimumBid) VALUES ($1, $2, $3, $3)',
    insertToLends: 'INSERT INTO Lends(sid, uid) VALUES ($1, $2)',
    insertToDescription: 'INSERT INTO Descriptions(pickUpTime, returnTime, pickUpLocation, returnLocation, summary, uid, sid) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    insertToBelongs: 'INSERT INTO Belongs(sid,categoryName) VALUES ($1,$2)',

    // Information
    page_lims: 'SELECT * FROM Users ORDER BY ranking ASC LIMIT 10 OFFSET $1',

    // Stuff Page
    locate_stuff: 'SELECT * FROM Stuffs NATURAL JOIN Descriptions NATURAL JOIN Users WHERE sid=$1',

    // Comment
    commentList: 'SELECT * FROM Comments NATURAL JOIN Users NATURAL JOIN Stuffs WHERE sid = $1',

    // Submit comment
    submit_comment: 'insert into Comments(comment, updateTime, uid, sid, rating) values ($1, $2, $3, $4, $5)',

    // Bid action
    bids: 'INSERT INTO Bids (uid, sid, bid) VALUES ($1,$2,$3)',

    // Delete Stuff
    delete_stuff: 'DELETE FROM Stuffs WHERE sid = $1',

    // Update Stuff
    update_stuff: 'UPDATE Descriptions SET pickUpTime=$2, returnTime=$3, pickUpLocation=$4, returnLocation=$5, summary=$6 WHERE sid=$1',

    // Find Highest Bid
    find_max_bid: 'SELECT * FROM Bids NATURAL JOIN Users WHERE sid = $1 ORDER BY bid DESC LIMIT 1',

    // Accept
    accept: 'INSERT INTO Borrows(uid, sid) VALUES ($1, $2)',

    // Badges
    badges: 'SELECT * FROM Earns WHERE uid=$1',

    // Leaderboard
    leaderboard: 'WITH NumLends AS (SELECT uid, username, count(sid) AS num FROM Users NATURAL JOIN Lends GROUP BY uid, username), NumBorrows AS (SELECT uid, username, count(sid) AS num FROM Users NATURAL JOIN Borrows GROUP BY uid, username)' +
        'SELECT Users.uid, Users.username, COALESCE(NL.num, 0) + COALESCE(nb.num, 0) AS Score FROM Users LEFT JOIN NumLends NL ON Users.uid = NL.uid LEFT JOIN NumBorrows NB ON Users.uid = NB.uid ORDER BY Score DESC',

    // User Bid
    user_bid: 'SELECT * FROM Bids WHERE uid = $1 AND sid = $2',

    // Cancel Bid
    cancelBid: 'DELETE FROM Bids WHERE uid = $1 AND sid = $2',

    // Replace bid
    replace_bid: 'UPDATE Stuffs SET nextminimumbid=$2 WHERE sid=$1',

    // Find if Stuff belongs to User
    match_stuff: 'SELECT * FROM Users NATURAL JOIN Lends WHERE lower(username) = $1 AND sid = $2',

    // Find if Stuff is already Borrowed
    check_borrowed: 'SELECT * FROM Borrows WHERE sid = $1'
}


module.exports = sql
