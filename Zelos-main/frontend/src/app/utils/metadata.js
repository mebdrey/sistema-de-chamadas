// função pra colocar titulo a guia (precisa completar com as outras rotas)
export function getMetadataFromPath(path) {
  switch (path) {
    case 'admin/dashboard':
      return {
        title: 'Zelos - Dashboard',
        description: 'Painel do administrador',
      };
    case 'usuario/chamados':
      return {
        title: 'Zelos - Meus Chamados',
        description: 'Área do usuário',
      };
    case 'tecnico/chamados':
      return {
        title: 'Zelos - Chamados Técnicos',
        description: 'Painel técnico',
      };
    default:
      return {
        title: 'Zelos',
        description: 'Sistema de chamados',
      };
  }
}
