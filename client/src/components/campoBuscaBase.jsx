import {forwardRef} from 'react';
import {Paper, InputBase, IconButton, Box} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const CampoBuscaBase = forwardRef(function CampoBuscaBase(
    {value, onChange, onSubmit, onFocus, placeholder, inputAriaLabel, submitAriaLabel = 'Buscar', children},
    ref
) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(value);
    };

    return (
        <Box sx={{mb: 2, display: 'flex', justifyContent: 'center'}}>
            <Paper
                component="form"
                sx={{
                    p: '2px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    width: 360,
                    borderRadius: 6,
                    backgroundColor: '#f1f5f9',
                }}
                onSubmit={handleSubmit}
            >
                <InputBase
                    inputRef={ref}
                    sx={{ml: 1, flex: 1, fontSize: 14}}
                    placeholder={placeholder}
                    inputProps={{'aria-label': inputAriaLabel}}
                    value={value}
                    onFocus={onFocus}
                    onChange={(e) => onChange(e.target.value)}
                />
                {children}
                <IconButton type="submit" sx={{p: '10px'}} aria-label={submitAriaLabel}>
                    <SearchIcon/>
                </IconButton>
            </Paper>
        </Box>
    );
});

export default CampoBuscaBase;
