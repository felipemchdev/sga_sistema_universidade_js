const express = require('express');
const router = express.Router();
const { check, query } = require('express-validator');
const estagiosController = require('../controllers/estagiosController');

// Middleware de validação
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    return res.status(400).json({ errors: errors.array() });
  };
};

// Rotas para Estágios
router.get('/', [
  query('status').optional().isIn(['em_andamento', 'concluido', 'cancelado'])
], estagiosController.listarEstagios);

// Rotas para Empresas - Devem vir antes das rotas com parâmetros
router.get('/empresas', estagiosController.listarEmpresas);

router.get('/empresas/:id', [
  check('id').isInt().withMessage('ID deve ser um número inteiro')
], estagiosController.buscarEmpresa);

router.get('/:id', [
  check('id').isInt().withMessage('ID deve ser um número inteiro')
], estagiosController.buscarEstagio);

router.post('/', [
  check('id_aluno').isInt().withMessage('ID do aluno é obrigatório'),
  check('id_empresa').isInt().withMessage('ID da empresa é obrigatório'),
  check('data_inicio').isISO8601().withMessage('Data de início inválida'),
  check('data_termino').optional().isISO8601().withMessage('Data de término inválida'),
  check('carga_horaria_total').isInt({ min: 1 }).withMessage('Carga horária total deve ser um número positivo'),
  check('carga_horaria_cumprida').optional().isInt({ min: 0 }).withMessage('Carga horária cumprida deve ser um número não negativo'),
  check('status').optional().isIn(['em_andamento', 'concluido', 'cancelado']).withMessage('Status inválido'),
  check('valor_bolsa').optional().isFloat({ min: 0 }).withMessage('Valor da bolsa deve ser um número positivo')
], estagiosController.criarEstagio);

router.put('/:id', [
  check('id').isInt().withMessage('ID deve ser um número inteiro'),
  check('id_empresa').optional().isInt().withMessage('ID da empresa deve ser um número inteiro'),
  check('data_inicio').optional().isISO8601().withMessage('Data de início inválida'),
  check('data_termino').optional().isISO8601().withMessage('Data de término inválida'),
  check('carga_horaria_total').optional().isInt({ min: 1 }).withMessage('Carga horária total deve ser um número positivo'),
  check('carga_horaria_cumprida').optional().isInt({ min: 0 }).withMessage('Carga horária cumprida deve ser um número não negativo'),
  check('status').optional().isIn(['em_andamento', 'concluido', 'cancelado']).withMessage('Status inválido'),
  check('valor_bolsa').optional().isFloat({ min: 0 }).withMessage('Valor da bolsa deve ser um número positivo')
], estagiosController.atualizarEstagio);

router.delete('/:id', [
  check('id').isInt().withMessage('ID deve ser um número inteiro')
], estagiosController.removerEstagio);

// Rota para atualizar carga horária
router.patch('/:id/carga-horaria', [
  check('id').isInt().withMessage('ID deve ser um número inteiro'),
  check('horas').isInt({ min: 0 }).withMessage('Horas devem ser um número não negativo')
], estagiosController.atualizarCargaHoraria);

// Rota para finalizar estágio
router.post('/:id/finalizar', [
  check('id').isInt().withMessage('ID deve ser um número inteiro')
], estagiosController.finalizarEstagio);


router.post('/empresas', [
  check('nome').notEmpty().withMessage('Nome da empresa é obrigatório'),
  check('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
  check('telefone').optional().isLength({ min: 10 }).withMessage('Telefone inválido'),
  check('email').optional().isEmail().withMessage('E-mail inválido')
], estagiosController.criarEmpresa);

router.put('/empresas/:id', [
  check('id').isInt().withMessage('ID deve ser um número inteiro'),
  check('nome').optional().notEmpty().withMessage('Nome da empresa não pode estar vazio'),
  check('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
  check('telefone').optional().isLength({ min: 10 }).withMessage('Telefone inválido'),
  check('email').optional().isEmail().withMessage('E-mail inválido')
], estagiosController.atualizarEmpresa);

router.delete('/empresas/:id', [
  check('id').isInt().withMessage('ID deve ser um número inteiro')
], estagiosController.removerEmpresa);

module.exports = router;
