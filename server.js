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
var runServer = function (callback) {
    mongoose.connect(config.DATABASE_URL, function (err) {
        if (err && callback) {
            return callback(err);
        }

        app.listen(config.PORT, function () {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};
// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance,
//test code) can start the server as needed.
if (require.main === module) {
    runServer(function (err) {
        if (err) {
            console.error(err);
        }
    });
};


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

app.post('/favorite-product', function (req, res) {
    console.log(req.body.productName);
    Product.create({
        name: req.body.productName
    }, function (err, products) {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(201).json(products);
    });
});
app.get('/favorite-products', function (req, res) {
    Product.find(function (err, products) {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(200).json(products);
    });
});

app.delete('/delete-favorites', function (req, res) {
    Product.remove(req.params.id, function (err, items) {
        if (err)
            return res.status(404).json({
                message: 'Item not found.'
            });

        res.status(200).json(items);
    });
});
app.delete('/delete-one-favorite/:favoritesId', function (req, res) {
    Product.findByIdAndRemove(req.params.favoritesId, function (err, items) {
        if (err)
            return res.status(404).json({
                message: 'Item not found.'
            });

        res.status(201).json(items);
    });
});


exports.app = app;
exports.runServer = runServer;

app.listen(process.env.PORT || 8888, process.env.IP);

module.exports = {
    runServer,
    app,
    closeServer
};
