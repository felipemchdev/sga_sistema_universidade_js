const { query } = require("../config/db");

async function listarEstagios(status = null) {
  let sql = `
    SELECT 
      e.*, 
      a.nome AS nome_aluno,
      emp.nome AS nome_empresa,
      emp.cnpj,
      emp.telefone AS telefone_empresa,
      emp.email AS email_empresa
    FROM estagio e
    INNER JOIN aluno a ON e.id_aluno = a.id_aluno
    INNER JOIN empresa_estagio emp ON e.id_empresa = emp.id_empresa
  `;
  
  const params = [];
  
  if (status) {
    sql += ' WHERE e.status = @status';
    params.push({ name: 'status', type: 'VarChar', value: status });
  }
  
  sql += ' ORDER BY e.status, e.data_inicio DESC';
  
  const result = await query(sql, params);
  return result.recordset;
}

async function buscarEstagioPorId(id) {
  const result = await query(
    `SELECT 
       e.*, 
       a.nome AS nome_aluno,
       emp.nome AS nome_empresa,
       emp.cnpj,
       emp.endereco AS endereco_empresa,
       emp.telefone AS telefone_empresa,
       emp.email AS email_empresa,
       emp.responsavel AS responsavel_empresa
     FROM estagio e
     INNER JOIN aluno a ON e.id_aluno = a.id_aluno
     INNER JOIN empresa_estagio emp ON e.id_empresa = emp.id_empresa
     WHERE e.id_estagio = @id`,
    [{ name: 'id', type: 'Int', value: id }]
  );
  
  if (result.recordset.length === 0) {
    return null;
  }
  
  return result.recordset[0];
}

async function criarEstagio(estagio) {
  const result = await query(
    `INSERT INTO estagio (
      id_aluno, id_empresa, data_inicio, data_termino, 
      carga_horaria_total, carga_horaria_cumprida, status, 
      valor_bolsa, observacoes
    ) 
    OUTPUT INSERTED.*
    VALUES (
      @id_aluno, @id_empresa, @data_inicio, @data_termino, 
      @carga_horaria_total, @carga_horaria_cumprida, @status, 
      @valor_bolsa, @observacoes
    )`,
    [
      { name: 'id_aluno', type: 'Int', value: estagio.id_aluno },
      { name: 'id_empresa', type: 'Int', value: estagio.id_empresa },
      { name: 'data_inicio', type: 'Date', value: estagio.data_inicio },
      { name: 'data_termino', type: 'Date', value: estagio.data_termino || null },
      { name: 'carga_horaria_total', type: 'Int', value: estagio.carga_horaria_total },
      { name: 'carga_horaria_cumprida', type: 'Int', value: estagio.carga_horaria_cumprida || 0 },
      { name: 'status', type: 'VarChar', value: estagio.status || 'em_andamento' },
      { name: 'valor_bolsa', type: 'Decimal', value: estagio.valor_bolsa || 0 },
      { name: 'observacoes', type: 'VarChar', value: estagio.observacoes || '' }
    ]
  );
  
  return result.recordset[0];
}

async function atualizarEstagio(id, estagio) {
  const result = await query(
    `UPDATE estagio
     SET 
       id_empresa = @id_empresa,
       data_inicio = @data_inicio,
       data_termino = @data_termino,
       carga_horaria_total = @carga_horaria_total,
       carga_horaria_cumprida = @carga_horaria_cumprida,
       status = @status,
       valor_bolsa = @valor_bolsa,
       observacoes = @observacoes,
       data_atualizacao = GETDATE()
     OUTPUT INSERTED.*
     WHERE id_estagio = @id`,
    [
      { name: 'id', type: 'Int', value: id },
      { name: 'id_empresa', type: 'Int', value: estagio.id_empresa },
      { name: 'data_inicio', type: 'Date', value: estagio.data_inicio },
      { name: 'data_termino', type: 'Date', value: estagio.data_termino || null },
      { name: 'carga_horaria_total', type: 'Int', value: estagio.carga_horaria_total },
      { name: 'carga_horaria_cumprida', type: 'Int', value: estagio.carga_horaria_cumprida || 0 },
      { name: 'status', type: 'VarChar', value: estagio.status || 'em_andamento' },
      { name: 'valor_bolsa', type: 'Decimal', value: estagio.valor_bolsa || 0 },
      { name: 'observacoes', type: 'VarChar', value: estagio.observacoes || '' }
    ]
  );
  
  if (result.recordset.length === 0) {
    return null;
  }
  
  return result.recordset[0];
}

