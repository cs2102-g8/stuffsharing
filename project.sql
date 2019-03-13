drop table if exists Users cascade;
drop table if exists Borrowers cascade;
drop table if exists Lenders cascade;
drop table if exists Stuff cascade;
drop table if exists Bids cascade;
drop table if exists Lends cascade;
drop table if exists Description cascade;
drop table if exists Borrows cascade;
drop table if exists Feedback cascade;
drop table if exists Requests cascade;
drop table if exists ResponseToRequest cascade;
drop table if exists Complain cascade;
drop table if exists Area cascade;
drop table if exists UserGroup cascade;
drop table if exists Category cascade;
drop table if exists Belongs cascade;

create table Area(
	city varchar(100),
	country varchar(100),
	primary key(city, country)
);

create table Users(
	uid integer primary key,
	name varchar(100) not null unique,
	phone 				Integer,
	address 			varchar(60) not null,
	city varchar(100),
	country varchar(100),
	foreign key(city, country) references Area(city, country)
);

create table Borrowers(
	uid integer references Users,
	primary key(uid)
);

create table Lenders(
	uid integer references Users,
	primary key(uid)
);

create table Stuff(
	sid integer primary key,
	price float8 not null
);

create table Bids(
	uid integer not null references Borrowers on delete cascade,
	sid integer not null references Stuff on delete cascade,
	bid integer not null,
	primary key(uid, sid)
);

create table Lends(
	uid integer not null references Lenders on delete cascade,
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
	uid integer,
	foreign key (sid, uid) references Lends(sid, uid) on delete cascade,
	primary key (sid, uid, updateTime)
);

create table Borrows(
	uid integer references Borrowers on delete cascade,
	sid integer references Stuff on delete cascade,
	primary key (sid, uid)
);

create table Feedback(
	feedback varchar(1000) not null,
	updateTime varchar(100) not null,
	sid integer,
	uid integer,
	rating integer,
	foreign key (sid, uid) references Borrows(sid, uid) on delete cascade,
	primary key (sid, uid, updateTime),
	check (rating <= 5 and rating >= 0)
);

create table Requests(
	title varchar(100) not null,
	uid integer references Borrowers on delete cascade,
	primary key (uid, title)
);

create table ResponseToRequest(
	uid1 integer references Lenders(uid),
	uid2 integer not null,
	title varchar(100) not null,
	foreign key (uid2, title) references Requests(uid, title)
	on delete cascade on update cascade,
	primary key (uid1, uid2, title)
);

create table Complain(
	cid					integer,
	complain			varchar(1000) not null,
	complainee			Integer not null,
	dates				integer,
	PRIMARY KEY (cid),
	FOREIGN KEY (complainee) REFERENCES Users
);

create table UserGroup(
	gid					integer,
	uid					integer,
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
