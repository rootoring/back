const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const { routes } = require('./src/routes');

const app = express();
	
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

routes.forEach(item => {
	app.use(`/${item}`, require(`./src/routes/${item}`));
});

const PORT = process.env.PORT || 3001;	

http.createServer({},app).listen(PORT);

console.log('Run server');