async function removerEstagio(id) {
  const result = await query(
    "DELETE FROM estagio WHERE id_estagio = @id",
    [{ name: 'id', type: 'Int', value: id }]
  );
  
  return result.rowsAffected[0] > 0;
}

async function atualizarCargaHoraria(id, horas) {
  const result = await query(
    `UPDATE estagio
     SET 
       carga_horaria_cumprida = @horas,
       data_atualizacao = GETDATE()
     OUTPUT INSERTED.*
     WHERE id_estagio = @id`,
    [
      { name: 'id', type: 'Int', value: id },
      { name: 'horas', type: 'Int', value: horas }
    ]
  );
  
  if (result.recordset.length === 0) {
    return null;
  }
  
  return result.recordset[0];
}

async function finalizarEstagio(id) {
  const result = await query(
    `UPDATE estagio
     SET 
       status = 'concluido',
       data_termino = GETDATE(),
       data_atualizacao = GETDATE()
     OUTPUT INSERTED.*
     WHERE id_estagio = @id`,
    [{ name: 'id', type: 'Int', value: id }]
  );
  
  if (result.recordset.length === 0) {
    return null;
  }
  
  return result.recordset[0];
}

async function listarEmpresas() {
  const result = await query(
    "SELECT * FROM empresa_estagio ORDER BY nome"
  );
  
  return result.recordset;
}

async function buscarEmpresaPorId(id) {
  const result = await query(
    "SELECT * FROM empresa_estagio WHERE id_empresa = @id",
    [{ name: 'id', type: 'Int', value: id }]
  );
  
  if (result.recordset.length === 0) {
    return null;
  }
  
  return result.recordset[0];
}

async function criarEmpresa(empresa) {
  const result = await query(
    `INSERT INTO empresa_estagio (
      nome, cnpj, endereco, telefone, email, responsavel
    ) 
    OUTPUT INSERTED.*
    VALUES (
      @nome, @cnpj, @endereco, @telefone, @email, @responsavel
    )`,
    [
      { name: 'nome', type: 'VarChar', value: empresa.nome },
      { name: 'cnpj', type: 'VarChar', value: empresa.cnpj || null },
      { name: 'endereco', type: 'VarChar', value: empresa.endereco || null },
      { name: 'telefone', type: 'VarChar', value: empresa.telefone || null },
      { name: 'email', type: 'VarChar', value: empresa.email || null },
      { name: 'responsavel', type: 'VarChar', value: empresa.responsavel || null }
    ]
  );
  
  return result.recordset[0];
}

async function atualizarEmpresa(id, empresa) {
  const result = await query(
    `UPDATE empresa_estagio
     SET 
       nome = @nome,
       cnpj = @cnpj,
       endereco = @endereco,
       telefone = @telefone,
       email = @email,
       responsavel = @responsavel
     OUTPUT INSERTED.*
     WHERE id_empresa = @id`,
    [
      { name: 'id', type: 'Int', value: id },
      { name: 'nome', type: 'VarChar', value: empresa.nome },
      { name: 'cnpj', type: 'VarChar', value: empresa.cnpj || null },
      { name: 'endereco', type: 'VarChar', value: empresa.endereco || null },
      { name: 'telefone', type: 'VarChar', value: empresa.telefone || null },
      { name: 'email', type: 'VarChar', value: empresa.email || null },
      { name: 'responsavel', type: 'VarChar', value: empresa.responsavel || null }
    ]
  );
  
  if (result.recordset.length === 0) {
    return null;
  }
  
  return result.recordset[0];
}

async function removerEmpresa(id) {
  // Verificar se existem estágios vinculados a esta empresa
  const estagios = await query(
    "SELECT COUNT(*) as total FROM estagio WHERE id_empresa = @id",
    [{ name: 'id', type: 'Int', value: id }]
  );
  
  if (estagios.recordset[0].total > 0) {
    throw new Error('Não é possível remover a empresa pois existem estágios vinculados a ela.');
  }
  
  const result = await query(
    "DELETE FROM empresa_estagio WHERE id_empresa = @id",
    [{ name: 'id', type: 'Int', value: id }]
  );
  
  return result.rowsAffected[0] > 0;
}

module.exports = {
  listarEstagios,
  buscarEstagioPorId,
  criarEstagio,
  atualizarEstagio,
  removerEstagio,
  atualizarCargaHoraria,
  finalizarEstagio,
  listarEmpresas,
  buscarEmpresaPorId,
  criarEmpresa,
  atualizarEmpresa,
  removerEmpresa
};
