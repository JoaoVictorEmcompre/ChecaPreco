// components/buscaGrupo.jsx
import CampoBuscaBase from "./campoBuscaBase";

export default function CampoDeBuscaGrupo({value, onChange, onSubmit, onActivate}) {
    const handleSubmit = (v) => {
        onActivate?.(true);
        onSubmit(v);
    };

    const handleFocus = () => onActivate?.(true);

    const handleChange = (v) => {
        onActivate?.(true);
        onChange(v);
    };

    return (
        <CampoBuscaBase
            value={value}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onFocus={handleFocus}
            placeholder="Digite o código do grupo"
            inputAriaLabel="campo de busca por grupo"
            submitAriaLabel="Buscar por grupo"
        />
    );
}
