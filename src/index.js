/**
 * Reuni os recursos desenvolvidos pelos controlers
 * Administrando as rotas e disponibilizando os recursos na porta 3000 no node
 */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get("/", (req, res)=>{
	res.send("oi");
})

//Importa todos os controllers
require('./app/controllers/index')(app);
app.listen(3000, function(){
	console.log("Ouvindo...");
});