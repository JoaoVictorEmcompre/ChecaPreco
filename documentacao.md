# ChecaPreco — Documentação do Projeto

> Este arquivo existe para te orientar quando você (ou uma IA) voltar nesse projeto depois de um tempo sem mexer. Ele descreve o que o sistema faz, como está organizado, e a lógica de negócio por trás de cada parte. Se você for pedir ajuda de uma IA nesse projeto, basta falar para ela ler este arquivo primeiro.

## 1. O que é o projeto

**ChecaPreco** é uma ferramenta interna da **Bandfashion** usada por vendedores em loja física para consultar, a partir de um código de barras (EAN), código de grupo, ou CNPJ de cliente:

- Preço do produto (normal, promocional e com desconto por CNPJ)
- Estoque disponível, organizado pela grade do produto (cor, tamanho, ou ambos)
- Combos ativos ("leve X unidades e pague Y% menos")
- Pedidos de compra em andamento (mercadoria que já foi comprada da fábrica e está a caminho da loja)

Não é um comparador de preço com concorrentes — é uma ferramenta de consulta usada no balcão/PDV, com forte foco em uso no celular/tablet.

## 2. Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Express 5 (só um proxy/orquestrador, sem banco de dados próprio) |
| Frontend | React 19 + Vite 6 + Material UI (MUI) 7 |
| Leitura de código de barras | `@zxing/browser` + `@zxing/library` (câmera do celular/tablet) |
| HTTP client | `axios` (front e back) |
| Orquestração dev | `concurrently` (raiz do projeto, sobe front + back juntos) |

Não existe TypeScript, não existem testes automatizados, e **não existe banco de dados**: o backend é um proxy fino que conversa com duas APIs externas (ver seção 6).

## 3. Estrutura de pastas

```
ChecaPreco/
├── package.json              # raiz — só o script "dev" (concurrently) e "install:all"
├── documentacao.md           # este arquivo
│
├── client/                   # Frontend React (Vite)
│   ├── .env.development / .env.production / .env.test   # definem BASE_URL do Vite
│   ├── vite.config.js        # proxy /api -> http://localhost:5000
│   └── src/
│       ├── main.jsx / App.jsx        # bootstrap, tema MUI, login automático, rotas
│       ├── pages/
│       │   ├── home.jsx              # tela principal — orquestra toda a busca
│       │   └── login.jsx             # wrapper simples que renderiza LoginForm
│       ├── components/
│       │   ├── campoBuscaBase.jsx    # input de busca reutilizável (Paper+InputBase+botão)
│       │   ├── busca.jsx             # busca por EAN + leitor de câmera (usa campoBuscaBase)
│       │   ├── buscaGrupo.jsx        # busca por código de grupo (usa campoBuscaBase)
│       │   ├── buscaDesc.jsx         # busca por CNPJ (usa campoBuscaBase)
│       │   ├── tabela.jsx            # ★ lógica central: cálculo de preço, tabela de estoque, modal de pedidos de compra
│       │   ├── header.jsx            # cabeçalho vermelho com logo e saudação
│       │   ├── loginForm.jsx, loginWrapper.jsx, usuarioField.jsx, senhaField.jsx  # tela de login manual (pouco usada)
│       └── service/                  # uma função por recurso, todas chamam a própria API do backend
│           ├── login.services.js, token.js
│           ├── price.services.js, stock.services.js, ean.js
│           ├── cnpj.services.js, combo.services.js, promocao.services.js
│           └── pedidosCompra.services.js
│
└── server/                   # Backend Express (proxy)
    ├── index.js               # bootstrap do Express, monta rotas, tratamento de erro global
    ├── .env                   # local, NÃO versionado (só existe na sua máquina) — ver seção 5
    ├── .env.example           # documenta as variáveis disponíveis
    ├── utils/
    │   └── erroApi.js         # classificador central de erros (timeout, conexão recusada, HTTP xxx...)
    └── routes/
        ├── login.js            # POST /api/login          -> autentica no ERP TOTVS Moda
        ├── preco.js            # POST /api/preco           -> preço + referenceCode do grupo
        ├── estoque.js          # POST /api/estoque         -> saldo de estoque por grupo
        ├── ean.js              # GET  /api/ean             -> resolve EAN -> SKU
        ├── cnpj.js             # GET  /api/cnpj            -> % de desconto do CNPJ
        ├── combo.js            # GET  /api/combo           -> combos "leve X pague Y"
        ├── promocao.js         # GET  /api/promocao        -> promoção ativa do SKU
        └── pedidosCompra.js    # POST /api/pedidos-compra  -> pedidos de compra em andamento
```

