const pagamentoModel = require("../models/pagamentoModel");

async function listar(req, res) {
  try {
    const pagamentos = await pagamentoModel.listarPagamentosDetalhados();
    res.json(pagamentos);
  } catch (err) {
    console.error("Erro ao buscar pagamentos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function criar(req, res) {
  try {
    const { id_matricula, valor, tipo_pagamento, periodo_referencia, status } =
      req.body;
    const pagamento = await pagamentoModel.criarPagamento({
      id_matricula,
      valor,
      tipo_pagamento,
      periodo_referencia,
      status,
    });
    res.status(201).json(pagamento);
  } catch (err) {
    console.error("Erro ao criar pagamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { id_matricula, valor, tipo_pagamento, periodo_referencia, status } =
      req.body;
    const atualizado = await pagamentoModel.atualizarPagamento(id, {
      id_matricula,
      valor,
      tipo_pagamento,
      periodo_referencia,
      status,
    });
    if (!atualizado) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }
    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar pagamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;
    const removido = await pagamentoModel.removerPagamento(id);
    if (!removido) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }
    res.json({ message: "Pagamento excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir pagamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { listar, criar, atualizar, remover };
