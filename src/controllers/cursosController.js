const cursoModel = require("../models/cursoModel");

async function listar(req, res) {
  try {
    const cursos = await cursoModel.listarCursosComDepartamento();
    res.json(cursos);
  } catch (err) {
    console.error("Erro ao buscar cursos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function criar(req, res) {
  try {
    const {
      id_departamento,
      descricao,
      sigla,
      valor_mensalidade,
      duracao_semestres,
    } = req.body;
    const curso = await cursoModel.criarCurso({
      id_departamento,
      descricao,
      sigla,
      valor_mensalidade,
      duracao_semestres,
    });
    res.status(201).json(curso);
  } catch (err) {
    console.error("Erro ao criar curso:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const {
      id_departamento,
      descricao,
      sigla,
      valor_mensalidade,
      duracao_semestres,
    } = req.body;
    const atualizado = await cursoModel.atualizarCurso(id, {
      id_departamento,
      descricao,
      sigla,
      valor_mensalidade,
      duracao_semestres,
    });
    if (!atualizado) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }
    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar curso:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;
    const removido = await cursoModel.removerCurso(id);
    if (!removido) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }
    res.json({ message: "Curso excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir curso:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { listar, criar, atualizar, remover };
