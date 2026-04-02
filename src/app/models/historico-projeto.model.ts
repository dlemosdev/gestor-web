export interface HistoricoProjeto {
  id: string;
  projetoId: string;
  tipo: 'CRIADO' | 'ATUALIZADO' | 'INATIVADO' | 'REATIVADO' | 'CONCLUIDO' | 'PRINCIPAL_DEFINIDO';
  descricao: string;
  criadoEm: string;
}
