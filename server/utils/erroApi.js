function classificarErro(err) {
    if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message)) {
        return {
            tipo: 'TIMEOUT',
            status: 504,
            descricao: 'A API de destino não respondeu dentro do tempo limite.',
        };
    }

    if (err.code === 'ECONNREFUSED') {
        return {
            tipo: 'CONEXAO_RECUSADA',
            status: 502,
            descricao: 'A API de destino recusou a conexão (pode estar fora do ar ou inacessível na rede).',
        };
    }

    if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
        return {
            tipo: 'HOST_NAO_ENCONTRADO',
            status: 502,
            descricao: 'Não foi possível resolver o endereço da API de destino.',
        };
    }

    if (!err.response) {
        return {
            tipo: 'SEM_RESPOSTA',
            status: 502,
            descricao: err.message,
        };
    }

    return {
        tipo: `ERRO_HTTP_${err.response.status}`,
        status: err.response.status,
        descricao: err.response.statusText || err.message,
    };
}

// Tipos de erro que indicam que a API externa está indisponível/inacessível,
// em vez de ter respondido com um erro de negócio.
const TIPOS_INDISPONIVEL = ['TIMEOUT', 'SEM_RESPOSTA', 'CONEXAO_RECUSADA', 'HOST_NAO_ENCONTRADO'];

function logErroApi(tag, {url, err, contexto}) {
    const classificacao = classificarErro(err);
    const corpoResposta = err.response?.data;

    console.error(
        `[${tag}] ${classificacao.tipo} ao chamar ${url}` +
        (contexto ? ` | ${contexto}` : '') +
        ` | ${classificacao.descricao}` +
        (corpoResposta ? ` | Resposta da API: ${JSON.stringify(corpoResposta)}` : '')
    );

    return classificacao;
}

module.exports = {classificarErro, logErroApi, TIPOS_INDISPONIVEL};
