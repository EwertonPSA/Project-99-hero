const { body, validationResult } = require('express-validator');

/**
 * Funcao que verifica se foi encontrado algum erro
 * Nas entradas, enviando uma resposta com detalhes do 
 * Primeiro erro encontrado
 */
validationParams = function(req, res, next){
    const errorValidation = validationResult(req);
    if (! errorValidation.isEmpty() ) {

        return res.status(400).send({
            //Emiti apenas o primeiro erro encontrado
            error: errorValidation.errors[0]
        });
    }
    next();
}

/**
 * Validacoes das entradas para a rota 
 * '/disaster/register' do controllerDisaster  
 */
exports.register = [
    body('name')
        .not()
        .isEmpty().withMessage("Error, the field cannot be empty"),
    validationParams,
];

/**
 * Validacoes das entradas para a rota 
 * '/disaster/delete' do controllerDisaster  
 */
exports.delete = [
    body('name')
        .not()
        .isEmpty().withMessage("Error, the field cannot be empty"),
    validationParams,
];
