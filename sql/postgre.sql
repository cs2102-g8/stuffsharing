create table Area(
	city varchar(100),
	country varchar(100),
	primary key(city, country)
);

create table Users(
	uid varchar(100) primary key, 
	username varchar(100) not null unique,
	phone 				Integer,
	address 			varchar(60) not null,
	city varchar(100),
	country varchar(100),
	password   varchar(64) NOT NULL,
	foreign key(city, country) references Area(city, country)
);

create table Borrowers(
	uid varchar(100) references Users,
	primary key(uid)
);

create table Lenders(
	uid varchar(100) references Users,
	primary key(uid)
);

create table Stuff(
	sid integer primary key,
	price float8 not null
);

create table Bids(
	uid varchar(100) not null references Borrowers on delete cascade,
	sid integer not null references Stuff on delete cascade,
	bid integer not null,
	primary key(uid, sid)
);

create table Lends(
	uid varchar(100) not null references Lenders on delete cascade,
	sid integer not null references Stuff on delete cascade,
	primary key(uid, sid)
);

create table Description(
	updateTime varchar(20) not null,
	timeToPickUp varchar(20) not null,
	timeToReturn varchar(20) not null,
	whereToPickUp varchar(100) not null,
	whereToReturn varchar(100) not null,
	introduction varchar(1000) not null,
	sid integer,
	uid varchar(100),
	foreign key (sid, uid) references Lends(sid, uid) on delete cascade,
	primary key (sid, uid, updateTime)
);

create table Borrows(
	uid varchar(100) references Borrowers on delete cascade,
	sid integer references Stuff on delete cascade,
	primary key (sid, uid)
);

create table Feedback(
	feedback varchar(1000) not null,
	updateTime varchar(100) not null,
	sid integer,
	uid varchar(100),
	rating integer,
	foreign key (sid, uid) references Borrows(sid, uid) on delete cascade,
	primary key (sid, uid, updateTime),
	check (rating <= 5 and rating >= 0)
);

create table Requests(
	title varchar(100) not null,
	uid varchar(100) references Borrowers on delete cascade,
	primary key (uid, title)
);

create table ResponseToRequest(
	uid1 varchar(100) references Lenders(uid),
	uid2 varchar(100) not null,
	title varchar(100) not null,
	foreign key (uid2, title) references Requests(uid, title)
	on delete cascade on update cascade,
	primary key (uid1, uid2, title)
);

create table Complain(
	cid					varchar(100),
	complain			varchar(1000) not null,
	complainee			varchar(100) not null,
	dates				integer,
	PRIMARY KEY (cid),
	FOREIGN KEY (complainee) REFERENCES Users
);

create table UserGroup(
	gid					integer,
	uid					varchar(100),
	gname			varchar(100),
	primary key (gid, uid),
	foreign key (uid) references Users
);

create table Category(
	catname				varchar(100),
	primary key (catname)
);

create table Belongs(
	sid					integer,
	catname				varchar(100),
	primary key (sid, catname),
	foreign key (sid) references Stuff,
	foreign key (catname) references Category
);

