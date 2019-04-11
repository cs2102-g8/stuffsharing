# Stuff Sharing

An application which allows people to put up their items for others to bid for to borrow, and vice versa.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* [PostgreSQL](https://www.postgresql.org/) (Preconfigured)
* [NodeJS](https://nodejs.org/en/) (Preinstalled)

### Installing

First, execute the SQL script located at ```stuffsharing/sql/postgre.sql```.\
This can be done by opening ```psql``` and running the following command inside the ```stuffsharing``` folder:
```
\i sql/postgre.sql
```
This will create the database tables and populate them with dummy data.\

Next, open a terminal in the ```stuffsharing``` folder and run the following command:
```
npm install
```
This will install all dependencies that are required for the application to run.

Next, create a file ```.env``` in the ```stuffsharing``` folder and include the following information:
```
DATABASE_URL=postgres://username:password@localhost:5432/database_name
```
Replace the fields ```username```, ```password``` and ```database_name``` with your preconfigured PostgreSQL settings.

We are now ready to run the application on our local server!
Run the following command in the terminal:
```
npm start
```
This will start the local server.

Visit ```localhost:3000``` on any web browser to access the application!

## Built With

* [NodeJS](https://nodejs.org/en/) - JavaScript runtime
* [Express](https://expressjs.com/) - Web Application Framework
* [Passport](http://www.passportjs.org/) - Authentication Middleware

## Authors

* **Jiang Chen** - [jcjxwy](https://github.com/jcjxwy)
* **Lee Yi Wei, Joel** - [lywjoel](https://github.com/lywjoel)
* **Lou Shaw Yeong** - [xiaoyeong](https://github.com/PurpleBooth)
* **Ooi Hui Ying** - [ooihuiying](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/cs2102-g8/stuffsharing/graphs/contributors) for this project.

## Acknowledgments

* Prof Chee Yong and Adi Yoga for their guidance and sample repository
