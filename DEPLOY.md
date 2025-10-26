# 🚀 Deploy no Render

## 1. Configurar Supabase
Execute no SQL Editor:
```sql
-- Cole o conteúdo de supabase-setup.sql
```

## 2. Deploy no Render
1. Conecte este repositório GitHub
2. Configure variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL=https://pshmizivmvzjvwxouygj.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaG1peml2bXZ6anZ3eG91eWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDE5NTUsImV4cCI6MjA3MzE3Nzk1NX0.kToicwD1vKUTe9mPE1JFbV_PdtRmMJ5PpXYFJvMN3GM`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaG1peml2bXZ6anZ3eG91eWdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYwMTk1NSwiZXhwIjoyMDczMTc3OTU1fQ.pLGW3aRCgzSTlN3FJWceRkl1Y0skuNK0IGQnrvyW290`
   - `JWT_SECRET=quantum_surebet_2024`

## 3. Configurações Render
- Build Command: `npm run build`
- Start Command: `npm start`
- Node Version: 16+

✅ Sistema pronto para deploy!