## 4. Como rodar o projeto

**Primeira vez** (instala tudo):
```
npm install            # instala o concurrently na raiz
npm run install:all    # instala server/ e client/
```

**Rodar em desenvolvimento** (sobe backend + frontend juntos):
```
npm run dev
```
Isso sobe o backend em `http://localhost:5000` e o frontend em `http://localhost:5173` (o Vite tem um proxy que redireciona `/api/*` pro backend). Se quiser rodar cada um separado: `npm run dev --prefix server` ou `npm run dev --prefix client`.

**Build de produção do frontend:**
```
npm run build --prefix client
```

⚠️ **Cuidado com processos zumbis no Windows**: se o servidor não subir e o log disser "porta 5000 já está em uso", provavelmente sobrou um `node.exe` de uma execução anterior que o `Ctrl+C`/fechamento do terminal não matou. O `pkill` do Git Bash **não mata processos nativos do Windows** — use PowerShell:
```powershell
Get-Process node | Stop-Process -Force
```

## 5. Variáveis de ambiente

### `server/.env` (não versionado — cada ambiente tem o seu)

| Variável | Uso | Padrão se ausente |
|---|---|---|
| `PORT` | Porta do Express | `5000` |
| `PCP_BASE_URL` | Endereço base do sistema interno PCP (desconto CNPJ, combo, promoção, pedidos de compra) | `http://187.95.116.54:9989` (produção) |

Isso permite que, **rodando local**, as chamadas ao PCP vão para o IP da rede local (`192.168.3.214:8090`) sem precisar mexer no código — basta ter um `server/.env` local com:
```
PCP_BASE_URL=http://192.168.3.214:8090
```
Em produção, esse arquivo simplesmente não existe (é ignorado pelo `.gitignore`), então o código cai no IP público padrão automaticamente.

### `client/.env.development` / `.env.production` / `.env.test`

Só definem `BASE_URL` (usado pelo Vite como base path e pelo React Router como `basename`):
- dev e produção: `/`
- test: `/teste/`

> ⚠️ Apesar do nome, isso **não** indica um ambiente de homologação separado — ver seção 12. Hoje existe só uma VM (produção), e o repositório nela fica num caminho que por acaso contém `teste` no nome. O `.env.test` provavelmente é resquício de uma configuração antiga ou de um `npm run build -- --mode test` que não é usado no fluxo de deploy atual.

## 6. Integrações externas (de onde vêm os dados)

Não há banco de dados — **tudo vem de duas APIs de terceiros**:

### a) ERP TOTVS Moda / Bandvest (dados de produto)
- Login/preço/estoque: `https://ws.facolchoes.com.br:9443/api/totvsmoda/...`
- Produto por EAN: `https://bandvest.vcenter.com.br:9443/api/totvsmoda/...`
- Autenticação OAuth2 `password grant`, com `client_id`/`client_secret` **hardcoded** em `server/routes/login.js` (não são segredos sensíveis do nosso lado, mas idealmente deveriam estar em variável de ambiente).
- A rota `/api/ean` desativa a verificação de certificado TLS (`rejectUnauthorized: false`) só para essa chamada específica, pois o certificado do host `bandvest.vcenter.com.br` aparentemente não é confiável por padrão.

### b) Sistema interno "PCP" (regras de desconto/combo/promoção/pedido de compra)
- Base: `PCP_BASE_URL` (ver seção 5) — normalmente só acessível de dentro da rede da empresa/VPN.
- Endpoints usados: `/pcp/cnpj/{cnpj}`, `/pcp/combo/{groupCode}`, `/pcp/promocao/{sku}`.

