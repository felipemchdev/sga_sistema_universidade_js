const { query } = require("../config/db");

async function listarCursosComDepartamento() {
  const result = await query(`
    SELECT c.*, d.descricao as departamento_nome
    FROM curso c
    JOIN departamento d ON c.id_departamento = d.id_departamento
    ORDER BY d.descricao, c.descricao
  `);
  return result.recordset;
}

async function criarCurso({
  id_departamento,
  descricao,
  sigla,
  valor_mensalidade,
  duracao_semestres,
}) {
  const result = await query(
    `INSERT INTO curso (id_departamento, descricao, sigla, valor_mensalidade, duracao_semestres)
     OUTPUT INSERTED.*
     VALUES (@id_departamento, @descricao, @sigla, @valor_mensalidade, @duracao_semestres)`,
    [
      { name: 'id_departamento', type: 'Int', value: id_departamento },
      { name: 'descricao', type: 'VarChar', value: descricao },
      { name: 'sigla', type: 'VarChar', value: sigla },
      { name: 'valor_mensalidade', type: 'Decimal', value: valor_mensalidade, precision: 10, scale: 2 },
      { name: 'duracao_semestres', type: 'Int', value: duracao_semestres }
    ]
  );
  return result.recordset[0];
}

async function atualizarCurso(id, { id_departamento, descricao, sigla, valor_mensalidade, duracao_semestres }) {
  const result = await query(
    `UPDATE curso
     SET id_departamento = @id_departamento, descricao = @descricao, sigla = @sigla,
         valor_mensalidade = @valor_mensalidade, duracao_semestres = @duracao_semestres
     OUTPUT INSERTED.*
     WHERE id_curso = @id`,
    [
      { name: 'id', type: 'Int', value: id },
      { name: 'id_departamento', type: 'Int', value: id_departamento },
      { name: 'descricao', type: 'VarChar', value: descricao },
      { name: 'sigla', type: 'VarChar', value: sigla },
      { name: 'valor_mensalidade', type: 'Decimal', value: valor_mensalidade, precision: 10, scale: 2 },
      { name: 'duracao_semestres', type: 'Int', value: duracao_semestres }
    ]
  );
  return result.recordset[0];
}

async function removerCurso(id) {
  const result = await query(
    "DELETE FROM curso WHERE id_curso = @id",
    { id: { type: 'Int', value: id } }
  );
  return result.rowsAffected[0] > 0;
}

module.exports = {
  listarCursosComDepartamento,
  criarCurso,
  atualizarCurso,
  removerCurso,
};
