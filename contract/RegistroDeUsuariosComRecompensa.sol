// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
Bibliotecas OpenZeppelin para seguranca:
- Ownable: restringe funcoes criticas ao administrador do contrato.
- Pausable: permite pausar operacoes em caso de emergencia.
*/
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/*
Conceitos importantes:
1) Gas:
   Toda execucao na Ethereum custa gas. Operacoes de escrita em storage custam mais.
2) EVM:
   A Ethereum Virtual Machine executa este contrato de forma deterministica em todos os nos.
3) Diferenca para contratos tradicionais:
   Em blockchain, as regras sao publicas e imutaveis apos deploy (salvo padroes de upgrade),
   e a execucao nao depende de um servidor unico centralizado.
*/
contract RegistroDeUsuariosComRecompensa is Ownable, Pausable {
    struct Usuario {
        string nome;
        bool registrado;
        uint64 dataRegistro;
        uint256 totalRecompensasRecebidas;
    }

    // Mapeamento de carteira para dados do usuario
    mapping(address => Usuario) private usuarios;

    // Simulacao de token: saldo por carteira
    mapping(address => uint256) public saldos;

    // Parametros da recompensa
    uint256 public recompensaPadrao;
    uint256 public poolRecompensas;

    // Eventos obrigatorios
    event UsuarioRegistrado(address indexed carteira, string nome, uint256 dataRegistro);
    event RecompensaEnviada(
        address indexed carteira,
        uint256 valor,
        uint256 novoSaldo,
        uint256 poolRestante
    );
    event RecompensaPadraoAtualizada(uint256 valorAnterior, uint256 novoValor);
    event PoolRecompensasAtualizado(uint256 valorAdicionado, uint256 novoPool);

    constructor(uint256 recompensaPadrao_, uint256 poolInicial_) Ownable(msg.sender) {
        require(recompensaPadrao_ > 0, "Recompensa invalida");
        require(poolInicial_ >= recompensaPadrao_, "Pool inicial insuficiente");

        recompensaPadrao = recompensaPadrao_;
        poolRecompensas = poolInicial_;
    }

    function registrarUsuario(string calldata nome) external whenNotPaused {
        require(bytes(nome).length > 0, "Nome obrigatorio");
        require(bytes(nome).length <= 64, "Nome muito longo");
        require(!usuarios[msg.sender].registrado, "Usuario ja registrado");

        usuarios[msg.sender] = Usuario({
            nome: nome,
            registrado: true,
            dataRegistro: uint64(block.timestamp),
            totalRecompensasRecebidas: 0
        });

        emit UsuarioRegistrado(msg.sender, nome, block.timestamp);
    }

    function consultarUsuario(address carteira)
        external
        view
        returns (
            string memory nome,
            bool registrado,
            uint256 saldo,
            uint256 dataRegistro,
            uint256 totalRecompensas
        )
    {
        Usuario memory u = usuarios[carteira];
        return (
            u.nome,
            u.registrado,
            saldos[carteira],
            uint256(u.dataRegistro),
            uint256(u.totalRecompensasRecebidas)
        );
    }

    function recompensarUsuario(address carteira) external onlyOwner whenNotPaused {
        require(carteira != address(0), "Carteira invalida");
        require(usuarios[carteira].registrado, "Usuario nao registrado");
        require(poolRecompensas >= recompensaPadrao, "Pool de recompensa esgotado");

        poolRecompensas -= recompensaPadrao;
        saldos[carteira] += recompensaPadrao;
        usuarios[carteira].totalRecompensasRecebidas += 1;

        emit RecompensaEnviada(carteira, recompensaPadrao, saldos[carteira], poolRecompensas);
    }

    function pausar() external onlyOwner {
        _pause();
    }

    function despausar() external onlyOwner {
        _unpause();
    }

    function ajustarRecompensaPadrao(uint256 novoValor) external onlyOwner {
        require(novoValor > 0, "Valor invalido");
        uint256 valorAnterior = recompensaPadrao;
        recompensaPadrao = novoValor;
        emit RecompensaPadraoAtualizada(valorAnterior, novoValor);
    }

    function adicionarAoPool(uint256 valor) external onlyOwner {
        require(valor > 0, "Valor invalido");
        poolRecompensas += valor;
        emit PoolRecompensasAtualizado(valor, poolRecompensas);
    }

    // Evita perda acidental de controles administrativos do contrato.
    function renounceOwnership() public override onlyOwner {
        revert("Renuncia de ownership desabilitada");
    }
}