### Credenciais e login automático

O frontend **se autentica sozinho** ao abrir (`client/src/service/login.services.js`, função `loginAutomatico`), usando um usuário fixo hardcoded:
```
usuário: sergio1
senha: 7854
```
Isso significa que, na prática, todo mundo que abre o app entra como o mesmo usuário genérico ("vendedora"). Existe uma tela de login manual (`/Login`) mas ela não é o fluxo padrão — só é usada se, por algum motivo, o login automático falhar e o usuário for redirecionado manualmente.

## 7. Fluxo de uma busca (o coração do sistema)

Tudo acontece em `client/src/pages/home.jsx`, função `handleSearch`. Existem **3 formas de busca**, cada uma dispara um fluxo ligeiramente diferente:

1. **Por EAN** (código de barras, 13+ dígitos, digitado ou escaneado pela câmera em `busca.jsx`):
   `EAN → GET /api/ean (resolve SKU) → preço + combo + promoção (em paralelo) → estoque do grupo → pedidos de compra do grupo`

2. **Por código "padrão"** (campo de EAN mas digitando um código de grupo direto, não escaneado):
   `código → preço + combo + promoção (em paralelo) → estoque do grupo → pedidos de compra do grupo`

3. **Por "código do grupo"** (campo dedicado, `buscaGrupo.jsx`, ativa o modo `isOn`):
   `código (tratado como referenceCode) → estoque → extrai productCode do 1º item → preço + combo + promoção (em paralelo) → pedidos de compra do grupo`

Em todos os casos, as chamadas de **preço + combo + promoção** são feitas com `Promise.allSettled` (paralelas, não sequenciais) — isso foi uma otimização feita porque antes eram sequenciais e cada busca demorava bem mais.

A busca por **pedidos de compra** só acontece depois que se tem a lista completa de SKUs do grupo (todas as variações de cor/tamanho), porque ela precisa saber todos os SKUs pra filtrar corretamente (ver seção 9).

## 8. Cálculo de preço final (`client/src/components/tabela.jsx`, função `calcularPrecoFinal`)

Essa é a regra de negócio mais importante do sistema. Combina 3 fontes de dado (preço normal do ERP, % de desconto do CNPJ, e promoção do PCP) em 4 cenários:

| Cenário | Cálculo | O que aparece |
|---|---|---|
| Sem promoção, sem desconto CNPJ | preço normal | "Preço: R$ X" |
| Só desconto CNPJ | `precoNormal × (1 − desconto/100)` | "De: preço normal" (riscado) → "Para você: preço final" |
| Só promoção | preço promocional do PCP | "De: preço anterior" (riscado) → "Preço: preço promocional" |
| Promoção **+** desconto CNPJ juntos | `precoPromocional × (1 − desconto/100)` — **o desconto do CNPJ é aplicado em cima do preço já promocional**, não do preço cheio | "De: preço anterior" e "Promoção: preço promocional" (ambos riscados) → "Para você: preço final" |

**Combos**: cada combo retornado aplica seu próprio percentual **em cima do preço já calculado acima** (com promoção/CNPJ já incluídos), não em cima do preço cheio.

**Workaround conhecido**: em `home.jsx`, a função `validaDesc` força um desconto de `"1"` para virar `"10"`. Isso existe porque o sistema PCP às vezes retorna o percentual de desconto truncado/errado. Se um dia notar desconto de CNPJ estranho, a causa provavelmente é essa — a correção certa seria investigar por que o PCP retorna esse valor errado, não manter esse patch para sempre.

## 9. Lógica de variação de grade (cor/tamanho)

Usada em dois lugares: na tabela de estoque principal e no modal de pedidos de compra. Função `identificarTipoGrupo` (`tabela.jsx`):

- **`VAR_TAMANHO`**: produto tem 1 cor só, vários tamanhos → mostra só coluna Tamanho
- **`VAR_COR`**: produto tem 1 tamanho só, várias cores → mostra só coluna Cor
- **`VAR_AMBOS`**: várias cores e vários tamanhos → mostra matriz Cor × Tamanho
- **`FIXO`**: sem variação → mostra só "Sem variação"

