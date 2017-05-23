const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {
    Product
} = require('../models');
const {
    app,
    runServer,
    closeServer
} = require('../server');
const {
    DATABASE_URL
} = require('../config');

chai.use(chaiHttp);

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedBlogPostData() {
    console.info('seeding blog post data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateBlogPostData());
    }
    // this will return a promise
    return Product.insertMany(seedData);
}

// used to generate data to put in db
function generateTitle() {
    const titles = [
        'Fashion', 'Sports', 'Weather', 'Politics', 'Travel'];
    return titles[Math.floor(Math.random() * titles.length)];
}

// used to generate data to put in db
function generateContent() {
    const content = ['This was a great week for this topic!', 'An apple a day keeps the doctor away!', 'Where do you expect us to go when the bombs fall?'];
    return content[Math.floor(Math.random() * content.length)];
}

// used to generate data to put in db
function generateAuthor() {
    const authorsArray = ['John Doe', 'Bill Smith', 'Cameron Mager', 'Andrew Miller', 'Kaylee Nolan'];
    const author = authorsArray[Math.floor(Math.random() * authorsArray.length)];
    return author;
}

// generate an object represnting a blog post.
// can be used to generate seed data for db
// or request.body data
function generateBlogPostData() {
    return {
        title: generateTitle(),
        content: generateContent(),
        author: generateAuthor()
    }
}

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Restaurants API resource', function () {

    // we need each of these hook functions to return a promise
    // otherwise we'd need to call a `done` callback. `runServer`,
    // `seedRestaurantData` and `tearDownDb` each return a promise,
    // so we return the value returned by these function calls.
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {});

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    })

    describe('GET endpoint', function () {

        it('GET should return all favorites', function (done) {
            chai.request(app)
                .get('/favorite-products')
                .end(function (err, res) {
                    should.equal(err, null);
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('array');
                    done();
                });
        });
    });

    describe('POST endpoint', function () {
        // strategy: make a POST request with data,
        // then prove that the blog post we get back has
        // right keys, and that `id` is there (which means
        // the data was inserted into db)


        it('should add a new favorite', function (done) {
            chai.request(app)
                .post('/favorite-product')
                .send({
                    'name': 'iPad Case'
                })
                .end(function (err, res) {
                    should.equal(err, null);
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('_id');
                    res.body._id.should.be.a('string');
                    done();
                });
        });
    });

    describe('DELETE endpoint', function () {
        // strategy:
        //  1. get a blog post
        //  2. make a DELETE request for that blog post's id
        //  3. assert that response has right status code
        //  4. prove that blog post with the id doesn't exist in db anymore

        it('should delete ALL items on DELETE', function (done) {
            chai.request(app)
                .delete('/delete-favorites')
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });

    });
});

//////
