// //config/ldap.js
// import passport from 'passport';
// import LdapStrategy from 'passport-ldapauth';

// const ldapOptions = {
//   server: {
//     url: 'ldap://10.189.87.7:389',
//     bindDN: 'cn=script,ou=Funcionarios,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br',
//     bindCredentials: '7GFGOy4ATCiqW9c86eStgCe0RA9BgA',
//     searchBase: 'ou=Alunos,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br',
//     searchFilter: '(sAMAccountName={{username}})'
//   }};

// passport.use(new LdapStrategy(ldapOptions, (user, done) => {
//   if (!user) {
//     return done(null, false, { message: 'Usuário não encontrado' });
//   }
//   return done(null, user);}));

// passport.serializeUser((user, done) => { done(null, user);});

// passport.deserializeUser((user, done) => { done(null, user);});

// export default passport;


import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import LdapStrategy from "passport-ldapauth";
import { read, create } from "./database.js";

// ----- Função auxiliar para inserir usuário LDAP no banco -----
async function ensureUserInDatabase(user) {
  const username = user.sAMAccountName;
  const nome = user.displayName || user.cn || username;
  const email = user.mail || user.userPrincipalName || `${username}@senai.br`;
  const funcao = "usuario";
  const senha = ""; // senha vazia pois autentica via LDAP

  let existingUsers = await read("usuarios", `username = '${username}'`);

  // Garante que seja sempre um array
  if (!existingUsers) existingUsers = [];
  else if (!Array.isArray(existingUsers)) existingUsers = [existingUsers];

  if (existingUsers.length === 0) {
    try {
      const insertId = await create("usuarios", {
        nome,
        senha,
        username,
        email,
        funcao,
        status_usuarios: "ativo"
      });
      return { id: insertId, nome, username, funcao };
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        let result = await read("usuarios", `username = '${username}'`);
        if (!Array.isArray(result)) result = [result];
        const userExistente = result[0];
        return {
          id: userExistente.id,
          nome: userExistente.nome,
          username: userExistente.username,
          funcao: userExistente.funcao
        };
      }
      throw err;
    }
  }

  // Pega o primeiro usuário existente
  const usuarioExistente = existingUsers[0];
  return {
    id: usuarioExistente.id,
    nome: usuarioExistente.nome,
    username: usuarioExistente.username,
    funcao: usuarioExistente.funcao
  };
}

// ----- Estratégia LDAP -----
const ldapOptions = {
  server: {
    url: "ldap://10.189.87.7:389",
    bindDN: "cn=script,ou=Funcionarios,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br",
    bindCredentials: "7GFGOy4ATCiqW9c86eStgCe0RA9BgA",
    searchBase: "ou=Alunos,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br",
    searchFilter: "(sAMAccountName={{username}})"
  }
};

passport.use(
  new LdapStrategy(ldapOptions, async (user, done) => {
    try {
      if (!user) return done(null, false, { message: "Usuário LDAP não encontrado" });
      const usuarioFinal = await ensureUserInDatabase(user);
      return done(null, usuarioFinal);
    } catch (err) {
      return done(err);
    }
  })
);

// ----- Estratégia Local (admins, técnicos, auxiliares) -----
passport.use(
  "local-db",
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        let result = await read("usuarios", `username = '${username}'`);
        if (!result) result = [];
        else if (!Array.isArray(result)) result = [result];

        const user = result[0];
        if (!user) return done(null, false, { message: "Usuário não encontrado" });

        const senhaValida = user.senha === password; // ou bcrypt.compare(password, user.senha)
        if (!senhaValida) return done(null, false, { message: "Senha incorreta" });
        if (user.status_usuarios !== "ativo") return done(null, false, { message: "Usuário inativo" });

        return done(null, {
          id: user.id,
          nome: user.nome,
          username: user.username,
          funcao: user.funcao
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// ----- Serialize / Deserialize -----
passport.serializeUser((user, done) => {
  done(null, user.id); // salva apenas o ID na sessão
});

passport.deserializeUser(async (id, done) => {
  try {
    let result = await read("usuarios", `id = ${id}`);
    if (!result) return done(null, false);
    if (!Array.isArray(result)) result = [result];
    const user = result[0];

    done(null, {
      id: user.id,
      nome: user.nome,
      username: user.username,
      funcao: user.funcao
    });
  } catch (err) {
    done(err, null);
  }
});

export default passport;
