import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js'; // Importar a chave secreta

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Não autorizado: Token não fornecido' });
  }

  const [ , token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ mensagem: 'Não autorizado: Token inválido' });
  }
};

//middleware de autenticação com Passport (via sessão)
export function garantirAutenticado(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ erro: 'Usuário não autenticado' });
}
