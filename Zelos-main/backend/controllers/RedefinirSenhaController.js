import { salvarToken, buscarToken, marcarTokenComoUsado } from '../models/RedefinirSenha.js';
import { update, read } from '../config/database.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use app password se for gmail
  },
});

// POST /esqueci-senha
const enviarLinkRedefinicao = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ erro: 'Username ausente' });

  // se for numérico => usuário LDAP -> não permitir reset pelo sistema
  if (/^\d+$/.test(username.trim())) {
    return res.status(400).json({ erro: 'Não será possível redefinir a senha por aqui. Converse com os técnicos da sua escola.' });
  }

  // busca usuario pelo username (bcd)
  const usuarios = await read('usuarios', `username = '${username.trim()}'`);
  if (!usuarios || usuarios.length === 0) {
    // por segurança, retorno genérico (não dá dica se existe ou não)
    return res.status(200).json({ mensagem: 'Se o usuário existir, um e-mail com o código foi enviado.' });
  }

  const usuario = usuarios[0];
  const email = usuario.email;
  // gera código de 6 dígitos
  const codigo = String(Math.floor(100000 + Math.random() * 900000));

  await salvarToken(email, codigo);

  const html = `<p>Olá ${usuario.nome || ''},</p>
    <p>Seu código para redefinir a senha é: <b>${codigo}</b></p>
    <p>O código expira em 1 hora.</p>`;

  try {
    await transporter.sendMail({
      to: email,
      subject: 'Código para redefinição de senha',
      html,
    });
    return res.status(200).json({ mensagem: 'Se o usuário existir, um e-mail com o código foi enviado.' });
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    return res.status(500).json({ erro: 'Erro ao enviar e-mail.' });
  }
};

// POST /verify-code
const verifyCode = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ erro: 'Token ausente' });

  const tokenData = await buscarToken(token);
  if (!tokenData) return res.status(400).json({ erro: 'Código inválido ou já usado.' });

  // verifica expiração (1 hora)
  const createdAt = new Date(tokenData.created_at);
  if (createdAt < new Date(Date.now() - 60 * 60 * 1000)) {
    // opcional: remover token expirado
    await marcarTokenComoUsado(token);
    return res.status(400).json({ erro: 'Código expirado.' });
  }

  return res.status(200).json({ mensagem: 'Código válido.' });
};

// POST /redefinir-senha
const redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;
  if (!token || !novaSenha) return res.status(400).json({ erro: 'Dados insuficientes.' });

  const tokenData = await buscarToken(token);
  if (!tokenData) return res.status(400).json({ erro: 'Token inválido ou expirado.' });

  const createdAt = new Date(tokenData.created_at);
  if (createdAt < new Date(Date.now() - 60 * 60 * 1000)) {
    await marcarTokenComoUsado(token);
    return res.status(400).json({ erro: 'Token expirado.' });
  }

  // hash simples (recomendo bcrypt em produção)
  const hashSenha = crypto.createHash('sha256').update(novaSenha).digest('hex');

  try {
    await update('usuarios', { senha: hashSenha }, `email = '${tokenData.email}'`);
    await marcarTokenComoUsado(token);
    return res.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao atualizar a senha.' });
  }
};

export { enviarLinkRedefinicao, verifyCode, redefinirSenha };
