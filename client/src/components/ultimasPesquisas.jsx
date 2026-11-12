import {Box, Button, ButtonBase, IconButton, Typography} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";

function formatarDataHora(ms) {
    if (!ms) return "";
    const d = new Date(ms);
    if (isNaN(d.getTime())) return "";
    const data = d.toLocaleDateString("pt-BR");
    const hora = d.toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"});
    return `${data} às ${hora}`;
}

export default function UltimasPesquisas({itens, onSelect, onRemove, onClear, disabled = false}) {
    if (!itens || itens.length === 0) return null;

    return (
        <Box sx={{mx: "auto", maxWidth: 360, mb: 2}}>
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5}}>
                <Typography variant="caption" sx={{color: "#667085", fontWeight: 600}}>
                    Últimas pesquisas
                </Typography>
                <Button
                    size="small"
                    onClick={onClear}
                    disabled={disabled}
                    sx={{
                        minWidth: 0,
                        py: 0,
                        px: 0.75,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "none",
                        color: "#CB3B31",
                        "&:hover": {backgroundColor: "#fdecea"},
                    }}
                >
                    Limpar tudo
                </Button>
            </Box>
            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                {itens.map((item) => {
                    const dataHora = formatarDataHora(item.data);
                    return (
                        <Box
                            key={`${item.modo}-${item.codigo}`}
                            sx={{
                                position: "relative",
                                borderRadius: 3,
                                backgroundColor: "#fff",
                                border: "1px solid #e4e7ec",
                                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                                transition: "box-shadow 150ms ease-out, border-color 150ms ease-out",
                                "&:hover": {borderColor: "#CB3B31", boxShadow: "0 2px 8px rgba(203, 59, 49, 0.15)"},
                            }}
                        >
                            <ButtonBase
                                onClick={() => onSelect(item)}
                                disabled={disabled}
                                aria-label={`Repetir pesquisa ${item.codigo}`}
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    gap: 1.5,
                                    textAlign: "left",
                                    p: 1.5,
                                    pr: 5,
                                    borderRadius: 3,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 36, height: 36, flexShrink: 0, borderRadius: "50%",
                                        backgroundColor: "#fdecea", color: "#CB3B31",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >
                                    <HistoryIcon fontSize="small"/>
                                </Box>
                                <Box sx={{minWidth: 0, flex: 1}}>
                                    {/* Cada trecho é indivisível: se faltar espaço, quebra entre "Código" e "Grupo", nunca no meio do número */}
                                    <Typography variant="body2" sx={{fontWeight: 700, color: "#222"}}>
                                        {item.modo === "grupo" ? (
                                            <Box component="span" sx={{whiteSpace: "nowrap"}}>Grupo: {item.codigo}</Box>
                                        ) : (
                                            <>
                                                <Box component="span" sx={{whiteSpace: "nowrap"}}>
                                                    Código: {item.codigo}
                                                    {item.grupo && <Box component="span" aria-hidden="true" sx={{ml: 0.75, fontWeight: 400}}>•</Box>}
                                                </Box>
                                                {item.grupo && (
                                                    <>
                                                        {" "}
                                                        <Box component="span" sx={{whiteSpace: "nowrap"}}>Grupo: {item.grupo}</Box>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Typography>
                                    {item.nome && (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "#475467",
                                                lineHeight: 1.3,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {item.nome}
                                        </Typography>
                                    )}
                                    {dataHora && (
                                        <Typography variant="caption" sx={{color: "#98a2b3"}}>
                                            {dataHora}
                                        </Typography>
                                    )}
                                </Box>
                            </ButtonBase>
                            <IconButton
                                size="small"
                                onClick={() => onRemove(item)}
                                disabled={disabled}
                                aria-label={`Remover ${item.codigo} das últimas pesquisas`}
                                sx={{position: "absolute", top: 6, right: 6, color: "#98a2b3"}}
                            >
                                <CloseIcon fontSize="small"/>
                            </IconButton>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
