
import puppeteer from 'puppeteer';
import { jsPDF } from 'jspdf';
import bcrypt from 'bcryptjs';
import { create, readAll, read, readQuery, update, deleteRecord } from '../config/database.js';
import { criarNotificacao } from './Notificacoes.js';


// busca o nome do usuario pelo seu id
export const buscarChamadoComNomeUsuario = async (chamadoId) => {
  const sql = `SELECT c.*, u.nome AS nome_usuario FROM chamados c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.id = ?`;
  try {
    const result = await readQuery(sql, [chamadoId]);
    return result[0];
  } catch (err) { throw err; }
};

export const getChamadoById = async (chamado_id) => {
  const sql = `SELECT c.*, u.nome AS nome_usuario, t.nome AS tecnico_nome, p.titulo AS setor_nome
    FROM chamados c
    LEFT JOIN usuarios u ON u.id = c.usuario_id
    LEFT JOIN usuarios t ON t.id = c.tecnico_id
    LEFT JOIN pool p ON p.id = c.tipo_id  -- POOL = tabela de setores/servicos
    WHERE c.id = ?
    LIMIT 1`;
  const rows = await readQuery(sql, [chamado_id]);
  return rows && rows[0] ? rows[0] : null;
};

// Buscar todas as prioridades
export const listarPrioridades = async () => {
    try {
        const resultado = await readAll("prioridades"); // SELECT * FROM prioridades
        return resultado;
    } catch (err) {
        console.error("Erro ao buscar prioridades:", err);
        throw err;
    }
};