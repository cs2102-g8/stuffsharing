const sql_query = require('../sql');
const passport = require('passport');
const bcrypt = require('bcrypt')

// Postgre SQL Connection
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
    //ssl: true
});

const round = 10;
const salt  = bcrypt.genSaltSync(round);

const uuidv1 = require('uuid/v1'); // npm install uuid

function initRouter(app) {
	/* GET */
	app.get('/'      , index );
	app.get('/search', search);
	
	/* PROTECTED GET */
	app.get('/dashboard', passport.authMiddleware(), dashboard);
	app.get('/update'    , passport.authMiddleware(), update    );
	app.get('/discover'    , passport.authMiddleware(), discover    );
	app.get('/borrowedstuff'    , passport.authMiddleware(), borrowedstuff   );
	app.get('/lentstuff'    , passport.authMiddleware(), lentstuff   );
	app.get('/myself'    , passport.authMiddleware(), myself    );
	app.get('/categories'    , passport.authMiddleware(), categories  );
	app.get('/complain', passport.authMiddleware(), complain  );
	
	app.get('/register' , passport.antiMiddleware(), register );
	app.get('/password' , passport.antiMiddleware(), retrieve );
    app.get('/bidding'  , bidding    );
    app.get('/lentDetails'  , passport.authMiddleware(), lentDetails    );
	
	/* PROTECTED POST */
	app.post('/update_info', passport.authMiddleware(), update_info);
	app.post('/update_pass', passport.authMiddleware(), update_pass);
	app.post('/complain_file',  passport.authMiddleware(), complain_file);
	app.post('/lendNewStuff',  passport.authMiddleware(), lend);
	app.post('/delete_lent',  passport.authMiddleware(), deleteLent);
	//app.post('/add_game'   , passport.authMiddleware(), add_game   );
	//app.post('/add_play'   , passport.authMiddleware(), add_play   );
	
	app.post('/reg_user'   , passport.antiMiddleware(), reg_user   );

    //app.post('/bids',  passport.authMiddleware(), bids);
	/* LOGIN */
	app.post('/login', passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/'
	}));
	
	/* LOGOUT */
	app.get('/logout', passport.authMiddleware(), logout);
}


// Render Function
function basic(req, res, page, other) {
	var info = {
		page: page,
		username: req.user.username,
		phone: req.user.phone,
		region   : req.user.region,
		country: req.user.country
	};
	if(other) {
		for(var fld in other) {
			info[fld] = other[fld];
		}
	}
	res.render(page, info);
}
function query(req, fld) {
	return req.query[fld] ? req.query[fld] : '';
}
function msg(req, fld, pass, fail) {
	var info = query(req, fld);
	return info ? (info=='pass' ? pass : fail) : '';
}

// GET
function index(req, res, next) {
	var ctx = 0, idx = 0, tbl, total;
	if(Object.keys(req.query).length > 0 && req.query.p) {
		idx = req.query.p-1;
	}
	pool.query(sql_query.query.page_lims, [idx*10], (err, data) => {
		if(err || !data.rows || data.rows.length == 0) {
			tbl = [];
		} else {
			tbl = data.rows;
		}
		pool.query(sql_query.query.showuser, (err, data) => {
			if(err || !data.rows || data.rows.length == 0) {
				ctx = 0;
			} else {
				ctx = data.rows[0].count;
			}
			total = ctx%10 == 0 ? ctx/10 : (ctx - (ctx%10))/10 + 1;
			console.log(idx*10, idx*10+10, total);
			if(!req.isAuthenticated()) {
				res.render('index', { page: '', auth: false});
			} else {
				basic(req, res, 'index', { page: '', auth: true, tbl: tbl, ctx: ctx, p: idx+1, t: total });
			}
		});
	});
}

function search(req, res, next) {
	var ctx  = 0, avg = 0, tbl;
	pool.query(sql_query.query.search_stuff, [req.query.stuff], (err, data) => {
		if(err || !data.rows || data.rows.length == 0) {
			ctx = 0;
			tbl = [];
		} else {
			ctx = data.rows.length;
			tbl = data.rows;
		}
		if(req.isAuthenticated()) {
			basic(req, res, 'search', { page: 'search', auth: true, tbl: tbl, ctx: ctx });
		}
	});
}
function dashboard(req, res, next) {
	basic(req, res, 'dashboard', { info_msg: msg(req, 'info', 'Information updated successfully', 'Error in updating information'), pass_msg: msg(req, 'pass', 'Password updated successfully', 'Error in updating password'), auth: true });
}

