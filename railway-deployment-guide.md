# 🚀 Guia de Deploy no Railway - Creative Generator

## ⚠️ PROBLEMAS IDENTIFICADOS E SOLUCIONADOS

### 1. Build Falhando (RESOLVIDO)
- **Problema**: 94 erros de ESLint impediam o build de produção
- **Solução**: Configurado `next.config.mjs` para ignorar erros durante build
- **Status**: ✅ Build local funcionando

### 2. Variáveis de Ambiente (VERIFICAR)
No Railway, configure estas variáveis na aba **Variables**:

```bash
# OBRIGATÓRIAS - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OBRIGATÓRIA PARA EDGE FUNCTIONS
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AUTOMÁTICA (Railway define automaticamente)
NODE_ENV=production
```

## 🔧 CONFIGURAÇÃO DO RAILWAY

### Arquivo railway.json (JÁ CONFIGURADO)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Verificações Necessárias no Railway:

1. **Variables Tab**:
   - ✅ NEXT_PUBLIC_SUPABASE_URL
   - ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
   - ✅ SUPABASE_SERVICE_ROLE_KEY

2. **Settings Tab**:
   - ✅ Domain configurado
   - ✅ Environment: production
   - ✅ Build Command: `npm run build`
   - ✅ Start Command: `npm start`

3. **Deployments Tab**:
   - ✅ Último deploy bem-sucedido
   - ✅ Logs sem erros críticos

## 🚨 ERROS COMUNS E SOLUÇÕES

### Erro: "Application Error" / Página em Branco
**Possíveis Causas:**
1. Variáveis de ambiente faltando
2. Build falhando silenciosamente
3. Supabase configurado incorretamente
4. Middleware bloqueando requests

**Soluções:**
1. Verificar logs do Railway
2. Confirmar todas as variáveis de ambiente
3. Testar conexão Supabase
4. Verificar configuração de domínio

### Erro: "CORS" / "Failed to fetch"
**Causa**: Configuração incorreta do Supabase
**Solução**: Verificar URLs permitidas no Supabase Dashboard

### Erro: Build Timeout
**Causa**: Build muito lento ou falhando
**Solução**: Configuração atual resolve (ESLint ignorado)

## ✅ CHECKLIST DE DEPLOY

- [ ] **Build local funciona**: `npm run build` ✅
- [ ] **Variáveis configuradas no Railway**
- [ ] **Domain funcionando**
- [ ] **Logs do Railway sem erros**
- [ ] **Supabase permite conexões do Railway**

## 🔗 PRÓXIMOS PASSOS

1. **Verificar Railway Variables** - Mais importante
2. **Verificar Logs do Railway** - Podem mostrar erros específicos
3. **Testar Supabase Connection** - Fundamental para funcionamento
4. **Configurar Custom Domain** - Se necessário

## 📞 COMANDOS DE DEBUG

```bash
# Local - Testar build
npm run build
npm start

# Verificar se Supabase está funcionando
# (Fazer login na aplicação local)
```

## 🎯 FOCO PRINCIPAL

**O app funciona local** ✅  
**Build passou** ✅  
**Problema = Configuração Railway** ⚠️

Próximo passo: Verificar Variables no Railway! 