Essa mesma classificação decide quais colunas aparecem no modal de pedidos de compra (não faz sentido mostrar coluna de Tamanho se o produto só varia por cor, por exemplo).

## 10. Pedidos de compra em andamento (feature "Pedido")

Quando um produto tem pedido de compra pendente (mercadoria a caminho), aparece um **chip verde "Pedido"** acima da tabela de estoque. Clicando, abre um modal com pedido, cor/tamanho (conforme a grade), quantidade e data de previsão de entrega.

### Como funciona (backend: `server/routes/pedidosCompra.js`)

1. O frontend manda **todos os SKUs (productCode) do grupo pesquisado** (todas as variações de cor/tamanho).
2. O backend chama `purchase-order/v2/search` da TOTVS filtrando por `productCodeList`, `orderStatusList: [1]` (pedidos abertos) e `branchCodeList: [1]`.
3. **Limite de 50 SKUs por chamada**: a API da TOTVS rejeita `productCodeList` com mais de 50 itens (erro `ListExceeded`). Por isso os SKUs são divididos em lotes de 50 e as chamadas disparadas em paralelo (`Promise.all`).
4. **Deduplicação**: como um mesmo pedido pode ter produtos espalhados em lotes diferentes, ele pode voltar na resposta de mais de uma chamada. O backend deduplica por `pedido+produto+cor+tamanho` antes de devolver, senão a mesma linha apareceria duplicada no modal.
5. Também filtra, dentro de cada pedido, só os itens cujo `productCode` está no grupo pesquisado — um pedido de compra real pode ter dezenas de produtos diferentes, e só interessam os do grupo atual.

### Modal (frontend: `tabela.jsx`, componente `PedidosCompraDialog`)

- Fundo escurecido (overlay), largura ~ tela toda com margem mínima (pensado pra mobile).
- Cabeçalho da tabelinha fixo (`stickyHeader` do MUI) — só as linhas rolam.
- Indicador visual (seta + gradiente) quando há mais itens abaixo do que cabe na tela, some quando chega ao final.
- Botão X pra fechar.

## 11. Tratamento de erros (backend)

`server/utils/erroApi.js` centraliza a classificação de qualquer erro de chamada externa:

| Tipo | Quando acontece |
|---|---|
| `TIMEOUT` | API de destino não respondeu em 5s |
| `CONEXAO_RECUSADA` | Serviço fora do ar / porta fechada |
| `HOST_NAO_ENCONTRADO` | Erro de DNS |
| `SEM_RESPOSTA` | Erro de rede genérico sem resposta |
| `ERRO_HTTP_xxx` | A API respondeu, mas com erro (401, 404, 500...) |

Toda rota loga de forma padronizada: `[TAG] TIPO ao chamar endpoint | contexto | descrição | corpo de erro da API (se houver)`. Rotas "auxiliares" (`combo`, `promocao`, `pedidos-compra`) tratam indisponibilidade (timeout/conexão/DNS) de forma tolerante — devolvem lista vazia em vez de quebrar a busca principal, já que a ausência de combo/promoção/pedido não deveria impedir o vendedor de ver preço e estoque.

Além disso, `server/index.js` tem: middleware final de erro (pega exceções não tratadas em qualquer rota), handlers globais de `unhandledRejection`/`uncaughtException`, e tratamento de `EADDRINUSE` (porta ocupada) com mensagem clara em vez de crash silencioso.

## 12. Deploy / Produção

O projeto roda numa **VM única** (sem Docker, sem CI/CD — o deploy é manual, via SSH) que atende o domínio **bfmoda.com.br**.

### Estrutura na VM

| O quê | Onde | Observação |
|---|---|---|
| Repositório git (front + back) | `/var/www/teste/ChecaPreco` | Apesar do `teste` no caminho, **essa é a única VM/ambiente que existe** — não é staging, é a produção real. |
| Frontend (arquivos estáticos do build) | `/var/www/html` | Servido por um webserver (nginx/apache) que fica **fora deste repositório** — não temos visibilidade da configuração dele a partir daqui. |
| Backend (Node/Express rodando) | `/root/minha-aplicacao/public` | Gerenciado pelo **PM2**, processo chamado `checapreco-back`. |

