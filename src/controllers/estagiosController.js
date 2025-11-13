const estagioModel = require('../models/estagioModel');
const { validationResult } = require('express-validator');

// Listar todos os estágios ou filtrar por status
async function listarEstagios(req, res) {
  try {
    const { status } = req.query;
    const estagios = await estagioModel.listarEstagios(status || null);
    res.json(estagios);
  } catch (error) {
    console.error('Erro ao listar estágios:', error);
    res.status(500).json({ error: 'Erro ao listar estágios', details: error.message });
  }
}

// Buscar estágio por ID
async function buscarEstagio(req, res) {
  try {
    const { id } = req.params;
    const estagio = await estagioModel.buscarEstagioPorId(parseInt(id));
    
    if (!estagio) {
      return res.status(404).json({ error: 'Estágio não encontrado' });
    }
    
    res.json(estagio);
  } catch (error) {
    console.error('Erro ao buscar estágio:', error);
    res.status(500).json({ error: 'Erro ao buscar estágio', details: error.message });
  }
}

// Criar um novo estágio
async function criarEstagio(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const novoEstagio = await estagioModel.criarEstagio(req.body);
    res.status(201).json(novoEstagio);
  } catch (error) {
    console.error('Erro ao criar estágio:', error);
    res.status(500).json({ error: 'Erro ao criar estágio', details: error.message });
  }
}

// Atualizar um estágio existente
async function atualizarEstagio(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { id } = req.params;
    const estagioAtualizado = await estagioModel.atualizarEstagio(parseInt(id), req.body);
    
    if (!estagioAtualizado) {
      return res.status(404).json({ error: 'Estágio não encontrado' });
    }
    
    res.json(estagioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar estágio:', error);
    res.status(500).json({ error: 'Erro ao atualizar estágio', details: error.message });
  }
}

// Remover um estágio
async function removerEstagio(req, res) {
  try {
    const { id } = req.params;
    const removido = await estagioModel.removerEstagio(parseInt(id));
    
    if (!removido) {
      return res.status(404).json({ error: 'Estágio não encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover estágio:', error);
    res.status(500).json({ error: 'Erro ao remover estágio', details: error.message });
  }
}

// Atualizar carga horária de um estágio
async function atualizarCargaHoraria(req, res) {
  try {
    const { id } = req.params;
    const { horas } = req.body;
    
    if (typeof horas !== 'number' || horas < 0) {
      return res.status(400).json({ error: 'A carga horária deve ser um número positivo' });
    }
    
    const estagioAtualizado = await estagioModel.atualizarCargaHoraria(parseInt(id), horas);
    
    if (!estagioAtualizado) {
      return res.status(404).json({ error: 'Estágio não encontrado' });
    }
    
    res.json(estagioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar carga horária:', error);
    res.status(500).json({ error: 'Erro ao atualizar carga horária', details: error.message });
  }
}

// Finalizar um estágio
async function finalizarEstagio(req, res) {
  try {
    const { id } = req.params;
    const estagioFinalizado = await estagioModel.finalizarEstagio(parseInt(id));
    
    if (!estagioFinalizado) {
      return res.status(404).json({ error: 'Estágio não encontrado' });
    }
    
    res.json(estagioFinalizado);
  } catch (error) {
    console.error('Erro ao finalizar estágio:', error);
    res.status(500).json({ error: 'Erro ao finalizar estágio', details: error.message });
  }
}

// Listar todas as empresas
async function listarEmpresas(req, res) {
  try {
    const empresas = await estagioModel.listarEmpresas();
    res.json(empresas);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao listar empresas', details: error.message });
  }
}

// Buscar empresa por ID
async function buscarEmpresa(req, res) {
  try {
    const { id } = req.params;
    const empresa = await estagioModel.buscarEmpresaPorId(parseInt(id));
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa', details: error.message });
  }
}

// Criar uma nova empresa
async function criarEmpresa(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const novaEmpresa = await estagioModel.criarEmpresa(req.body);
    res.status(201).json(novaEmpresa);
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa', details: error.message });
  }
}

// Atualizar uma empresa existente
async function atualizarEmpresa(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { id } = req.params;
    const empresaAtualizada = await estagioModel.atualizarEmpresa(parseInt(id), req.body);
    
    if (!empresaAtualizada) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json(empresaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa', details: error.message });
  }
}

// Remover uma empresa
async function removerEmpresa(req, res) {
  try {
    const { id } = req.params;
    const removida = await estagioModel.removerEmpresa(parseInt(id));
    
    if (!removida) {
      return res.status(404).json({ error: 'Empresa não encontrada ou possui estágios vinculados' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover empresa:', error);
    res.status(500).json({ error: 'Erro ao remover empresa', details: error.message });
  }
}

module.exports = {
  listarEstagios,
  buscarEstagio,
  criarEstagio,
  atualizarEstagio,
  removerEstagio,
  atualizarCargaHoraria,
  finalizarEstagio,
  listarEmpresas,
  buscarEmpresa,
  criarEmpresa,
  atualizarEmpresa,
  removerEmpresa
};
