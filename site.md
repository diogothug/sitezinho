# Mar de Moreré - Guia Digital do Hóspede
Versão: 1.0

---

# Visão Geral

O Guia Digital da Mar de Moreré é uma Progressive Web App (PWA) mobile-first destinada exclusivamente aos hóspedes durante sua estadia.

O objetivo é substituir informações impressas, reduzir perguntas repetitivas na recepção, aumentar a venda de serviços e melhorar a experiência do hóspede.

O sistema deve transmitir sensação de hotel boutique, elegante, simples e acolhedor.

Não deve parecer um aplicativo comercial ou uma loja virtual.

---

# Objetivos

- Melhorar a experiência do hóspede
- Centralizar todas as informações da pousada
- Facilitar contato com a recepção
- Aumentar vendas de serviços extras
- Diminuir trabalho operacional
- Ser extremamente simples de usar

---

# Público

Hóspedes da Pousada Mar de Moreré.

Maioria utilizando smartphones.

Nenhum conhecimento técnico deve ser necessário.

---

# Tecnologias

React

Vite

TypeScript

TailwindCSS

Firebase Authentication

Firestore

Firebase Storage

Firebase Hosting

PWA

---

# Identidade Visual

Estilo:

- elegante
- minimalista
- tropical
- clean
- premium
- muito espaço em branco

Paleta:

- areia
- verde coqueiro
- azul mar
- branco

Evitar aparência de marketplace.

---

# Login

Não existe cadastro.

Não existe senha.

Cada reserva possui um Token único.

Exemplo:

mardemorere.com/g/8Hd72KaP

O token identifica:

- reserva
- quarto
- hóspede
- check-in
- checkout

Após primeiro acesso:

Salvar sessão em Cookie.

O Token expira automaticamente após checkout.

---

# Estrutura

## Tela Inicial

Mostrar:

Mensagem:

Bom dia, Diogo.

ou

Boa tarde.

Mostrar:

- data
- clima
- horário
- maré
- fase da lua

Botões grandes:

🍽 Cardápio

🛟 Conveniência

🛶 Passeios

🏡 Informações da pousada

💬 Recepção

---

# Cardápio

Categorias:

Café

Almoço

Jantar

Drinks

Bebidas

Sobremesas

Cada item possui:

foto

descrição

preço

botão:

Solicitar

---

# Conveniência

Categorias:

Higiene

Praia

Eletrônicos

Snacks

Bebidas

Farmácia

Tabacaria (oculta por padrão)

Cada item possui:

foto

descrição

preço

Solicitar

---

# Passeios

Lista:

Piscinas Naturais

Volta à Ilha

Moreré

Castelhanos

Cova da Onça

Cada passeio possui:

foto

descrição

valor

tempo

Botão:

Quero reservar

---

# Recepção

Botões rápidos:

Preciso de toalhas

Quero limpeza

Pedir gelo

Solicitar café

Falar no WhatsApp

Cada botão envia mensagem automática.

---

# Informações

Check-in

Check-out

Wi-Fi

Senha

Regras

Voltagem

Sustentabilidade

Restaurante

Mapa da pousada

Praias

Restaurantes próximos

Emergências

---

# Minha Hospedagem

Mostrar:

Nome

Quarto

Datas

Consumos (futuro)

Solicitações

---

# Marés

Mostrar:

Maré atual

Próxima maré baixa

Próxima maré alta

Fase da lua

---

# Notificações

Recepção poderá enviar:

Hoje teremos lagosta.

Happy Hour.

Passeio disponível.

Café da manhã especial.

---

# Fluxo de Compra

Usuário toca em:

Solicitar

Sistema pergunta:

Adicionar observação?

Enviar

Mensagem enviada automaticamente para recepção.

Não existe pagamento online inicialmente.

Pagamento:

Pix

Cartão

ou

Adicionar na conta do quarto.

---

# Painel Administrativo (Futuro)

Gerenciar:

Cardápio

Produtos

Passeios

Mensagens

Notificações

Reservas

Tokens

Consumos

---

# Funcionalidades Futuras

Check-out digital

NFC

QR Code

Pagamento online

Pix automático

Avaliação da hospedagem

Integração Booking

Integração Airbnb

Integração WhatsApp

Fechadura inteligente

---

# Requisitos

Mobile First.

Offline parcial (PWA).

Carregamento muito rápido.

Ícones grandes.

Fonte grande.

Poucos cliques.

Interface extremamente intuitiva.

---

# Princípios

Nunca parecer uma loja.

Nunca parecer um sistema corporativo.

Sempre parecer um concierge particular.

Toda interação deve transmitir hospitalidade.

A experiência deve lembrar hotéis boutique de alto padrão.
