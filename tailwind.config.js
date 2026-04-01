module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        fundo: 'rgb(var(--cor-fundo-rgb) / <alpha-value>)',
        superficie: 'rgb(var(--cor-superficie-rgb) / <alpha-value>)',
        'superficie-secundaria': 'rgb(var(--cor-superficie-secundaria-rgb) / <alpha-value>)',
        borda: 'rgb(var(--cor-borda-rgb) / <alpha-value>)',
        primaria: 'rgb(var(--cor-primaria-rgb) / <alpha-value>)',
        'primaria-hover': 'rgb(var(--cor-primaria-hover-rgb) / <alpha-value>)',
        'cor-texto': 'rgb(var(--cor-texto-rgb) / <alpha-value>)',
        'cor-texto-secundaria': 'rgb(var(--cor-texto-secundaria-rgb) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
