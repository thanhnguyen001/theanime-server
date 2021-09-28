require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoDB = require('./config/mongoDb');
const routes = require('./routes');

const app = express();

const PORT = process.env.PORT || 8000

//Parse JON----------------------------
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

// Communicate to FE
app.use(cors());
// Connect to MongoDB-----------------
mongoDB.connect();

// Router ----------------------------
routes(app);

//
app.listen(PORT, () => console.log('Server is running in PORT=', PORT))


