drop table if exists Users cascade;
drop table if exists Areas cascade;
drop table if exists Earns cascade;
drop table if exists Badges cascade;
drop table if exists Feedbacks cascade;
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
	region varchar(100),
	country varchar(100),
	primary key (region, country)
);

create table Users(
	uid varchar(100),
	username varchar(100) unique not null,
	password varchar(64) not null,
	phone integer not null,
	region varchar(100),
	country varchar(100),
	primary key (uid),
	foreign key (region, country) references Areas(region, country)
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

create table Feedbacks (
	fid	varchar(100),
	feedback varchar(1000) not null,
	dateTime timestamp not null,
	uid varchar(100),
	primary key(fid),
	foreign key (uid) references Users(uid)
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
	foreign key (uid, sid) references Lends(uid, sid) on delete cascade,
	check (pickUpTime < returnTime)
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
	foreign key (sid) references Stuffs(sid) on delete cascade,
	foreign key (categoryName) references Categories(categoryName) on delete cascade
);


create or replace function bidCheck() returns trigger as $$
declare amount money;
begin
    select nextMinimumBid into amount
    from Stuffs
    where new.sid = Stuffs.sid;
    if new.bid > amount then
    	update Stuffs set nextMinimumBid = new.bid where new.sid = Stuffs.sid;
    	if exists (select 1 from Bids where new.sid = Bids.sid and new.uid = Bids.uid) then
    		update Bids set bid = new.bid where new.sid = Bids.sid and new.uid = Bids.uid;
    		return null;
    	else
    		return new;
    	end if;
    else
    	raise exception 'Input less than next minimum bid';
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

create or replace function addUserCheck() returns trigger as $$
begin
	insert into Borrowers(uid) values (new.uid);
	insert into Lenders(uid) values (new.uid);
	return null;
end;
$$ language plpgsql;

create trigger addUserTrigger
after insert on Users
for each row
execute procedure addUserCheck();


create or replace function lendsCheck() returns trigger as $$
declare count numeric;
declare count2 numeric;
begin
	select count(*) into count
    from Lends
    where new.uid = Lends.uid;

   	select count(*) into count2
   	from Earns
   	where new.uid=Earns.uid and Earns.badgeName='Credit Badge';

    if count > 5 and count2 < 1 then
        insert into Earns(uid, badgeName) values (new.uid, 'Credit Badge');
    end if;
    return new;
end;
$$ language plpgsql;

create trigger addBadgesTrigger
after insert on Lends
for each row
execute procedure lendsCheck();



insert into Areas values('Central', 'Singapore');
insert into Areas values('East', 'Singapore');
insert into Areas values('North', 'Singapore');
insert into Areas values('North-East', 'Singapore');
insert into Areas values('West', 'Singapore');

insert into Users(uid, username, password, phone, region, country) values ('A10001', 'Alice', 'a10001', 87654321, 'Central', 'Singapore');
insert into Users(uid, username, password, phone, region, country) values ('B20002', 'Bob', 'b20002', 81326754, 'Central', 'Singapore');
insert into Users(uid, username, password, phone, region, country) values ('C30003', 'Chara', 'c30003', 81453267, 'East', 'Singapore');
insert into Users(uid, username, password, phone, region, country) values ('D40004', 'Dandy', 'd40004', 85643521, 'East', 'Singapore');
insert into Users(uid, username, password, phone, region, country) values ('E50005', 'Emily', 'e50005', 83562145, 'North', 'Singapore');
insert into Users(uid, username, password, phone, region, country) values ('F60006', 'Fork', 'f60006', 89543456, 'North', 'Singapore');
insert into Users(uid, username, password, phone, region, country) values ('G70007', 'Gery', 'g70007', 86385748, 'North-East', 'Singapore');
insert into Users(uid, username, password, phone, region, country) values ('H80008', 'Henry', 'h80008', 88473628, 'North-East', 'Singapore');
insert into Users(uid, username, password, phone, region, country) values ('I90009', 'Io', 'i90009', 89457342, 'West', 'Singapore');
insert into Users(uid, username, password, phone, region, country) values ('J00000', 'Jack', 'j00000', 84387595, 'West', 'Singapore');

insert into Badges(badgeName) values ('Credit Badge');
insert into Badges(badgeName) values ('Friendly Badge');
insert into Badges(badgeName) values ('Helpful Badge');
insert into Badges(badgeName) values ('Resourceful Badge');
insert into Badges(badgeName) values ('Experienced Badge');

insert into Earns(uid, badgeName) values ('A10001', 'Helpful Badge');
insert into Earns(uid, badgeName) values ('A10001', 'Friendly Badge');
insert into Earns(uid, badgeName) values ('A10001', 'Experienced Badge');
insert into Earns(uid, badgeName) values ('B20002', 'Helpful Badge');
insert into Earns(uid, badgeName) values ('C30003', 'Resourceful Badge');
insert into Earns(uid, badgeName) values ('C30003', 'Experienced Badge');
insert into Earns(uid, badgeName) values ('J00000', 'Credit Badge');

insert into Feedbacks(fid, feedback, dateTime, uid) values (0, 'Lousy website', '20190101 10:00:00 AM', 'A10001');
insert into Feedbacks(fid, feedback, dateTime, uid) values (1, 'Rubbish', '20180102 08:00:00 PM', 'B20002');
insert into Feedbacks(fid, feedback, dateTime, uid) values (2, 'Please work harder', '20180908 10:50:33 AM', 'C30003');
insert into Feedbacks(fid, feedback, dateTime, uid) values (3, 'HAHA', '20190304 01:22:33 PM', 'D40004');
insert into Feedbacks(fid, feedback, dateTime, uid) values (4, 'I can do better than you', '20181202 03:04:05 AM', 'E50005');

insert into Stuffs(sid, stuffName, nextMinimumBid) values ('00', 'Old Textbook', 0);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('01', 'Formal attire', 50);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('02', 'Mouse', 15);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('03', 'Harry Poter Fictions', 10);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('04', 'iPad', 100);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('05', 'Headphone', 50);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('06', 'Key Board', 30);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('07', 'Old Clothes', 30);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('08', 'Backpack', 35);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('09', 'Laptop', 200);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('10', 'Box', 10);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('11', 'Bike', 100);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('12', 'Cup', 10);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('13', 'Water Bottle', 0);
insert into Stuffs(sid, stuffName, nextMinimumBid) values ('14', 'Mouse', 10);

insert into Bids(uid, sid, bid) values ('A10001', '00', 1);
insert into Bids(uid, sid, bid) values ('B20002', '01', 60);
insert into Bids(uid, sid, bid) values ('C30003', '01', 70);
insert into Bids(uid, sid, bid) values ('A10001', '03', 15);
insert into Bids(uid, sid, bid) values ('E50005', '04', 200);
insert into Bids(uid, sid, bid) values ('E50005', '09', 205);
insert into Bids(uid, sid, bid) values ('F60006', '05', 60);
insert into Bids(uid, sid, bid) values ('F60006', '03', 80);
insert into Bids(uid, sid, bid) values ('F60006', '10', 15);
insert into Bids(uid, sid, bid) values ('G70007', '06', 35);
insert into Bids(uid, sid, bid) values ('G70007', '07', 50);
insert into Bids(uid, sid, bid) values ('G70007', '08', 40);
insert into Bids(uid, sid, bid) values ('H80008', '09', 300);
insert into Bids(uid, sid, bid) values ('I90009', '10', 20);
insert into Bids(uid, sid, bid) values ('I90009', '12', 20);
insert into Bids(uid, sid, bid) values ('J00000', '11', 120);

insert into Borrows(uid, sid) values ('A10001', '00');
insert into Borrows(uid, sid) values ('C30003', '01');
insert into Borrows(uid, sid) values ('E50005', '04');
insert into Borrows(uid, sid) values ('F60006', '05');
insert into Borrows(uid, sid) values ('F60006', '03');
insert into Borrows(uid, sid) values ('F60006', '10');
insert into Borrows(uid, sid) values ('G70007', '06');
insert into Borrows(uid, sid) values ('G70007', '07');
insert into Borrows(uid, sid) values ('G70007', '08');
insert into Borrows(uid, sid) values ('H80008', '09');
insert into Borrows(uid, sid) values ('I90009', '12');
insert into Borrows(uid, sid) values ('J00000', '11');

insert into Lends(uid, sid) values ('A10001', '14');
insert into Lends(uid, sid) values ('A10001', '13');
insert into Lends(uid, sid) values ('A10001', '12');
insert into Lends(uid, sid) values ('A10001', '11');
insert into Lends(uid, sid) values ('A10001', '10');
insert into Lends(uid, sid) values ('B20002', '09');
insert into Lends(uid, sid) values ('B20002', '08');
insert into Lends(uid, sid) values ('B20002', '07');
insert into Lends(uid, sid) values ('C30003', '06');
insert into Lends(uid, sid) values ('C30003', '05');
insert into Lends(uid, sid) values ('E50005', '04');
insert into Lends(uid, sid) values ('F60006', '03');
insert into Lends(uid, sid) values ('H80008', '02');
insert into Lends(uid, sid) values ('J00000', '01');
insert into Lends(uid, sid) values ('J00000', '00');

insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180404 10:00:00 AM', '20180505 10:00:00 AM', 'Central', 'Central', 'My CS2102 Textbook. It will help you a lot!', 'J00000', '00');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180711 08:00:00 PM', '20180719 09:00:00 PM', 'East', 'Central', 'Formal attire for interview.', 'J00000', '01');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180909 05:00:00 PM', '20181005 06:00:00 PM', 'Central', 'Central', 'This mouse is quite new and working fine.', 'H80008', '02');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20181111 10:03:00 AM', '20181212 10:20:00 AM', 'East', 'North', 'Interesting fantasy fictions.', 'F60006', '03');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20190101 11:00:00 AM', '20190202 11:03:00 AM', 'North-East', 'North', 'A second-hand iPad. Enjoy it.', 'E50005', '04');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180409 10:00:00 AM', '20180805 05:00:00 PM', 'Central', 'East', 'A not-so-new headphone. You can use it to listen music.', 'C30003', '05');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180608 10:40:00 AM', '20180808 10:00:00 AM', 'Central', 'East', 'A not-so-old key board. Can still be used to play games.', 'C30003', '06');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180101 10:00:00 AM', '20180111 08:00:00 PM', 'West', 'West', 'My old clothes. Borrow it if you like.', 'B20002', '07');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180911 11:00:00 AM', '20181010 07:00:00 PM', 'West', 'West', 'My old backpack. Borrow it if you like.', 'B20002', '08');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180330 10:00:00 AM', '20180411 08:00:00 PM', 'West', 'West', 'My old laptop. Borrow it if you like.', 'B20002', '09');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180606 07:00:00 AM', '20180707 11:00:00 AM', 'Central', 'Central', 'What a fantastic box. I picked it on my way to school.', 'A10001', '10');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20181111 07:00:00 AM', '20181212 11:00:00 AM', 'Central', 'Central', 'This bike was left outside my house. It is very new!', 'A10001', '11');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20181010 07:00:00 AM', '20181111 11:00:00 AM', 'Central', 'Central', 'Someone left this cup in my classroom. What a pity!', 'A10001', '12');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20180222 07:00:00 AM', '20180322 11:00:00 AM', 'Central', 'Central', 'I found this water bottle from the lost and found box. Lucky!', 'A10001', '13');
insert into Descriptions(pickupTime, returnTime, pickupLocation, returnLocation, summary, uid, sid) values (
'20181001 07:00:00 AM', '20181221 11:00:00 AM', 'Central', 'Central', 'I borrowed this mouse from my classmate. It is very new and expensive.', 'A10001', '14');

