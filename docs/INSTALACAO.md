# Instalação

1. Crie uma organização/projeto Supabase exclusivo para Meus Gastos.
2. Execute `supabase/schema.sql` no SQL Editor **do projeto novo**.
3. Em Authentication > Users, crie o usuário que o casal utilizará.
4. Copie `config.example.js` para `config.js` e configure a URL e a chave publishable (ou anon pública) do novo projeto.
5. Para uso local, sirva a pasta por HTTP, por exemplo `python -m http.server 8080`.
6. Para acesso por celular, publique os arquivos em hospedagem estática HTTPS e configure a URL do site em Authentication > URL Configuration.
7. Ative Realtime para `public.expenses` no painel, se desejar sincronização imediata.

## Segurança
Nunca publique service_role, secret key, senha do banco ou senhas de usuários. As políticas RLS limitam os registros ao usuário autenticado. O repositório é público; revise antes de enviar informações pessoais.

## Estado
O banco ainda não foi criado nem conectado nesta etapa. Nenhum histórico de despesas foi importado. O aplicativo deve ser testado em um projeto Supabase separado antes de uso real.
