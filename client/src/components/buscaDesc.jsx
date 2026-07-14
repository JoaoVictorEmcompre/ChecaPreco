import CampoBuscaBase from './campoBuscaBase';

export default function BuscaCNPJ({value, onChange, onSubmit}) {
    return (
        <CampoBuscaBase
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            placeholder="Digite o CNPJ"
            inputAriaLabel="CNPJ"
        />
    );
}
