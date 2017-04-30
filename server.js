const unirest = require('unirest');
const events = require('events');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');
const activity = require('./models');



const express = require('express');
const morgan = require('morgan');

const {
    DATABASE_URL,
    PORT
} = require('./config');
const {
    BlogPost
} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.Promise = global.Promise;



// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer().catch(err => console.error(err));
};



// external API call
var getRestaurants = function (searchTerm) {
    var emitter = new events.EventEmitter();
    console.log("inside getFromActive function");

    var search = new Search('Manhattan, NY');
    //    after succesfull initial tests activate this line
    //    var search = new Search(searchTerm);

    search.run({
        perPage: 15,
        page: 1
    }, function (err, results) {
        console.log("error = ", err);
        console.log("results = ", results);
        results.forEach(function (restaurant) {
            console.log(
                "Restaurant %s is %d miles away, has a rating of %d",
                restaurant.name, restaurant.distance, restaurant.grubhubRating
            );

        });


        //        //success scenario
        //        if (results.ok) {
        //            results.forEach(function (restaurant) {
        //                console.log(
        //                    "Restaurant %s is %d miles away, has a rating of %d",
        //                    restaurant.name, restaurant.distance, restaurant.grubhubRating
        //                );
        //
        //            });
        //            emitter.emit('end', results);
        //        }
        //        //failure scenario
        //        else {
        //            emitter.emit('error', err);
        //        }
    });

    return emitter;
};

// local API endpoints
app.get('/get-restaurants/:location', function (req, res) {

    //    external api function call and response

    var searchReq = getRestaurants(req.params.location);

    //get the data from the first api call
    searchReq.on('end', function (item) {
        res.json(item);
    });

    //error handling
    searchReq.on('error', function (code) {
        res.sendStatus(code);
    });

});
//
//app.get('/posts', (req, res) => {
//    BlogPost
//        .find()
//        .exec()
//        .then(posts => {
//            res.json(posts.map(post => post.apiRepr()));
//        })
//        .catch(err => {
//            console.error(err);
//            res.status(500).json({
//                error: 'something went terribly wrong'
//            });
//        });
//});
//
//app.get('/posts/:id', (req, res) => {
//    BlogPost
//        .findById(req.params.id)
//        .exec()
//        .then(post => res.json(post.apiRepr()))
//        .catch(err => {
//            console.error(err);
//            res.status(500).json({
//                error: 'something went horribly awry'
//            });
//        });
//});
//
//app.post('/posts', (req, res) => {
//    const requiredFields = ['title', 'content', 'author'];
//    for (let i = 0; i < requiredFields.length; i++) {
//        const field = requiredFields[i];
//        if (!(field in req.body)) {
//            const message = `Missing \`${field}\` in request body`
//            console.error(message);
//            return res.status(400).send(message);
//        }
//    }
//
//    BlogPost
//        .create({
//            title: req.body.title,
//            content: req.body.content,
//            author: req.body.author
//        })
//        .then(blogPost => res.status(201).json(blogPost.apiRepr()))
//        .catch(err => {
//            console.error(err);
//            res.status(500).json({
//                error: 'Something went wrong'
//            });
//        });
//
//});
//
//
//app.delete('/posts/:id', (req, res) => {
//    BlogPost
//        .findByIdAndRemove(req.params.id)
//        .exec()
//        .then(() => {
//            res.status(204).json({
//                message: 'success'
//            });
//        })
//        .catch(err => {
//            console.error(err);
//            res.status(500).json({
//                error: 'something went terribly wrong'
//            });
//        });
//});
//
//
//app.put('/posts/:id', (req, res) => {
//    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//        res.status(400).json({
//            error: 'Request path id and request body id values must match'
//        });
//    }
//
//    const updated = {};
//    const updateableFields = ['title', 'content', 'author'];
//    updateableFields.forEach(field => {
//        if (field in req.body) {
//            updated[field] = req.body[field];
//        }
//    });
//
//    BlogPost
//        .findByIdAndUpdate(req.params.id, {
//            $set: updated
//        }, {
//            new: true
//        })
//        .exec()
//        .then(updatedPost => res.status(204).json(updatedPost.apiRepr()))
//        .catch(err => res.status(500).json({
//            message: 'Something went wrong'
//        }));
//});
//
//
//app.delete('/:id', (req, res) => {
//    BlogPosts
//        .findByIdAndRemove(req.params.id)
//        .exec()
//        .then(() => {
//            console.log(`Deleted blog post with id \`${req.params.ID}\``);
//            res.status(204).end();
//        });
//});

app.use('*', function (req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});






module.exports = {
    runServer,
    app,
    closeServer
};
