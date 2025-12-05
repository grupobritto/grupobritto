# 🛠️ Guia de Atualização e Validação do Projeto

## 🔄 Atualizar pacotes principais

1. 📦 `npm install next@latest react@latest react-dom@latest`
2. 🔍 `ncu`
3. ⚙️ `ncu -u`
4. 📥 `npm install`

---

## 🧩 Dependências opcionais (se necessário)

### 📘 Tipos
1. 🧠 `npm install --save-dev @types/node@latest @types/react@latest @types/react-dom@latest`

### ☁️ Cloudflare
2. 🌐 `npm install --save-dev @cloudflare/next-on-pages @cloudflare/workers-types`

### 🎨 Formatação e estilo
3. ✨ `npm install --save-dev prettier prettier-plugin-tailwindcss`
4. 🧹 `npm install --save-dev eslint-config-prettier eslint-plugin-prettier prettier`

---

## ✅ Validação de arquivos

### 🔎 Lint
1. 🧪 `npm run lint`
2. 🛠️ `npm run lint:fix`

### 📏 Formatação
3. 🔍 `npm run format:check`
4. 🎯 `npm run format`

### 🧹 Lint adicional
5. 🐜 `npm run nlint`
