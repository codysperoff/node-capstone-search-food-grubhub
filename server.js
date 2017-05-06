const unirest = require('unirest');
const events = require('events');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');
const Product = require('./models');



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
// runs. but we also export the runServer command so other code (for instance,
//test code) can start the server as needed.
if (require.main === module) {
    runServer().catch(err => console.error(err));
};



// external API call

//api call between the server and best buy api
var getProducts = function (product_name) {

    //console.log("inside the getProducts function");

    var emitter = new events.EventEmitter();

    //https://www.npmjs.com/package/bestbuy
    var bby = require('bestbuy')('ccw7r1Dxrz9wNwgQuNWLOKqZ');
    bby.products('(search=' + product_name + ')', {
        pageSize: 10
    }, function (err, data) {
        if (err) {
            console.warn(err);
            emitter.emit('api call retuned error:', err);
        } else if (data.total === 0) {
            console.log('No products found');
            emitter.emit('No products found', err);
        } else {
            console.log('Found %d products. First match "%s" is $%d', data.total, data.products[0].name, data.products[0].salePrice);
            emitter.emit('end', data);
        }
    });

    return emitter;
};

// local API endpoints
app.get('/product/:product_name', function (request, response) {
    //console.log(request.params.product_name);
    if (request.params.product_name == "") {
        response.json("Specify a product name");
    } else {
        var productDetails = getProducts(request.params.product_name);

        //get the data from the first api call
        productDetails.on('end', function (item) {
            //console.log(item);
            response.json(item);
        });

        //error handling
        productDetails.on('error', function (code) {
            response.sendStatus(code);
        });
    }
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

//app.use('*', function (req, res) {
//    res.status(404).json({
//        message: 'Not Found'
//    });
//});





exports.app = app;
exports.runServer = runServer;
app.listen(process.env.PORT, process.env.IP);

module.exports = {
    runServer,
    app,
    closeServer
};