insert into Comments(comment, updateTime, uid, sid, rating) values ('I drew something on your book. Hope you like it.', '20180505 10:00:00 AM', 'A10001', '00', 5);
insert into Comments(comment, updateTime, uid, sid, rating) values ('Oh I failed my interview. It is your fault!', '20180719 09:00:00 PM', 'C30003', '01', 1);
insert into Comments(comment, updateTime, uid, sid, rating) values ('Intersting books. But the quality of paper was not very good.', '20181212 10:20:00 AM', 'F60006', '03', 3);
insert into Comments(comment, updateTime, uid, sid, rating) values ('Nice iPad. It was very new.', '20190202 11:03:00 AM', 'E50005', '04', 5);
insert into Comments(comment, updateTime, uid, sid, rating) values ('The quality of headphone was very bad. It hurted my ears.', '20180805 05:00:00 PM', 'F60006', '05', 2);
insert into Comments(comment, updateTime, uid, sid, rating) values ('Although it was a bit old but I am quite satisfied with its quality.', '20180808 10:00:00 AM', 'G70007', '06', 4);
insert into Comments(comment, updateTime, uid, sid, rating) values ('Although it was a bit old but I am quite satisfied with its quality.', '20180111 08:00:00 PM', 'G70007', '07', 4);
insert into Comments(comment, updateTime, uid, sid, rating) values ('Although it was a bit old but I am quite satisfied with its quality.', '20181010 07:00:00 PM', 'G70007', '08', 4);
insert into Comments(comment, updateTime, uid, sid, rating) values ('Why are you so angry? Although the screen is broken, it can still be used, right?', '20181010 07:00:00 PM', 'H80008', '09', 1);
insert into Comments(comment, updateTime, uid, sid, rating) values ('The box was very bad. But your attitude was very good.', '20180707 11:00:00 AM', 'F60006', '10', 4);
insert into Comments(comment, updateTime, uid, sid, rating) values ('This is my bike! How dare you are!', '20181212 11:00:00 AM', 'J00000', '11', 1);
insert into Comments(comment, updateTime, uid, sid, rating) values ('I think this cup does not belong to you.', '20181111 11:00:00 AM', 'I90009', '12', 1);

