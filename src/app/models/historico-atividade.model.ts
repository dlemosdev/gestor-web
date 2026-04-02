export interface HistoricoAtividade {
  id: string;
  atividadeId: string;
  projetoId: string;
  tipo: 'CRIADA' | 'MOVIDA_RAIA';
  descricao: string;
  origem: string | null;
  destino: string | null;
  criadoEm: string;
}
