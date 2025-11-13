const alunoModel = require("../models/alunoModel");

async function listar(req, res) {
  try {
    const alunos = await alunoModel.listarAlunos();
    res.json(alunos);
  } catch (err) {
    console.error("Erro ao buscar alunos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function criar(req, res) {
  try {
    const { nome, cidade, estado, data_nascimento, status } = req.body;
    const aluno = await alunoModel.criarAluno({
      nome,
      cidade,
      estado,
      data_nascimento,
      status,
    });
    res.status(201).json(aluno);
  } catch (err) {
    console.error("Erro ao criar aluno:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, cidade, estado, data_nascimento, status } = req.body;
    const atualizado = await alunoModel.atualizarAluno(id, {
      nome,
      cidade,
      estado,
      data_nascimento,
      status,
    });
    if (!atualizado) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar aluno:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;
    const removido = await alunoModel.removerAluno(id);
    if (!removido) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    res.json({ message: "Aluno excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir aluno:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { listar, criar, atualizar, remover };
