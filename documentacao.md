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
├── docker-compose.yml        # produção: checapreco-web + checapreco-api atrás do Traefik da VPS
├── .gitattributes            # força LF (Dockerfile/nginx/YAML criados no Windows)
├── .github/workflows/deploy.yml  # deploy automático na VPS a cada push na main
├── documentacao.md           # este arquivo
│
├── client/                   # Frontend React (Vite)
│   ├── .env.development / .env.production / .env.test   # definem BASE_URL do Vite
│   ├── vite.config.js        # proxy /api -> http://localhost:5000 (só em dev)
│   ├── Dockerfile            # build do Vite + Nginx servindo o dist
│   ├── nginx.conf            # SPA fallback (try_files) e cache dos assets
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
    ├── Dockerfile             # node:20-alpine, npm ci --omit=dev
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
        ├── promocao.js         # GET  /api/promocao?grupo=  -> promoção ativa do grupo (referenceCode)
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
Em produção, esse arquivo é **opcional**: se existir em `/srv/docker/apps/ChecaPreco/server/.env` na VPS, o compose carrega ele (`env_file` com `required: false`); se não existir, o código cai nos padrões (porta `5000` e IP público do PCP). O deploy não apaga esse arquivo.

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
- Endpoints usados: `/pcp/cnpj/{cnpj}`, `/pcp/combo/{groupCode}`, `/pcp/promocao/grupo/{grupo}`.

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
   `EAN → GET /api/ean (resolve SKU) → preço + combo (em paralelo) → estoque + promoção do grupo (em paralelo, usando o referenceCode do preço) → pedidos de compra do grupo`

2. **Por código "padrão"** (campo de EAN mas digitando um código de grupo direto, não escaneado):
   `código → preço + combo (em paralelo) → estoque + promoção do grupo (em paralelo, usando o referenceCode do preço) → pedidos de compra do grupo`

3. **Por "código do grupo"** (campo dedicado, `buscaGrupo.jsx`, ativa o modo `isOn`):
   `código (tratado como referenceCode) → estoque → extrai productCode do 1º item → preço + combo + promoção do grupo (em paralelo) → pedidos de compra do grupo`

Em todos os casos, as chamadas são paralelas (`Promise.allSettled`/`Promise.all`). A **promoção** é consultada pelo código do grupo (`referenceCode`), então nos fluxos de EAN e "padrão" ela só sai depois do preço, junto com o estoque — isso foi uma otimização feita porque antes eram sequenciais e cada busca demorava bem mais.

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

O projeto roda na **VPS de produção da BF Colchões / BF Casa** (a mesma de `felizacordarcolchoes.com.br`), em Docker, atrás do **Traefik v2.11** que já atende os outros projetos. O domínio **bfmoda.com.br** (DNS na Cloudflare, registros A em modo *DNS only*) aponta para o IP da VPS, e o Traefik separa o tráfego pelo `Host`.

> Até a migração, o projeto rodava numa VM separada (sem Docker, deploy manual com PM2). Essa VM foi desativada.

### Arquitetura

| Container | Serviço | Porta interna | Rota no Traefik |
|---|---|---|---|
| `checapreco-web` | Nginx servindo o build do Vite | 80 | `Host(bfmoda.com.br) \|\| Host(www.bfmoda.com.br)` |
| `checapreco-api` | Express (`node index.js`) | 5000 | mesmo Host **&& PathPrefix(/api)**, sem strip |

- As rotas ficam em **labels** no `docker-compose.yml` (não no `dynamic.yml` do proxy).
- A regra do api é mais longa que a do web, então o Traefik manda `/api/*` para o Express e todo o resto para o Nginx.
- Sem strip: o Express continua recebendo `/api/...`, igual em desenvolvimento.
- Os dois containers entram só na rede externa `web` e usam `expose:` (nenhuma porta publicada no host).
- O api tem healthcheck em `/api/ping`; o Traefik só manda tráfego quando ele está healthy.
- Certificado Let's Encrypt emitido automaticamente pelo Traefik (resolver `le`).
- As chamadas para TOTVS e PCP saem pelo IP público da VPS.

### Deploy automático

Push na `main` → GitHub Actions (`.github/workflows/deploy.yml`) entra por SSH na VPS e roda:

```bash
set -e
cd /srv/docker/apps/ChecaPreco
git pull --ff-only origin main
docker compose build
docker compose up -d --remove-orphans
```

Secrets necessários no repositório: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (os mesmos dos outros projetos da VPS). Também dá para disparar manualmente pela aba Actions (`workflow_dispatch`).

### Deploy manual (se o Actions estiver fora)

```bash
cd /srv/docker/apps/ChecaPreco
git pull --ff-only origin main
docker compose build && docker compose up -d --remove-orphans
```

### Comandos úteis

```bash
docker compose ps
docker logs -f --tail 100 checapreco-api
docker logs -f --tail 100 checapreco-web
curl -s https://bfmoda.com.br/api/ping
```

### Cuidados

- **`git pull --ff-only` falha se houver alteração local na VPS.** Não edite arquivos versionados direto na VPS; o único arquivo local permitido é `server/.env`.
- **`client/.env.production` é embutido no build.** Nada sensível pode ir para ele (tudo que o Vite lê vai para o JavaScript público).

## 13. Pontos de atenção / débito técnico conhecido

- **Credenciais hardcoded**: `client_secret` do ERP (`server/routes/login.js`) e usuário/senha fixos do login automático (`client/src/service/login.services.js`). **Risco real**: a API do TOTVS é acessível pela internet, então quem tiver esses valores gera token direto, sem passar pelo app. Além disso, o usuário/senha do login automático vão para o JavaScript público e o token do ERP fica no navegador. Correção planejada: login feito pelo backend com credenciais em `server/.env`, token guardado só no servidor, e rotação das credenciais atuais.
- **Workaround `validaDesc`**: força desconto "1" → "10" (ver seção 8). É um patch, não uma correção — o bug real está na origem dos dados (sistema PCP).
- **Sem testes automatizados** e **sem TypeScript**: qualquer mudança na lógica de cálculo de preço (seção 8) merece teste manual cuidadoso, já que não há rede de segurança automatizada.
- **`server/routes/ean.js`** desativa TLS só para aquela chamada (ver seção 6) — se um dia o certificado do host for corrigido, dá pra remover esse workaround.
