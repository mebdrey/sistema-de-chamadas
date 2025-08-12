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


// o codigo abaixo é apenas p testar localmente mas deve ser apagado
// config/ldap.js
import passport from 'passport';
import LdapStrategy from 'passport-ldapauth';

const isDev = process.env.NODE_ENV !== 'production' || process.env.BYPASS_LDAP === 'true';

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

  passport.use(new LdapStrategy(ldapOptions, (user, done) => {
    if (!user) {
      return done(null, false, { message: 'Usuário não encontrado' });
    }
    return done(null, user);
  }));

} else {
  // ----- Modo Desenvolvimento (sem LDAP) -----
  passport.use('ldapauth', new (class extends passport.Strategy {
    async authenticate(req) {
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

      return this.success(fakeUser);
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
