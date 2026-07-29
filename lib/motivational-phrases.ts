const PHRASES = [
  'Constância vence intensidade.',
  'Um dia de cada vez, um passo mais perto.',
  'Você não decidiu desistir hoje.',
  'Disciplina é a versão silenciosa da motivação.',
  'O futuro agradece o que você fez hoje.',
  'Pequenos dias somam grandes resultados.',
  'Feito é melhor que perfeito.',
  'Hoje também conta.',
  'Você prometeu a si mesmo. E cumpriu.',
  'Progresso, não perfeição.',
  'Cada sessão é um tijolo.',
  'Ninguém vê o esforço, todos veem o resultado.',
  'Você é mais consistente do que imagina.',
  'Estudar hoje é escolher o seu amanhã.',
  'Sequência viva, mente em evolução.',
  'A rotina de hoje é a vitória de amanhã.',
]

export function randomPhrase(): string {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)]
}