function update(req, res, next) {
	basic(req, res, 'update', { info_msg: msg(req, 'info', 'Information updated successfully', 'Error in updating information'), pass_msg: msg(req, 'pass', 'Password updated successfully', 'Error in updating password'), auth: true });
}

function discover(req, res, next) {
    var ctx  = 0, avg = 0, tbl;
    pool.query(sql_query.query.discover, [req.user.username], (err, data) => {
        if(err || !data.rows || data.rows.length == 0) {
        ctx = 0;
        tbl = [];
    } else {
        ctx = data.rows.length;
        tbl = data.rows;
    }
    if(req.isAuthenticated()) {
        basic(req, res, 'discover', { page: 'discover', auth: true, tbl: tbl, ctx: ctx });
    }
});
}

function borrowedstuff(req, res, next) {
    var ctx  = 0, avg = 0, tbl;
    pool.query(sql_query.query.findUid, [req.user.username], (err, data) => {
        pool.query(sql_query.query.borrowed, [data.rows[0].uid], (err, data) => {
            if (err){
                console.error(err);
            } else if(!data.rows || data.rows.length == 0) {
                ctx = 0;
                tbl = [];
            } else {
                ctx = data.rows.length;
                tbl = data.rows;
            }
            if(req.isAuthenticated()) {
                basic(req, res, 'borrowedstuff', { page: 'borrowedstuff', auth: true, tbl: tbl, ctx: ctx });
            }
        });
    });
}

function lentstuff(req, res, next) {
    var ctx  = 0, avg = 0, tbl;
    pool.query(sql_query.query.findUid, [req.user.username], (err, data) => {
        pool.query(sql_query.query.lent, [data.rows[0].uid], (err, data) => {
            if (err){
                console.error("Error in update info");
                res.redirect('/lentstuff?update=fail');
            } else if(!data.rows || data.rows.length == 0) {
                ctx = 0;
                tbl = [];
            } else {
                ctx = data.rows.length;
                tbl = data.rows;
            }
            if(req.isAuthenticated()) {
                basic(req, res, 'lentstuff', { page: 'lentstuff', auth: true, tbl: tbl, ctx: ctx, lend_msg: msg(req, 'lend', 'Lend stuff successfully', 'Error in stuff information')});
            }
        });
    });
}

function myself(req, res, next) {
	basic(req, res, 'myself', {auth: true});
}

