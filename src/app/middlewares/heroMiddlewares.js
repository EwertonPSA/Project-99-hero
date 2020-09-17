const { body, validationResult } = require('express-validator');


validationParams = function(req, res, next){
    const errorValidation = validationResult(req);
    if (! errorValidation.isEmpty() ) {
        return res.status(400).send({
            error: errorValidation.array()
        });
    }
    next()
}

/**
 * Validacoes das entradas para a rota 
 * '/hero/recuperate' do controllerHero  
 */
exports.recuperate =  [
    body('codename')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Error, the field cannot be empty"),
    validationParams,
    body('disasters')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
    validationParams,
    body('cities')
        .optional()
        .not()
        .isEmpty().withMessage('Error, the field cannot be empty')
        .isArray().withMessage('Error, needs to be array'),
];
