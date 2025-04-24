# Antes

Crie o subduminio, e faça o direcionamento do mesmo até a pasta do index.js

# Instalação do npm sem sudo

Este guia descreve como instalar o **npm** (Node Package Manager) sem a necessidade de usar `sudo`, configurando o Node.js e o npm em um diretório onde o usuário atual tem permissões de escrita. Abaixo estão as instruções para usar o **nvm** (Node Version Manager) e configurar pacotes globais.

## 1. Instalar o Node.js e npm em um diretório local usando nvm

O **nvm** é a maneira recomendada para instalar o Node.js e o npm sem privilégios de administrador, pois gerencia as versões no diretório `~/.nvm`.

### Passos:
1. **Instale o nvm**:
   Execute o comando abaixo para baixar e instalar o nvm:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```

2. **Atualize o shell**:
   Feche e reabra o terminal ou execute:
   ```bash
   source ~/.bashrc
   ```

3. **Instale o Node.js (que inclui o npm)**:
   Use o nvm para instalar a versão mais recente do Node.js:
   ```bash
   nvm install node
   ```

4. **Verifique a instalação**:
   Confirme que o Node.js e o npm foram instalados corretamente:
   ```bash
   node -v
   npm -v
   ```

O Node.js e o npm agora estão instalados no diretório `~/.nvm`, que não requer permissões de administrador.

## 2. Configurar o diretório de pacotes globais do npm

Para instalar pacotes globais (com `npm install -g`) sem `sudo`, configure um diretório local para armazenar esses pacotes.

### Passos:
1. **Crie um diretório para pacotes globais**:
   ```bash
   mkdir ~/.npm-global
   ```

2. **Configure o npm para usar esse diretório**:
   ```bash
   npm config set prefix '~/.npm-global'
   ```

3. **Adicione o diretório ao PATH**:
   Edite o arquivo `~/.bashrc` ou `~/.zshrc` (dependendo do shell usado) e adicione a linha abaixo:
   ```bash
   export PATH=~/.npm-global/bin:$PATH
   ```

4. **Atualize o shell**:
   ```bash
   source ~/.bashrc
   ```

5. **Teste a configuração**:
   Instale um pacote global para verificar se está funcionando:
   ```bash
   npm install -g create-react-app
   ```

## 3. Verificar permissões

Certifique-se de que os diretórios usados pelo npm têm as permissões corretas para evitar problemas.

### Passos:
1. **Ajuste as permissões dos diretórios**:
   Execute o comando abaixo para garantir que o usuário atual seja o proprietário dos diretórios `~/.npm` (cache) e `~/.npm-global`:
   ```bash
   chown -R $(whoami) ~/.npm ~/.npm-global
   ```

## Notas
- O uso do `nvm` é a abordagem mais prática para gerenciar o Node.js e o npm sem `sudo`.
- Evite usar `sudo` para instalar pacotes globais, pois isso pode causar problemas de permissões em projetos locais.
- Para mais detalhes, consulte a documentação oficial do nvm: https://github.com/nvm-sh/nvm.

Se precisar de mais ajuda, entre em contato!


-----------------------------------------------------------------------

# Configuração do Servidor Node.js com PM2 e Proxy Reverso

Este documento descreve como configurar o gerenciador de processos PM2 para manter uma aplicação Node.js ativa e como configurar um proxy reverso no OpenLiteSpeed para tornar o subdomínio `api-whatsapp.horariux.com` acessível sem especificar a porta.

## Pré-requisitos
- VPS compartilhada na Hostinger com Node.js e NPM instalados.
- Aplicação Node.js (com `index.js`) na pasta:  
  `/home/u758862241/domains/horariux.com/public_html/api-whatsapp.horariux.com/src`.
- Subdomínio `api-whatsapp.horariux.com` configurado no hPanel.
- Acesso SSH ao VPS e credenciais do OpenLiteSpeed Admin.

## Configuração do PM2

Para garantir que o servidor Node.js continue rodando mesmo após fechar o terminal, use o **PM2**, um gerenciador de processos para Node.js.

1. **Instalar o PM2 globalmente**:
   ```bash
   npm install -g pm2
   ```

2. **Iniciar a aplicação com PM2**:
   ```bash
   pm2 start index.js --name api-whatsapp
   ```

3. **Configurar o PM2 para iniciar automaticamente após reinicializações do servidor**:
   ```bash
   pm2 startup
   pm2 save
   ```

4. **Verificar se a aplicação está rodando**:
   ```bash
   pm2 list
   ```

## Configuração do Proxy Reverso no OpenLiteSpeed

Para que o subdomínio `api-whatsapp.horariux.com` seja acessível sem especificar a porta (ex.: `:3000`), configure um proxy reverso no OpenLiteSpeed.

1. **Acessar o painel do OpenLiteSpeed**:
   - No hPanel, vá para **VPS** → **Gerenciar** → **OpenLiteSpeed Admin**.
   - Use as credenciais fornecidas no hPanel para fazer login.

2. **Criar um Virtual Host para o subdomínio**:
   - No painel do OpenLiteSpeed, vá para **Virtual Hosts** → **Add**.
   - Nomeie o Virtual Host como `api-whatsapp.horariux.com`.
   - Configure o **Document Root** para:  
     `/home/u758862241/domains/horariux.com/public_html/api-whatsapp.horariux.com/src`.

3. **Configurar o proxy reverso**:
   - No Virtual Host, vá para **Rewrite** ou **Context**.
   - Adicione a seguinte regra de proxy para redirecionar as requisições para o Node.js (porta 3000):
     ```
     RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P]
     ```


## Teste
- Acesse `http://api-whatsapp.horariux.com` no navegador. A aplicação Node.js deve estar disponível sem a necessidade de especificar a porta.

## Solução de Problemas
- **Aplicação não inicia**: Verifique o status com `pm2 list` e logs com `pm2 logs api-whatsapp`.
- **Erro 503**: Confirme se o Node.js está rodando na porta 3000.
- **Porta bloqueada**: Abra a porta 3000 no firewall:
  ```bash
  sudo ufw allow 3000
  ```

