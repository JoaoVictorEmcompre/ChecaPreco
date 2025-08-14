// components/buscaGrupo.jsx
import { useRef } from "react";
import { Paper, InputBase, IconButton, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <Paper
                component="form"
                sx={{
                    p: "2px 8px",
                    display: "flex",
                    alignItems: "center",
                    width: 360,
                    borderRadius: 6,
                    backgroundColor: "#f1f5f9",
                }}
                onSubmit={handleSubmit}
            >
                <InputBase
                    inputRef={inputRef}
                    sx={{ ml: 1, flex: 1, fontSize: 14 }}
                    placeholder="Digite o código do grupo"
                    inputProps={{ "aria-label": "campo de busca por grupo" }}
                    value={value}
                    onFocus={handleFocus}
                    onChange={handleChange}
                />
                <IconButton type="submit" sx={{ p: "10px" }} aria-label="Buscar por grupo">
                    <SearchIcon />
                </IconButton>
            </Paper>
        </Box>
    );
}