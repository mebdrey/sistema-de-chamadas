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
//   }
// };

// passport.use(new LdapStrategy(ldapOptions, (user, done) => {
//   if (!user) {
//     return done(null, false, { message: 'Usuário não encontrado' });
//   }
//   return done(null, user);
// }));


// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// export default passport;


// p deixar ao entregar o projeto
// config/ldap.js
// import passport from 'passport';
// import LdapStrategy from 'passport-ldapauth';
// import { read, create } from './database.js';

// const ldapOptions = {
//   server: {
//     url: 'ldap://10.189.87.7:389',
//     bindDN: 'cn=script,ou=Funcionarios,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br',
//     bindCredentials: '7GFGOy4ATCiqW9c86eStgCe0RA9BgA',
//     searchBase: 'ou=Alunos,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br',
//     searchFilter: '(sAMAccountName={{username}})'
//   }
// };

// passport.use(new LdapStrategy(ldapOptions, async (user, done) => {
//   try {
//     if (!user) {
//       return done(null, false, { message: 'Usuário não encontrado' });
//     }

//     const username = user.sAMAccountName;
//     const nome = user.cn || 'Sem nome';
//     const email = user.userPrincipalName || `${username}@senai.br`;
//     const funcao = 'usuario'; // valor padrão
//     const senha = ''; // senha vazia, pois autentica via LDAP

//     // Verificar se usuário já existe
//     const existingUser = await read('usuarios', `username = '${username}'`);

//     let usuarioDB;
//     if (!existingUser) {
//       // Criar novo usuário no banco
//       const insertId = await create('usuarios', {
//         nome,
//         senha,
//         username,
//         email,
//         funcao,
//         status_usuarios: 'ativo'
//       });

//       usuarioDB = {
//         id: insertId,
//         nome,
//         senha,
//         username,
//         email,
//         funcao,
//         status_usuarios: 'ativo'
//       };
//     } else {
//       usuarioDB = existingUser;
//     }

//     return done(null, usuarioDB);
//   } catch (error) {
//     console.error('Erro no LDAP:', error);
//     return done(error);
//   }
// }));

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// export default passport;



// o codigo abaixo é apenas p testar localmente mas deve ser apagado
// config/ldap.js
// config/ldap.js
import passport from 'passport';
import LdapStrategy from 'passport-ldapauth';
import { read, create } from './database.js';

const isDev = process.env.NODE_ENV !== 'production' || process.env.BYPASS_LDAP === 'true';

// Função auxiliar para verificar/inserir usuário no MySQL
async function ensureUserInDatabase(user) {
  const username = user.sAMAccountName;
  const nome = user.cn || user.displayName || 'Sem nome';
  const email = user.userPrincipalName || user.mail || `${username}@senai.br`;
  const funcao = 'usuario';
  const senha = ''; // senha vazia pois autentica via LDAP

  // Verificar se já existe
  const existingUser = await read('usuarios', `username = '${username}'`);

  if (!existingUser) {
    const insertId = await create('usuarios', {
      nome,
      senha,
      username,
      email,
      funcao,
      status_usuarios: 'ativo'
    });

    return {
      id: insertId,
      nome,
      senha,
      username,
      email,
      funcao,
      status_usuarios: 'ativo'
    };
  }

  return existingUser;
}

if (!isDev) {
  // ----- Modo Produção (LDAP real) -----
  const ldapOptions = {
    server: {
      url: 'ldap://10.189.87.7:389',
      bindDN: 'cn=script,ou=Funcionarios,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br',
      bindCredentials: '7GFGOy4ATCiqW9c86eStgCe0RA9BgA',
      searchBase: 'ou=Alunos,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br',
      searchFilter: '(sAMAccountName={{username}})'
    }
  };

  passport.use(new LdapStrategy(ldapOptions, async (user, done) => {
    try {
      if (!user) {
        return done(null, false, { message: 'Usuário não encontrado' });
      }
      const usuarioDB = await ensureUserInDatabase(user);
      return done(null, usuarioDB);
    } catch (err) {
      console.error('Erro LDAP:', err);
      return done(err);
    }
  }));

} else {
  // ----- Modo Desenvolvimento (sem LDAP) -----
  passport.use('ldapauth', new (class extends passport.Strategy {
    async authenticate(req) {
      try {
        const { username } = req.body;
        if (!username) {
          return this.fail({ message: 'Nome de usuário é obrigatório' });
        }

        // Usuário fake para teste local
        const fakeUser = {
          sAMAccountName: username,
          displayName: 'Usuário Fictício',
          mail: `${username}@teste.dev`
        };

        const usuarioDB = await ensureUserInDatabase(fakeUser);
        return this.success(usuarioDB);
      } catch (err) {
        console.error('Erro LDAP fake:', err);
        return this.error(err);
      }
    }
  })());
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