Existe, necessariamente, um proxy reverso configurado na VM (provavelmente nginx) que decide o que vai para os arquivos estáticos em `/var/www/html` e o que vai para o backend Node (porta `5000` por padrão, ver seção 5) — essa configuração também não está neste repositório.

### Passo a passo de deploy (manual — rodar comando por comando na VM)

Não existe automação: cada deploy é feito digitando esses comandos na SSH, um de cada vez.

**1. Atualiza o repositório**
```bash
cd /var/www/teste/ChecaPreco
git pull
```

**2. Instala dependências e builda o frontend**
```bash
cd /var/www/teste/ChecaPreco/client
npm install
npm run build
```
> O `npm install` aqui não estava no passo a passo original, mas é importante incluir: o `package.json`/`package-lock.json` do `client` mudou recentemente (removemos `@sentry/react`, `html5-qrcode`, `vite-plugin-mkcert`, adicionamos `@zxing/library`). Sem reinstalar, o build pode usar dependências desatualizadas ou faltando.

**3. Publica o frontend (substitui os arquivos estáticos servidos)**
```bash
rm -rf /var/www/html/*
cp -r /var/www/teste/ChecaPreco/client/dist/* /var/www/html/
```

**4. Publica o backend**
```bash
rm -rf /root/minha-aplicacao/public/*
cp -r /var/www/teste/ChecaPreco/server/* /root/minha-aplicacao/public/
```

**5. Instala dependências do backend e reinicia via PM2**
```bash
cd /root/minha-aplicacao/public
npm install
pm2 restart checapreco-back
```

> Usei caminhos absolutos em vez de `cd`s encadeados (como no passo a passo original, que dependia do diretório em que você ainda estava do passo anterior) — assim cada bloco funciona sozinho, mesmo que você rode fora de ordem ou depois de sair/voltar da SSH.

### Cuidados importantes (ler antes de rodar)

- **O passo 4 (`rm -rf .../public/*`) apaga qualquer `.env` que exista em `/root/minha-aplicacao/public`.** Hoje isso não é um problema porque a produção não precisa de `server/.env` (ela já cai nos valores padrão corretos — porta `5000` e `PCP_BASE_URL` público, ver seção 5). Mas se um dia alguém criar um `.env` ali pra sobrescrever algo em produção, **ele vai ser apagado a cada deploy** — nesse caso, seria preciso copiar ele de volta manualmente depois do passo 4, antes do `npm install`/`pm2 restart`.
- **O passo 1 (`git pull`) falha se houver alterações locais não commitadas na VM.** Se isso acontecer, rode `git status` primeiro pra ver o que é, antes de decidir descartar (`git checkout -- .`) ou não.
- **Se o processo `checapreco-back` não existir ainda no PM2** (ex.: VM nova, ou processo removido), o `pm2 restart` do passo 5 vai falhar dizendo que o processo não existe. Nesse caso, o comando certo pra criar ele pela primeira vez seria `pm2 start index.js --name checapreco-back` (a partir de `/root/minha-aplicacao/public`), mas isso é só pra referência — normalmente não deveria ser necessário no dia a dia.

## 13. Pontos de atenção / débito técnico conhecido

- **Credenciais hardcoded**: `client_secret` do ERP (`server/routes/login.js`) e usuário/senha fixos do login automático (`client/src/service/login.services.js`). Não são catastróficos (a API do ERP já é o limite de segurança real), mas o ideal seria mover para variáveis de ambiente.
- **Workaround `validaDesc`**: força desconto "1" → "10" (ver seção 8). É um patch, não uma correção — o bug real está na origem dos dados (sistema PCP).
- **Sem testes automatizados** e **sem TypeScript**: qualquer mudança na lógica de cálculo de preço (seção 8) merece teste manual cuidadoso, já que não há rede de segurança automatizada.
- **`server/routes/ean.js`** desativa TLS só para aquela chamada (ver seção 6) — se um dia o certificado do host for corrigido, dá pra remover esse workaround.