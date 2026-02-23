This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 📦 Stock Management System

Este projeto foi desenvolvido com o objetivo de gerenciar o controle de estoque de produtos de produção própria, permitindo organização interna, rastreabilidade e preparação para expansão futura para marketplaces.

---

## 🎯 Objetivo do Sistema

O sistema permite:

- Cadastro e gestão de produtos
- Controle de múltiplos estoques (estoque principal e estoques de loja)
- Movimentação de entrada e saída de produtos
- Controle de quantidade por produto dentro de cada estoque
- Organização por características como cor, modelo, material e tamanho
- Identificação rápida via SKU e leitura por código de barras
- Estrutura preparada para futura integração com marketplaces

---

## 🏪 Estrutura de Estoque

O sistema trabalha com dois tipos principais:

- **Main Stock (Estoque Geral)** → estoque central da operação
- **Store Stock (Estoque de Loja)** → estoques vinculados a lojas específicas

Cada produto pode existir em diferentes estoques, com controle individual de quantidade.

---

## 📦 Gestão de Produtos

Os produtos possuem:

- Identificador interno (SKU)
- Características organizacionais (cor, modelo, material e tamanho)
- Controle de preço
- Preparação para vínculo com marketplaces

O SKU pode ser utilizado como base para geração de código de barras, permitindo leitura rápida através de dispositivos físicos (bip).

---

## 🔄 Movimentação de Estoque

A movimentação de estoque é tratada com regras explícitas para:

- Garantir que não existam quantidades negativas
- Evitar inconsistências
- Manter integridade nas operações de entrada e saída

Cada produto dentro de um estoque possui sua própria quantidade controlada.

---

## 🌐 Preparação para Marketplace

O sistema foi estruturado para permitir integração futura com plataformas de venda online, como o Mercado Livre.

Cada produto pode futuramente ser vinculado a um identificador externo, permitindo:

- Sincronização de estoque
- Atualização de preço
- Gestão unificada entre sistema interno e marketplace

---

## 🚀 Escalabilidade

A modelagem foi pensada para permitir:

- Crescimento do catálogo de produtos
- Expansão para múltiplas lojas
- Integração com canais externos
- Evolução do sistema sem reestruturações críticas

---

Este projeto representa a base de um sistema de gestão de estoque preparado para crescer junto com a operação.