const turmaModel = require("../models/turmaModel");

async function listar(req, res) {
  try {
    const turmas = await turmaModel.listarTurmasComCurso();
    res.json(turmas);
  } catch (err) {
    console.error("Erro ao buscar turmas:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function criar(req, res) {
  try {
    const {
      id_curso,
      semestre,
      limite_alunos,
      periodo,
      turno,
      sala,
      data_inicio,
      data_termino,
    } = req.body;
    const turma = await turmaModel.criarTurma({
      id_curso,
      semestre,
      limite_alunos,
      periodo,
      turno,
      sala,
      data_inicio,
      data_termino,
    });
    res.status(201).json(turma);
  } catch (err) {
    console.error("Erro ao criar turma:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const {
      id_curso,
      semestre,
      limite_alunos,
      periodo,
      turno,
      sala,
      data_inicio,
      data_termino,
    } = req.body;
    const atualizado = await turmaModel.atualizarTurma(id, {
      id_curso,
      semestre,
      limite_alunos,
      periodo,
      turno,
      sala,
      data_inicio,
      data_termino,
    });
    if (!atualizado) {
      return res.status(404).json({ error: "Turma não encontrada" });
    }
    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar turma:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;
    const removido = await turmaModel.removerTurma(id);
    if (!removido) {
      return res.status(404).json({ error: "Turma não encontrada" });
    }
    res.json({ message: "Turma excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir turma:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { listar, criar, atualizar, remover };
