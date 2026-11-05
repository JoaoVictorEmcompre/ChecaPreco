import {forwardRef} from 'react';
import {Paper, InputBase, IconButton, Box, CircularProgress} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const CampoBuscaBase = forwardRef(function CampoBuscaBase(
    {value, onChange, onSubmit, onFocus, placeholder, inputAriaLabel, submitAriaLabel = 'Buscar', disabled = false, loading = false, children},
    ref
) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (disabled) return;
        onSubmit(value);
    };

    // Tecla "Enter"/"Buscar" do teclado do celular: envia explicitamente e fecha o teclado,
    // para o resultado ficar visível (não depende do envio implícito do formulário)
    const handleKeyDown = (e) => {
        if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
        e.preventDefault();
        if (disabled) return;
        e.currentTarget.blur();
        onSubmit(value);
    };

    return (
        <Box sx={{mb: 2, mx: 'auto', width: '100%', maxWidth: 360}}>
            <Paper
                component="form"
                sx={{
                    p: '2px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: 44,
                    borderRadius: 6,
                    backgroundColor: '#f1f5f9',
                    transition: 'box-shadow 150ms ease-out, background-color 150ms ease-out',
                    ...(disabled && {opacity: 0.7}),
                    '&:focus-within': {
                        backgroundColor: '#fff',
                        boxShadow: '0 0 0 2px #CB3B31',
                    },
                }}
                onSubmit={handleSubmit}
            >
                <InputBase
                    inputRef={ref}
                    sx={{ml: 1, flex: 1, fontSize: 16}}
                    placeholder={placeholder}
                    inputProps={{'aria-label': inputAriaLabel, enterKeyHint: 'search'}}
                    value={value}
                    disabled={disabled}
                    onFocus={onFocus}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => onChange(e.target.value)}
                />
                {children}
                <IconButton type="submit" disabled={disabled} sx={{p: '8px', color: '#CB3B31'}} aria-label={submitAriaLabel}>
                    {loading ? <CircularProgress size={24} color="inherit" aria-label="Buscando"/> : <SearchIcon/>}
                </IconButton>
            </Paper>
        </Box>
    );
});

export default CampoBuscaBase;
