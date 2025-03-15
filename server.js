// Parameters
const port = 880; // Specify a port for our web server
const express = require('express'); // Load express with the use of requireJs

const app = express(); // Create an instance of the express library

// Serve static files
app.use(express.static(__dirname + '/'));

// Set 'canva.html' as the default route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/canva.html'); // Send canva.html when the root is accessed
});

// Listener for specified port
app.listen(port, function() { 
    console.log("Server running at: http://localhost:" + port);
});
