const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// Middleware para tratamento de erros
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Rota para obter estatísticas de status dos alunos
router.get('/alunos/status', asyncHandler(async (req, res) => {
    const results = await query(`
        SELECT 
            status,
            COUNT(*) as total
        FROM aluno
        GROUP BY status
    `);
    
    // Inicializar contadores
    const statusCounts = {
        ativo: 0,
        trancado: 0,
        inativo: 0
    };
    
    // Preencher contadores com os resultados da consulta
    results.recordset.forEach(row => {
        const status = row.status.toLowerCase();
        if (status in statusCounts) {
            statusCounts[status] = row.total;
        }
    });
    
    res.json({
        ativos: statusCounts.ativo,
        trancados: statusCounts.trancado,
        inativos: statusCounts.inativo
    });
}));

// Rota para obter estatísticas de pagamentos do último mês
router.get('/pagamentos/ultimo-mes', asyncHandler(async (req, res) => {
    const result = await query(`
        SELECT 
            COALESCE(SUM(valor), 0) as total
        FROM pagamento
        WHERE data_pagamento >= DATEADD(month, -1, GETDATE())
        AND status = 'pago'
    `);
    
    res.json({
        total: parseFloat(result.recordset[0].total) || 0
    });
}));

// Rota para obter estatísticas gerais do dashboard
router.get('/estatisticas', asyncHandler(async (req, res) => {
    // Consulta para obter total de alunos
    const alunosResult = await query('SELECT COUNT(*) as total FROM aluno');
    const totalAlunos = alunosResult.recordset[0].total;
    
    // Consulta para obter status dos alunos
    const statusResult = await query(`
        SELECT 
            status,
            COUNT(*) as total
        FROM aluno
        GROUP BY status
    `);
    
    // Inicializar contadores
    const statusCounts = {
        ativo: 0,
        trancado: 0,
        inativo: 0
    };
    
    // Preencher contadores com os resultados da consulta
    statusResult.recordset.forEach(row => {
        const status = row.status.toLowerCase();
        if (status in statusCounts) {
            statusCounts[status] = row.total;
        }
    });
    
    // Consulta para obter total de pagamentos do último mês
    const pagamentosResult = await query(`
        SELECT 
            COALESCE(SUM(valor), 0) as total
        FROM pagamento
        WHERE data_pagamento >= DATEADD(month, -1, GETDATE())
        AND status = 'pago'
    `);
    
    // Consulta para obter fluxo de caixa dos últimos 6 meses
    const fluxoCaixaResult = await query(`
        SELECT 
            FORMAT(data_pagamento, 'yyyy-MM') as mes,
            COALESCE(SUM(valor), 0) as total
        FROM pagamento
        WHERE data_pagamento >= DATEADD(month, -6, GETDATE())
        AND status = 'pago'
        GROUP BY FORMAT(data_pagamento, 'yyyy-MM')
        ORDER BY mes
    `);
    
    res.json({
        totalAlunos,
        statusAlunos: {
            ativos: statusCounts.ativo,
            trancados: statusCounts.trancado,
            inativos: statusCounts.inativo
        },
        fluxoCaixa: {
            ultimoMes: parseFloat(pagamentosResult.recordset[0].total) || 0,
            historico: fluxoCaixaResult.recordset.map(item => ({
                mes: item.mes,
                total: parseFloat(item.total) || 0
            }))
        }
    });
}));

// Middleware de tratamento de erros
router.use((err, req, res, next) => {
    console.error('Erro na rota do dashboard:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = router;
