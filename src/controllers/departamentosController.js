const departamentoModel = require("../models/departamentoModel");

async function listar(req, res) {
  try {
    const departamentos = await departamentoModel.listarDepartamentos();
    res.json(departamentos);
  } catch (err) {
    console.error("Erro ao buscar departamentos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function criar(req, res) {
  try {
    const { descricao } = req.body;
    const departamento = await departamentoModel.criarDepartamento({
      descricao,
    });
    res.status(201).json(departamento);
  } catch (err) {
    console.error("Erro ao criar departamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { descricao } = req.body;
    const atualizado = await departamentoModel.atualizarDepartamento(id, {
      descricao,
    });
    if (!atualizado) {
      return res.status(404).json({ error: "Departamento não encontrado" });
    }
    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar departamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;
    const removido = await departamentoModel.removerDepartamento(id);
    if (!removido) {
      return res.status(404).json({ error: "Departamento não encontrado" });
    }
    res.json({ message: "Departamento excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir departamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { listar, criar, atualizar, remover };
