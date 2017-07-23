// Define the tour!
var tour = {
    id: "hello-hopscotch",
    steps: [
        {
            title: "Search Query",
            content: "Please enter the product you would like to search for here (please be as detailed as possible!)",
            target: "prodName",
            placement: "bottom"
        },
        {
            title: "Price of your item",
            content: "Enter the price of the product you are currently looking at (e.g price in the store)",
            target: "prodPrice",
            placement: "bottom"
        },
        {
            title: "Currency",
            content: "Select the currency your product price is in",
            target: "currency",
            placement: "bottom"
        },
        {
            title: "Go!",
            content: "Click here to submit your query!",
            target: "gobutton",
            placement: "bottom"
        }
    ]
};

// Start the tour!
hopscotch.startTour(tour);