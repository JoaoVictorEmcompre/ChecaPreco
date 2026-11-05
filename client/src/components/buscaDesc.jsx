import CampoBuscaBase from './campoBuscaBase';

export default function BuscaCNPJ({value, onChange, onSubmit, disabled = false}) {
    return (
        <CampoBuscaBase
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            placeholder="CNPJ do cliente (opcional)"
            inputAriaLabel="CNPJ"
            disabled={disabled}
        />
    );
}
