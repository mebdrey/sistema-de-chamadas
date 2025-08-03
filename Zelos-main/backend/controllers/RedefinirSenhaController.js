import { salvarToken, buscarToken, excluirToken } from '../models/RedefinirSenha.js';
import { update, read } from '../config/database.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const enviarLinkRedefinicao = async (req, res) => {
  const { email } = req.body;
  console.log('Email recebido:', email);

  const usuario = await read('usuarios', `email = '${email}'`);
  console.log('Resultado da consulta:', usuario);

  if (!usuario || usuario.length === 0) {
    console.log('Email não encontrado no banco.');
    return res.status(200).json({ mensagem: 'Se o e-mail existir, um link será enviado.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  await salvarToken(email, token);
  console.log('Token salvo com sucesso:', token);

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const link = `http://localhost:3000/redefinir-senha?token=${token}`;
  console.log('Link de redefinição:', link);

  try {
    const info = await transporter.sendMail({
      to: email,
      subject: 'Redefinição de senha',
      html: `<p>Clique <a href="${link}">aqui</a> para redefinir sua senha.</p>`,
    });

    console.log('Email enviado com sucesso:', info.response);

    res.status(200).json({ mensagem: 'Se o e-mail existir, um link será enviado.' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ erro: 'Erro ao enviar e-mail.' });
  }
};

const redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;

  const tokenData = await buscarToken(token);
  if (!tokenData) {
    return res.status(400).json({ erro: 'Token inválido ou expirado.' });
  }

  const expirado = new Date(tokenData.created_at) < new Date(Date.now() - 60 * 60 * 1000); // 1 hora
  if (expirado) {
    await excluirToken(token);
    return res.status(400).json({ erro: 'Token expirado.' });
  }

  const hashSenha = crypto.createHash('sha256').update(novaSenha).digest('hex');
  await update('usuarios', { senha: hashSenha }, `email = '${tokenData.email}'`);

  await excluirToken(token);

  res.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });
};

export { enviarLinkRedefinicao, redefinirSenha };
