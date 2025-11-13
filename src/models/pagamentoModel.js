const { query } = require("../config/db");

async function listarPagamentosDetalhados() {
  const result = await query(`
    SELECT p.*, m.id_aluno, a.nome as aluno_nome, c.descricao as curso_nome
    FROM pagamento p
    JOIN matricula m ON p.id_matricula = m.id_matricula
    JOIN aluno a ON m.id_aluno = a.id_aluno
    JOIN turma t ON m.id_turma = t.id_turma
    JOIN curso c ON t.id_curso = c.id_curso
    ORDER BY p.data_pagamento DESC
  `);
  return result.recordset;
}

async function criarPagamento({
  id_matricula,
  valor,
  tipo_pagamento,
  periodo_referencia,
  status,
}) {
  const result = await query(
    `INSERT INTO pagamento (id_matricula, valor, tipo_pagamento, periodo_referencia, status, data_pagamento)
     OUTPUT INSERTED.*
     VALUES (@id_matricula, @valor, @tipo_pagamento, @periodo_referencia, @status, GETDATE())`,
    [
      { name: 'id_matricula', type: 'Int', value: id_matricula },
      { name: 'valor', type: 'Decimal', value: valor, precision: 10, scale: 2 },
      { name: 'tipo_pagamento', type: 'VarChar', value: tipo_pagamento },
      { name: 'periodo_referencia', type: 'VarChar', value: periodo_referencia },
      { name: 'status', type: 'VarChar', value: status }
    ]
  );
  return result.recordset[0];
}

async function atualizarPagamento(
  id,
  { valor, tipo_pagamento, periodo_referencia, status }
) {
  const result = await query(
    `UPDATE pagamento
     SET valor = @valor, tipo_pagamento = @tipo_pagamento,
         periodo_referencia = @periodo_referencia, status = @status
     OUTPUT INSERTED.*
     WHERE id_pagamento = @id`,
    [
      { name: 'id', type: 'Int', value: id },
      { name: 'valor', type: 'Decimal', value: valor, precision: 10, scale: 2 },
      { name: 'tipo_pagamento', type: 'VarChar', value: tipo_pagamento },
      { name: 'periodo_referencia', type: 'VarChar', value: periodo_referencia },
      { name: 'status', type: 'VarChar', value: status }
    ]
  );
  return result.recordset[0];
}

async function removerPagamento(id) {
  const result = await query(
    "DELETE FROM pagamento WHERE id_pagamento = @id",
    { id: { type: 'Int', value: id } }
  );
  return result.rowsAffected[0] > 0;
}

module.exports = {
  listarPagamentosDetalhados,
  criarPagamento,
  atualizarPagamento,
  removerPagamento,
};
