drop table if exists Users cascade;
drop table if exists Areas cascade;
drop table if exists Earns cascade;
drop table if exists Badges cascade;
drop table if exists Complaints cascade;
drop table if exists Complains cascade;
drop table if exists Borrowers cascade;
drop table if exists Lenders cascade;
drop table if exists Stuffs cascade;
drop table if exists Bids cascade;
drop table if exists Borrows cascade;
drop table if exists Lends cascade;
drop table if exists Descriptions cascade;
drop table if exists Comments cascade;
drop table if exists Categories cascade;
drop table if exists Belongs cascade;

create table Areas(
	city varchar(100),
	country varchar(100),
	primary key (city, country)
);

create table Users(
	uid varchar(100), 
	username varchar(100) unique not null,
	password varchar(64) not null,
	phone integer not null,
	city varchar(100),
	country varchar(100),
	primary key (uid),
	foreign key (city, country) references Areas(city, country)
);

create table Badges(
	badgeName varchar(30),
	primary key (badgeName)
);

create table Earns(
	uid varchar(100),
	badgeName varchar(30),
	foreign key (uid) references Users(uid),
	foreign key (badgeName) references Badges(badgeName)
);

create table Complaints(
	cid	varchar(100),
	complaint varchar(1000) not null,
	dateTime timestamp not null,
	primary key (cid)
);

create table Complains(
	uid varchar(100),
	cid varchar(100),
	foreign key (uid) references Users(uid),
	foreign key (cid) references Complaints(cid)
);

create table Borrowers(
	uid varchar(100) references Users(uid),
	primary key (uid)
);

create table Lenders(
	uid varchar(100) references Users(uid),
	primary key (uid)
);

create table Stuffs(
	sid varchar(100),
	stuffName varchar(100),
	nextMinimumBid money not null,
	primary key (sid)
);

create table Bids(
	uid varchar(100) not null,
	sid varchar(100) not null,
	bid money not null,
	primary key (uid, sid),
	foreign key (uid) references Borrowers(uid) on delete cascade,
	foreign key (sid) references Stuffs(sid) on delete cascade
);

create table Borrows(
	uid varchar(100),
	sid varchar(100),
	primary key (uid, sid),
	foreign key (uid) references Borrowers(uid) on delete cascade,
	foreign key (sid) references Stuffs(sid) on delete cascade
);

create table Lends(
	uid varchar(100) not null,
	sid varchar(100) not null,
	primary key (uid, sid),
	foreign key (uid) references Lenders(uid) on delete cascade,
	foreign key (sid) references Stuffs(sid) on delete cascade
);

create table Descriptions(
	pickUpTime timestamp not null,
	returnTime timestamp not null,
	pickUpLocation varchar(100) not null,
	returnLocation varchar(100) not null,
	summary varchar(1000) not null,
	uid varchar(100),
	sid varchar(100),
	primary key (uid, sid),
	foreign key (uid, sid) references Lends(uid, sid) on delete cascade
);

create table Comments(
	comment varchar(1000) not null,
	updateTime timestamp not null,
	uid varchar(100),
	sid varchar(100),
	rating integer,
	check (rating <= 5 and rating >= 0),
	primary key (uid, sid, updateTime),
	foreign key (uid, sid) references Borrows(uid, sid) on delete cascade
);

create table Categories(
	categoryName varchar(100),
	primary key (categoryName)
);

create table Belongs(
	sid varchar(100),
	categoryName varchar(100),
	primary key (sid, categoryName),
	foreign key (sid) references Stuffs(sid),
	foreign key (categoryName) references Categories(categoryName)
);

create or replace function bidCheck() returns trigger as $$
declare amount money;
	begin
		select nextMinimumBid into amount
		from Stuffs
		where new.sid = Stuffs.sid;
		if new.bid > amount then
			return new;
		else
			return null;
		end if;
	end;
$$ language plpgsql;

create trigger bidTrigger
before insert on Bids
for each row
execute procedure bidCheck();

create or replace function borrowCheck() returns trigger as $$
declare count numeric;
	begin
		select count(*) into count
		from Borrows
		where new.uid = Borrows.uid;
		if count > 10 then
			return null;
		else
			return new;
		end if;
	end;
$$ language plpgsql;

create trigger borrowTrigger
before insert on Borrows
for each row
execute procedure borrowCheck();

create or replace function descriptionCheck() returns trigger as $$
	begin
		if new.pickUpTime >= new.returnTime then
			return null;
		else
			delete from Borrows
			where new.uid = Borrows.uid and new.sid = Borrows.sid;
			return new;
		end if;
	end;
$$ language plpgsql;

create trigger descriptionTrigger
before insert on Descriptions
for each row
execute procedure descriptionCheck();