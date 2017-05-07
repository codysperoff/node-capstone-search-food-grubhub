//Fuction when the user clicks to see the results
$(document).on('submit', "#search-form", function (key) {
    key.preventDefault();
    var userInput = $('#search-section').val();
    getResults(userInput);
});

//function to get results from api
function getResults(query) {
    //console.log(query);
    var url = '/product/' + query;
    $.ajax({
            method: 'GET',
            dataType: 'json',
            url: url,
        })
        /* if the call is successful (status 200 OK) show results */
        .done(function (result) {
            /* if the results are meeningful, we can just console.log them */
            console.log(result);

            console.log("ajax done", result);
            var output = '';
            if (result.products.length == 0) {
                alert('No Results Found!');
            } else {
                if (!result.error && result.products) {
                    output = result.products.reduce(resultsIntoListItem, '');
                } else {
                    output = 'Unable to access products (see browser console for more information)';
                }
                $('.results ul').html(output);
            }

        })
        /* if the call is NOT successful show errors */
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
        });
}

//function to get the shorten the output
function sanitizeJSON(unsanitized) {
    var str = JSON.stringify(unsanitized);
    var output = str
        .replace(/\\/g, "-")
        .replace(/\//g, "-")
        .replace(/\n/g, "")
        .replace(/\r/g, "")
        .replace(/\t/g, "")
        .replace(/\f/g, "")
        .replace(/"/g, "")
        .replace(/'/g, "")
        .replace(/\®/g, "")
        .replace(/\&/g, "");
    return output;
}


//function to display results of list items
function resultsIntoListItem(output, product) {
    var isSale;
    output += '<li>';
    output += '<div class="product-container">';
    output += '<div class="add-product-to-favorites">';
    output += '<input type="hidden" value="' + sanitizeJSON(product.name) + '">';
    output += '<button class="favorites"><img src="images/add-to-favorites.png"></button>';
    output += '</div>';
    output += '<div class="title-wrapper"><h3 class="clamp-this">' + sanitizeJSON(product.name) + '</h3></div>';
    if (product.image != null) {
        output += '<img src="' + product.image + '">';
    } else {
        output += '<img src="images/product-image-not-found.gif">';
    }
    output += '<div class = "product-details">';
    if (product.customerReviewCount != null) {
        output += '<p class="review-num">' + product.customerReviewCount + ' Reviews</p>';
    }
    if (product.customerReviewAverage != null) {
        output += '<p class="star-avg">' + product.customerReviewAverage + ' Stars</p>';
    }

    if ((product.salePrice < product.regularPrice) && (product.salePrice != null)) {
        output += '<p class="reg-price strikethrough">$' + product.regularPrice + '</p>';
        output += '<p class="sale-price highlight">Sale: $' + product.salePrice + '</p>';
        isSale = true;
    } else {
        output += '<p class="reg-price strong no-sale">$' + product.regularPrice + '</p>';
        isSale = false;
    }
    output += '</div>';
    if (isSale == false) {
        output += '<a href="' + product.addToCartUrl + '" class="add-to-cart">Add to Cart</a>';

    } else {
        output += '<a href="' + product.addToCartUrl + '" class="add-to-cart sale-button">Add to Cart</a>';

    }
    output += '</div>';
    output += '</li>';
    return output;
}