insert into Categories(categoryName) values ('Electronics');
insert into Categories(categoryName) values ('Clothing');
insert into Categories(categoryName) values ('Books');
insert into Categories(categoryName) values ('Furnitures');
insert into Categories(categoryName) values ('Outdoor Gears');
insert into Categories(categoryName) values ('Kitchen Wares');
insert into Categories(categoryName) values ('Others');

insert into Belongs(sid, categoryName) values ('00', 'Books');
insert into Belongs(sid, categoryName) values ('01', 'Clothing');
insert into Belongs(sid, categoryName) values ('02', 'Electronics');
insert into Belongs(sid, categoryName) values ('03', 'Books');
insert into Belongs(sid, categoryName) values ('04', 'Electronics');
insert into Belongs(sid, categoryName) values ('05', 'Electronics');
insert into Belongs(sid, categoryName) values ('06', 'Electronics');
insert into Belongs(sid, categoryName) values ('07', 'Clothing');
insert into Belongs(sid, categoryName) values ('08', 'Others');
insert into Belongs(sid, categoryName) values ('09', 'Electronics');
insert into Belongs(sid, categoryName) values ('10', 'Others');
insert into Belongs(sid, categoryName) values ('11', 'Others');
insert into Belongs(sid, categoryName) values ('12', 'Others');
insert into Belongs(sid, categoryName) values ('13', 'Others');
insert into Belongs(sid, categoryName) values ('14', 'Electronics');