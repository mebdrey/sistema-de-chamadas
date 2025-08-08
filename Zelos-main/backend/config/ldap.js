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
import passport from 'passport';
import LdapStrategy from 'passport-ldapauth';

// Verifica se estamos em modo de desenvolvimento (ambiente local)
const isDev = process.env.NODE_ENV !== 'production' || process.env.BYPASS_LDAP === 'true';

if (!isDev) {
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
    if (!user) return done(null, false, { message: 'Usuário não encontrado' });
    return done(null, user);
  }));
} else {
  // Bypass para testes locais
  passport.use('ldapauth', new (class extends passport.Strategy {
    authenticate(req) {
      const { username } = req.body;

      // Aqui você pode simular diferentes usuários
      if (!username) return this.fail({ message: 'Nome de usuário é obrigatório' });

      const fakeUser = {
        sAMAccountName: username,
        displayName: 'Usuário Fictício',
        mail: `${username}@teste.dev`
      };

      return this.success(fakeUser);
    }
  })());
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;

