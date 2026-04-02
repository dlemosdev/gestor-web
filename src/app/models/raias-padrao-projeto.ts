export type RaiaPadraoProjeto = 'BACKLOG' | 'EM_ANDAMENTO' | 'TESTE' | 'AGUARDANDO_PUBLICACAO' | 'CONCLUIDAS';

export interface OpcaoRaiaPadraoProjeto {
  valor: RaiaPadraoProjeto;
  rotulo: string;
}

export const OPCOES_RAIAS_PADRAO_PROJETO: OpcaoRaiaPadraoProjeto[] = [
  { valor: 'BACKLOG', rotulo: 'Backlog' },
  { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento' },
  { valor: 'TESTE', rotulo: 'Teste' },
  { valor: 'AGUARDANDO_PUBLICACAO', rotulo: 'Aguardando publicação' },
  { valor: 'CONCLUIDAS', rotulo: 'Concluídas' },
];
