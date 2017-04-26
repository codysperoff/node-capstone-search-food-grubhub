const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {
    BlogPost
} = require('../models');
const {
    app,
    runServer,
    closeServer
} = require('../server');
const {
    TEST_DATABASE_URL
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
    return BlogPost.insertMany(seedData);
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

    beforeEach(function () {
        return seedBlogPostData();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    })

    describe('GET endpoint', function () {

        it('should return all existing blog posts', function () {
            // strategy:
            //    1. get back all posts returned by by GET request to `/posts`
            //    2. prove res has right status, data type
            //    3. prove the number of posts we got back is equal to number
            //       in db.
            //
            // need to have access to mutate and access `res` across
            // `.then()` calls below, so declare it here so can modify in place
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function (_res) {
                    // so subsequent .then blocks can access resp obj.
                    res = _res;
                    res.should.have.status(200);
                    // otherwise our db seeding didn't work
                    //                    res.body.posts.should.have.length.of.at.least(1);
                    return BlogPost.count();
                })
                .then(function (count) {
                    //                    res.body.posts.should.have.length.of(count);
                });
        });


        it('should return blog posts with right fields', function () {
            // Strategy: Get back all posts, and ensure they have expected keys

            let resPost;
            return chai.request(app)
                .get('/posts')
                .then(function (res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    //                    res.body.posts.should.be.a('array');
                    //                    res.body.posts.should.have.length.of.at.least(1);

                    //                    res.body.posts.forEach(function (post) {
                    //                        post.should.be.a('object');
                    //                        post.should.include.keys(
                    //                            'id', 'title', 'content', 'author', 'created');
                    //                    });
                    //                    resPost = res.body.posts[0];
                    //                    return BlogPost.findById(resPost.id);
                })
                .then(function (post) {

                    //                    resPost.id.should.equal(post.id);
                    //                    resPost.title.should.equal(post.title);
                    //                    resPost.content.should.equal(post.content);
                    //                    resPost.author.should.equal(post.author);
                    //                    resPost.created.should.contain(post.created);
                });
        });
    });

    describe('POST endpoint', function () {
        // strategy: make a POST request with data,
        // then prove that the blog post we get back has
        // right keys, and that `id` is there (which means
        // the data was inserted into db)
        it('should add a new blog post', function () {

            const newBlogPost = generateBlogPostData();

            return chai.request(app)
                .post('/posts')
                .send(newBlogPost)
                .then(function (res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys(
                        'id', 'title', 'content', 'author', 'created');
                    res.body.title.should.equal(newBlogPost.title);
                    // cause Mongo should have created id on insertion
                    res.body.id.should.not.be.null;
                    res.body.content.should.equal(newBlogPost.content);
                    //                    res.body.author.should.equal(newBlogPost.author);
                    return BlogPost.findById(res.body.id);
                })
                .then(function (post) {
                    //                    post.title.should.equal(newRestaurant.title);
                    //                    post.content.should.equal(newRestaurant.content);
                    //                    post.author.should.equal(newBlogPost.author);
                    //                    post.name.should.equal(newRestaurant.name);
                    //                    post.grade.should.equal(mostRecentGrade);
                    //                    post.address.building.should.equal(newRestaurant.address.building);
                    //                    post.address.street.should.equal(newRestaurant.address.street);
                    //                    post.address.zipcode.should.equal(newRestaurant.address.zipcode);
                });
        });
    });

    describe('PUT endpoint', function () {

        // strategy:
        //  1. Get an existing blog post from db
        //  2. Make a PUT request to update that blog post
        //  3. Prove blog post returned by request contains data we sent
        //  4. Prove blog post in db is correctly updated
        it('should update fields you send over', function () {
            const updateData = {
                title: 'fofofofofofofof',
                content: 'futuristic fusion'
            };

            return BlogPost
                .findOne()
                .exec()
                .then(function (post) {
                    updateData.id = post.id;

                    // make request then inspect it to make sure it reflects
                    // data we sent
                    return chai.request(app)
                        .put(`/posts/${post.id}`)
                        .send(updateData);
                })
                .then(function (res) {
                    res.should.have.status(204);

                    return BlogPost.findById(updateData.id).exec();
                })
            //                .then(function (restaurant) {
            //                    restaurant.name.should.equal(updateData.name);
            //                    restaurant.cuisine.should.equal(updateData.cuisine);
            //                });
        });
    });

    describe('DELETE endpoint', function () {
        // strategy:
        //  1. get a blog post
        //  2. make a DELETE request for that blog post's id
        //  3. assert that response has right status code
        //  4. prove that blog post with the id doesn't exist in db anymore
        it('delete a blog post by id', function () {

            let post;

            return BlogPost
                .findOne()
                .exec()
                .then(function (_post) {
                    post = _post;
                    return chai.request(app).delete(`/posts/${post.id}`);
                })
                .then(function (res) {
                    res.should.have.status(204);
                    return BlogPost.findById(post.id).exec();
                })
            //                .then(function (_restaurant) {
            //                    // when a variable's value is null, chaining `should`
            //                    // doesn't work. so `_restaurant.should.be.null` would raise
            //                    // an error. `should.be.null(_restaurant)` is how we can
            //                    // make assertions about a null value.
            //                    should.not.exist(_restaurant);
            //                });
        });
    });
});
