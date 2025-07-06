// import http from 'http';

// const PORT = 3000;

// const server = http.createServer((req, res)=> {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write('<h1>Hello Node.js</h1>');

//     // handle different routes
//     if (req.url === '/about') {
//         res.write('<p>This is the about page</p>');
//     } else if (req.url === '/contact') {
//         res.write('<p>This is the contact page</p>');
//     } else {
//         res.write('<p>This is the home page</p>');
        
//     }
//     res.end();
// })



// server.listen(PORT, ()=> {
//     console.log(`Server running at http://localhost:${PORT}`);
// })


import http from 'http';

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/submit') {
    let body = '';

    // Listen for incoming data
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // When all data is received
    req.on('end', () => {
      console.log('Received POST data:', body);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Data received', data: body }));
    });
  } else {
    // For other requests
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Route not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
