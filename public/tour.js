// Define the tour!
var tour = {
    id: "hello-hopscotch",
    steps: [
        {
            title: "My Header",
            content: "This is the header of my page.",
            target: "prodName",
            placement: "right"
        },
        {
            title: "My content",
            content: "Here is where I put my content.",
            target: "prodPrice",
            placement: "bottom"
        }
    ]
};

// Start the tour!
hopscotch.startTour(tour);