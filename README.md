# Blog app challenge solution
==========================

## Tech Products Search powered by bestbuy.com
Thinkful (https://www.thinkful.com) Unit 2 Capstone Project - Node.js app integrating with *bestbuy.com*'s API

### Home Page
![home page no results](https://codysperoff.github.io/node-capstone-search-products-bestbuy/README-images/home-screen-no-results.png)

### Home Page with some results
![home page with results](https://codysperoff.github.io/node-capstone-search-products-bestbuy/README-images/home-screen-with-results.png)

### Home Page with some favorites
![home page with favorites](https://codysperoff.github.io/node-capstone-search-products-bestbuy/README-images/home-screen-with-favorites.png)


## Background

I built this app because I wanted to search for things on bestbuy, without all of the pop-windows and advertisements that come with the site.

## Use Case

This app gives users the ability to search for items they want and add them directly to a bestbuy shopping cart.

## Initial UX

The initial mobile and desktop wireframes can be seen below:

![Initial Wireframes](https://codysperoff.github.io/node-capstone-search-products-bestbuy/README-images/wireframe.png)

## Working Prototype

You can access a working prototype of the app here: https://node-capstone-search-bestbuy.herokuapp.com/

## Functionality
The app's functionality includes:

* Search for all technology related products located at bestbuy
* Return 10 results.
* Results provide the product name, associated picture, price, reviews and average rating if applicable, and the option to add to a best buy shopping cart
* Add chosen results to a favorites section.
* Delete events from favorites section.
* Link to a shopping cart on the best buy website
*Contains links to the github for the page, the bestbuy website, and the bestbuy facebook and twitter pages.

## Technical

The app is built with HTML, CSS, JavaScript, jQuery and Node.js. It uses AJAX JSON calls to the *bestbuy.com* Open Platform API to return the serach results. All data is held in an mLab database during the user's session. It has been built to be fully responsive across mobile, tablet and desktop screen resolutions.

## Development Roadmap

This is v1.0 of the app, but future enhancements are expected to include:

* The ability to increase, or decrease the search radius.
* The ability to narrow down a select the condition of the product.
* The ability to narrow down a select a certain price range.
* The ability to narrow down a select/search for a certain brand.
* The ability to narrow down a search for certain deals associated with the search item.
* The ability to narrow down a search based on customer ratings (only show items with a 5 star rating).
* The ability to narrow down a search for items with a certain color.
* Multiple pages of results.
* The functionality to write reviews on products that the user has purchased.
* Other abilities that appear based on the search result (a tv search that results in an option for a certain size range on the tv)
* The ability for a user to simultaneously add all of their favorited items to a shopping cart.
