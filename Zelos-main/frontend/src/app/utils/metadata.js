// função pra colocar titulo a guia (precisa completar com as outras rotas)
export function getMetadataFromPath(path) {
  switch (path) {
    case 'admin/dashboard':
      return {
        title: 'Zelos - Dashboard',
        description: 'Painel do administrador',
      };
      case 'admin/chamados':
        return {
          title: 'Zelos - Chamados',
          description: 'Painel do administrador',
        };
        case 'admin/perfil':
          return {
            title: 'Zelos - Meu Perfil',
            description: 'Painel do administrador',
          };
          case 'admin/setores':
            return {
              title: 'Zelos - Setores',
              description: 'Painel do administrador',
            };
    case 'usuario/chamados':
      return {
        title: 'Zelos - Meus Chamados',
        description: 'Área do usuário',
      };
      case 'usuario/perfil':
      return {
        title: 'Zelos - Meu Perfil',
        description: 'Área do usuário',
      };
    case 'tecnico/chamados':
      return {
        title: 'Zelos - Chamados Técnicos',
        description: 'Painel técnico',
      };
      case 'tecnico/perfil':
      return {
        title: 'Zelos - Meu Perfil',
        description: 'Painel técnico',
      };
      
    default:
      return {
        title: 'Zelos',
        description: 'Sistema de chamados',
      };
  }
}
