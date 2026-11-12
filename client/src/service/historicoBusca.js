// Últimas pesquisas, salvas no localStorage (por aparelho/navegador)
const CHAVE = "checapreco:ultimasPesquisas";
const MAX_ITENS = 10;

export function lerHistorico() {
    try {
        const lista = JSON.parse(localStorage.getItem(CHAVE) || "[]");
        if (!Array.isArray(lista)) return [];
        return lista
            .filter(i => i && typeof i.codigo === "string" && (i.modo === "item" || i.modo === "grupo"))
            .slice(0, MAX_ITENS);
    } catch {
        return [];
    }
}

function gravar(lista) {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(lista));
    } catch {
        // storage indisponível/cheio: o histórico simplesmente não persiste
    }
    return lista;
}

// Move a pesquisa para o topo (sem duplicar) e limita o tamanho da lista
export function adicionarAoHistorico(codigo, modo, nome = "", grupo = "") {
    const resto = lerHistorico().filter(i => !(i.codigo === codigo && i.modo === modo));
    return gravar([{codigo, modo, nome, grupo, data: Date.now()}, ...resto].slice(0, MAX_ITENS));
}

export function limparHistorico() {
    return gravar([]);
}

export function removerDoHistorico(codigo, modo) {
    return gravar(lerHistorico().filter(i => !(i.codigo === codigo && i.modo === modo)));
}
