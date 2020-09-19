/**
 * Acessa a pasta controllers, lendo todos os arquivos 
 * Controllers criados na pasta (exceto index) e
 * Importando todos os modulos desses controllers repassando o parametro app, 
 * Depois exporta todos eles como um unico modulo
 */
const fs = require ('fs');
const path = require ('path');

module.exports = app =>{
    fs
        .readdirSync(__dirname)
        .filter(file => (file.indexOf('.') !== 0) && (file != "index.js") )
        .forEach(file => require (path.resolve(__dirname, file))(app));
};