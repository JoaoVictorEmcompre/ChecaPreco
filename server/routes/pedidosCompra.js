const express = require('express');
const axios = require('axios');
const {logErroApi, TIPOS_INDISPONIVEL} = require('../utils/erroApi');
const router = express.Router();

// A API da TOTVS rejeita filter.productCodeList com mais de 50 itens (erro "ListExceeded").
const TAMANHO_LOTE = 50;

function dividirEmLotes(array, tamanho) {
    const lotes = [];
    for (let i = 0; i < array.length; i += tamanho) {
        lotes.push(array.slice(i, i + tamanho));
    }
    return lotes;
}

router.post('/', async (req, res) => {
    const {skus, token} = req.body;

    if (!Array.isArray(skus) || skus.length === 0 || !token) {
        return res.status(400).json({error: 'skus (array) e token são obrigatórios.'});
    }

    const url = 'purchase-order/v2/search';
    const skuSet = new Set(skus.map(String));
    const lotes = dividirEmLotes(skus, TAMANHO_LOTE);

    try {
        const respostas = await Promise.all(
            lotes.map(lote =>
                axios.post(
                    'https://ws.facolchoes.com.br:9443/api/totvsmoda/purchase-order/v2/search',
                    {
                        filter: {
                            branchCodeList: [1],
                            productCodeList: lote.map(Number),
                            orderStatusList: [1],
                        },
                        expand: 'items',
                        page: 1,
                        pageSize: 100,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        timeout: 5000,
                    }
                )
            )
        );

        // Um mesmo pedido pode ter produtos espalhados em mais de um lote (chunk),
        // nesse caso ele volta na resposta de cada lote em que aparece — dedup por
        // pedido+produto+cor+tamanho evita contar a mesma linha mais de uma vez.
        const pedidosPorChave = new Map();

        respostas.forEach(response => {
            (response.data?.items || []).forEach(order => {
                (order.items || []).forEach(item => {
                    if (!skuSet.has(String(item.productCode))) return;

                    const chave = `${order.orderCode}-${item.productCode}-${item.colorName}-${item.sizeName}`;
                    if (pedidosPorChave.has(chave)) return;

                    pedidosPorChave.set(chave, {
                        orderCode: order.orderCode,
                        productCode: item.productCode,
                        referenceCode: item.referenceCode,
                        colorName: item.colorName,
                        sizeName: item.sizeName,
                        quantity: item.quantity,
                        deliveryForecastDate: item.deliveryForecastDate || order.deliveryForecastDate || null,
                        deliveryDeadlineDate: item.deliveryDeadlineDate || order.deliveryDeadlineDate || null,
                    });
                });
            });
        });

        res.json({pedidos: [...pedidosPorChave.values()]});
    } catch (err) {
        const {status, tipo, descricao} = logErroApi('PEDIDOS_COMPRA', {
            url,
            err,
            contexto: `skus=${skus.join(',')} (${lotes.length} lote(s))`,
        });

        if (TIPOS_INDISPONIVEL.includes(tipo)) {
            return res.json({pedidos: []});
        }

        res.status(status).json({error: 'Erro ao consultar pedidos de compra', tipo, detalhe: descricao});
    }
});

module.exports = router;
