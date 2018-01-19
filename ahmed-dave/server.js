'use strict';

const fs = require('fs');
//NOTE: my pg module was throwing errors in /lib/client.js on lines 123 & 150 - callback was never passed as a parameter to the functions, so I commented out those if blocks in my library. I am running pg 7.4.1 and node 9.4.0-1.
const pg = require('pg');
const express = require('express');

const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

const client = new pg.Client({user: 'postgres', password: '12345', database: 'kilovolt'});

// REVIEW: Use the client object to connect to our DB.
// Note that for my installation, no string is required below, but the configuration object above *is* required.
client.connect(/*'postgres://postgres:12345@localhost:5432/kilovolt'*/);


// REVIEW: Install the middleware plugins so that our app can use the body-parser module.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // This is 5. More specifically, it's saying that when GET for the /new URI from client, we will give a response that includes new.html 
  // no method in article.js makes a request for /new - this is only applicable when the user navigates to /new. This really wouldn't be a CRUD operation
  // unless you want to consider it 'updating' the page being served to the user.
  response.sendFile('new.html', {root: './public'});
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // This is a 3,4,5 - when GET request from client for /articles URI, go to the DB, query some stuff, get stuff back,  then send that stuff to the client.
  // the fetchAll method is initiating the GET request. This is doing a READ, then (from the browser's perspective, an update)
  client.query('SELECT * FROM articles')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // This is 3,5 - when POST from client, query DB and insert stuff, then send 'did it' response to client. The POST is being sent by insertRecord
  // This is doing a CREATE operation
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // This 3,5 as well - when PUT request from client, query DB and update some stuff, then send back 'did it' to client. The PUT req is made
  // (handily enough) by the updateRecord method. This is an UPDATE operation.
  client.query(
    `UPDATE articles
    SET
      title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6
    WHERE article_id=$7;
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // this is a 3,5 - when  DELETE req from client, query the DB and delete some stuff, then send back 'did it' to client. The DELETE req is made by
  // (you guessed it) the deleteRecord method. This is a DELETE/DESTROY operation.
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // As above, this is a 3,5 - when DELETE req from client, query the DB and delete all the articles records, then send back 'did it'. This DELETE req
  // is made by the truncateTable method, and is a DELETE/DESTROY operation.
  client.query(
    'DELETE FROM articles;'
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENT: What is this function invocation doing?
// PUT YOUR RESPONSE HERE
// This is invoking the loadDB() function defined (and explained) below.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // This is doing a 3,4. It's querying the DB and gets a response - if that response indicates that there is nothing in the articles table, then it's using the fs module to (probably) open hackerIpsum.json as an ifstream, then cin or getline that stream and return it as some data type that we're then turning into a string (that we know is json) which is then being parsed into an array of objects, when are then being thrown into the DB. This isn't interacting with article.js. Rather, the fetchAll is interacting with the DB which is being loaded (if necessary) by this function. This is a CREATE.
  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
    // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if(!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
          JSON.parse(fd.toString()).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `,
              [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
            )
          })
        })
      }
    })
}

function loadDB() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // This is a 3, and also a 4 by virtue of calling loadArticles. Like loadArticles, it also does not interact with article.js. This is purely a DB function - the DB interaction is done with things like fetchAll, truncateTable, deleteRecord, updateRecord, etc. This is a CREATE op.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
  )
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}
