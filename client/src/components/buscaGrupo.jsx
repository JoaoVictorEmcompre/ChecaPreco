// components/buscaGrupo.jsx
import { useRef } from "react";
import { Paper, InputBase, IconButton, Box, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

export default function CampoDeBuscaGrupo({ value, onChange, onSubmit, onActivate }) {
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        onActivate?.(true);
        onSubmit(value);
    };

    const handleFocus = () => onActivate?.(true);

    const handleChange = (e) => {
        onActivate?.(true);
        onChange(e.target.value);
    };

    return (
        <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box sx={{ width: '100%', maxWidth: 400, mb: 0.5 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        ml: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    <CategoryOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                    Grupo do Produto
                </Typography>
            </Box>
            <Paper
                component="form"
                sx={{
                    p: "4px 6px",
                    display: "flex",
                    alignItems: "center",
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 3,
                    backgroundColor: '#fff',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    '&:focus-within': {
                        borderColor: '#CB3B31',
                        boxShadow: '0 0 0 3px rgba(203, 59, 49, 0.1)',
                    },
                }}
                onSubmit={handleSubmit}
            >
                <InputBase
                    inputRef={inputRef}
                    sx={{ ml: 1.5, flex: 1, fontSize: '0.875rem' }}
                    placeholder="Digite o codigo do grupo"
                    inputProps={{ "aria-label": "campo de busca por grupo" }}
                    value={value}
                    onFocus={handleFocus}
                    onChange={handleChange}
                />
                <IconButton
                    type="submit"
                    sx={{
                        p: '8px',
                        color: '#CB3B31',
                        bgcolor: 'rgba(203, 59, 49, 0.08)',
                        '&:hover': { bgcolor: 'rgba(203, 59, 49, 0.15)' },
                    }}
                    aria-label="Buscar por grupo"
                >
                    <SearchIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
            </Paper>
        </Box>
    );
}