function categories(req, res, next) {
	basic(req, res, 'categories', {auth: true});
}
function bidding(req, res, next) {
    var ctx  = 0, avg = 0, tbl;
    //var sid = req.body.sid;
  
    pool.query(sql_query.query.bidding, [req.query.stuff], (err, data) => {
        if(err || !data.rows || data.rows.length == 0) {
        ctx = 0;
        tbl = [];
    } else {
        ctx = data.rows.length;
        tbl = data.rows;
    }
    if(req.isAuthenticated()) {
        basic(req, res, 'bidding', { page: 'bidding', auth: true, tbl: tbl, ctx: ctx });
    }

function lentDetails(req, res, next) {
    var ctx  = 0, avg = 0, tbl;
    var sid = req.query.sid;

    pool.query(sql_query.query.details, [sid], (err, data) => {
    if (err){
        console.error(err);
        res.redirect('/lentDetails?detail=fail');
    } else if(!data.rows || data.rows.length == 0) {
        ctx = 0;
        tbl = [];
    } else {
        ctx = data.rows.length;
        tbl = data.rows;
    }
    if(req.isAuthenticated()) {
        basic(req, res, 'lentDetails', { page: 'lentDetails', auth: true, tbl: tbl, ctx: ctx, delete_msg: msg(req, 'delete', 'Delete successfully', 'Error in deleting stuff'), accept_msg: msg(req, 'accept', 'Accept successfully', 'Error in accepting') });
    }

    });
}

function complain(req, res, next) {
	basic(req, res, 'complain', { info_msg: msg(req, 'info', 'Complaint successfully sent', 'Error in submitting complaint'), pass_msg: msg(req, 'pass', 'Complaint has been received.', 'Error in uploading complaint'),auth: true});
}


/*
function bidding(req, res, next) {
    var ctx  = 0, avg = 0, tbl;
    pool.query(sql_query.query.bidding, [req.user.username], (err, data) => {
        if(err || !data.rows || data.rows.length == 0) {
        ctx = 0;
        tbl = [];
    } else {
        ctx = data.rows.length;
        tbl = data.rows;
    }
    if(req.isAuthenticated()) {
        basic(req, res, 'bidding', { page: 'bidding', auth: true, tbl: tbl, ctx: ctx });
    }
});}
*/
/*
function games(req, res, next) {
	var ctx = 0, avg = 0, tbl;
	pool.query(sql_query.query.avg_rating, [req.user.username], (err, data) => {
		if(err || !data.rows || data.rows.length == 0) {
			avg = 0;
		} else {
			avg = data.rows[0].avg;
		}
		pool.query(sql_query.query.all_games, [req.user.username], (err, data) => {
			if(err || !data.rows || data.rows.length == 0) {
				ctx = 0;
				tbl = [];
			} else {
				ctx = data.rows.length;
				tbl = data.rows;
			}
			basic(req, res, 'games', { ctx: ctx, avg: avg, tbl: tbl, game_msg: msg(req, 'add', 'Game added successfully', 'Game does not exist'), auth: true });
		});
	});
}
function plays(req, res, next) {
	var win = 0, avg = 0, ctx = 0, tbl;
	pool.query(sql_query.query.count_wins, [req.user.username], (err, data) => {
		if(err || !data.rows || data.rows.length == 0) {
			win = 0;
		} else {
			win = data.rows[0].count;
		}
		pool.query(sql_query.query.all_plays, [req.user.username], (err, data) => {
			if(err || !data.rows || data.rows.length == 0) {
				ctx = 0;
				avg = 0;
				tbl = [];
			} else {
				ctx = data.rows.length;
				avg = win == 0 ? 0 : win/ctx;
				tbl = data.rows;
			}
			basic(req, res, 'plays', { win: win, ctx: ctx, avg: avg, tbl: tbl, play_msg: msg(req, 'add', 'Play added successfully', 'Invalid parameter in play'), auth: true });
		});
	});
}
*/
function register(req, res, next) {
	res.render('register', { page: 'register', auth: false });
}
function retrieve(req, res, next) {
	res.render('retrieve', { page: 'retrieve', auth: false });
}


// POST 
function update_info(req, res, next) {
	var username = req.body.username;
	var phone = req.body.phone;
	var region = req.body.region;
	var country = req.body.country;

	console.log(username);
	pool.query(sql_query.query.update_info, [username, phone, region, country], (err, data) => {
		if(err) {
			console.error("Error in update info");
			res.redirect('/update?info=fail');
		} else {
			console.log(region);
			res.redirect('/update?info=pass');
		}
	});
}
function update_pass(req, res, next) {
	var username = req.user.username;
	var password = bcrypt.hashSync(req.body.password, salt);
	pool.query(sql_query.query.update_pass, [username, password], (err, data) => {
		if(err) {
			console.error("Error in update pass");
			res.redirect('/update?pass=fail');
		} else {
			res.redirect('/update?pass=pass');
		}
	});
}
function complain_file(req, res, next) {
	var cid = uuidv1();
	var username = req.user.username;
	var complain = req.body.complain;
	var dateTime = new Date();

	pool.query(sql_query.query.findUid, [username], (err, data) => {
		pool.query(sql_query.query.write_complaints, [cid,complain,dateTime, data.rows[0].uid], (err, data) => {
			if(err) {
				console.error("Error in submitting complain");
				res.redirect('/complain?pass=fail');
			} else {
				res.redirect('/complain?pass=pass');
			}
		});

	});
}

function lend(req, res, next) {
	var sid = uuidv1();
	var name = req.body.stuffname;
	var username = req.user.username;
	var price = req.body.nextMinimumBid;
	var pickUpTime = req.body.pickUpTime;
	var returnTime = req.body.returnTime;
	var pickUpLocation = req.body.pickUpLocation;
	var returnLocation = req.body.returnLocation;
	var description = req.body.description;

	pool.query(sql_query.query.findUid, [username], (err, data) => {
        pool.query(sql_query.query.checkLender, [data.rows[0].uid], (err, data) => {
            if (data.rows[0].num == 0) {
                pool.query(sql_query.query.findUid, [username], (err, data) => {
                    pool.query(sql_query.query.insertToLenders, [data.rows[0].uid], (err, data) => {
                        if (err) {
                            console.error(err);
                            res.redirect('/lentstuff?pass=fail');
                        }
                    });
                });
            }
            pool.query(sql_query.query.insertToStuff, [sid, name, price], (err, data) => {
                if (err) {
                    console.error(err);
                    res.redirect('/lentstuff?pass=fail');
                }else{
                    pool.query(sql_query.query.findUid, [username], (err, data) => {
                        pool.query(sql_query.query.insertToLends, [sid, data.rows[0].uid], (err, data) => {
                             if (err){
                                console.error(err);
                                res.redirect('/lentstuff?pass=fail');
                             }else{
                                pool.query(sql_query.query.findUid, [username], (err, data) => {
                                    pool.query(sql_query.query.insertToDescription, [pickUpTime, returnTime, pickUpLocation, returnLocation, description, data.rows[0].uid, sid], (err, data) => {
                                        if(err) {
                                            console.error(err);
                                            res.redirect('/lentstuff?pass=fail');
                                        } else {
                                            res.redirect('/lentstuff?pass=pass');
                                        }
                                    });
                                });
                             }

                        });
                    });
                }
            });
        });
    });
}

function deleteLent(req, res, next) {
	var sid = req.body.sid;

    pool.query(sql_query.query.delete_lent, [sid], (err, data) => {
        if(err) {
            console.error(err);
            res.redirect('/lentDetail?delete=fail');
        } else {
            res.redirect('/lentstuff');
        }
    });
}

function bids(req, res, next) {
	var username = req.user.username;
    var sid = req.query.stuff;
	var bids = req.body.bidValue;

	pool.query(sql_query.query.findUid, [username], (err, data) => {
		pool.query(sql_query.query.bid_action, [data.rows[0].uid, sid, bids], (err, data) => {
			if(err) {
				console.error("Error in submitting bids");
				res.redirect('/discover?pass=fail');
			} else {
				res.redirect('/myself?pass=pass');
			}
		});

	});
}


/*
function add_game(req, res, next) {
	var username = req.user.username;
	var gamename = req.body.gamename;

	pool.query(sql_query.query.add_game, [username, gamename], (err, data) => {
		if(err) {
			console.error("Error in adding game");
			res.redirect('/games?add=fail');
		} else {
			res.redirect('/games?add=pass');
		}
	});
}
function add_play(req, res, next) {
	var username = req.user.username;
	var player1  = req.body.player1;
	var player2  = req.body.player2;
	var gamename = req.body.gamename;
	var winner   = req.body.winner;
	if(username != player1 || player1 == player2 || (winner != player1 && winner != player2)) {
		res.redirect('/plays?add=fail');
	}
	pool.query(sql_query.query.add_play, [player1, player2, gamename, winner], (err, data) => {
		if(err) {
			console.error("Error in adding play");
			res.redirect('/plays?add=fail');
		} else {
			res.redirect('/plays?add=pass');
		}
	});
}
*/
function reg_user(req, res, next) {

	var uid = uuidv1();
	var username  = req.body.username;
	var password  = bcrypt.hashSync(req.body.password, salt);
	var phone = req.body.phone;
	var region = req.body.region;
	var country  = req.body.country;

	pool.query(sql_query.query.add_user, [uid,username,password,phone,region,country], (err, data) => {
		if(err) {
			console.error("Error in adding user", err);
			res.redirect('/register?reg=fail');
		} else {
			console.log('added user ',username, uid);
			req.login({
				username    : username,
				passwordHash: password,
				phone   : phone,
				region    : region,
				country      : country
			}, function(err) {
				if(err) {
					return res.redirect('/register?reg=fail');
				} else {
					return res.redirect('/dashboard');
				}
			});
		}
	});
}


// LOGOUT
function logout(req, res, next) {
	req.session.destroy()
	req.logout()
	res.redirect('/')
}

module.exports = initRouter;
