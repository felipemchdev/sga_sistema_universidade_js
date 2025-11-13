const matriculaModel = require("../models/matriculaModel");

async function listar(req, res) {
  try {
    const matriculas = await matriculaModel.listarMatriculasDetalhadas();
    res.json(matriculas);
  } catch (err) {
    console.error("Erro ao buscar matrículas:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function criar(req, res) {
  try {
    const { id_aluno, id_turma, status_matricula, observacoes } = req.body;
    const matricula = await matriculaModel.criarMatricula({
      id_aluno,
      id_turma,
      status_matricula,
      observacoes,
    });
    res.status(201).json(matricula);
  } catch (err) {
    console.error("Erro ao criar matrícula:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { id_aluno, id_turma, status_matricula, observacoes } = req.body;
    const atualizado = await matriculaModel.atualizarMatricula(id, {
      id_aluno,
      id_turma,
      status_matricula,
      observacoes,
    });
    if (!atualizado) {
      return res.status(404).json({ error: "Matrícula não encontrada" });
    }
    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar matrícula:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;
    const removido = await matriculaModel.removerMatricula(id);
    if (!removido) {
      return res.status(404).json({ error: "Matrícula não encontrada" });
    }
    res.json({ message: "Matrícula excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir matrícula:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { listar, criar, atualizar, remover };
