/**
 * Reuni os recursos desenvolvidos pelos controlers
 * Administrando as rotas e disponibilizando os recursos na porta 3000 no node
 */
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const initDB = require('./database/db/seed')
initDB.startInformationDB();
//Importa todos os controllers
require('./app/controllers/index')(app);
app.listen(process.env.DEFINE_PORT_NODE, function(){
	console.log("Listening...");
});