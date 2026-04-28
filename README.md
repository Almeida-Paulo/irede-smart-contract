# irede-smart-contract

Projeto educacional para demonstrar fundamentos de Smart Contracts na Ethereum com:

- contrato Solidity `RegistroDeUsuariosComRecompensa`
- frontend estatico (HTML/CSS/JS) para interacao com o contrato

## Objetivo do Projeto

Consolidar conceitos fundamentais:

- estrutura de contratos Solidity
- funcoes, variaveis e eventos
- armazenamento on-chain com `mapping` e `struct`
- simulacao conceitual de token por saldo interno
- validacoes de seguranca basica (`require`, permissao, pausa)
- nocao pratica de gas e execucao na EVM

## Estrutura

- `contract/RegistroDeUsuariosComRecompensa.sol`: contrato principal para Remix
- `contract/caso_de_uso.txt`: caso de uso real
- `frontend/index.html`: interface web
- `frontend/app.js`: logica da interface com ethers.js
- `frontend/abi.js`: ABI do contrato
- `frontend/config.js`: configuracao de rede e endereco do contrato
- `frontend/styles.css`: estilos
- `ops/nginx/irede-smart-contract.conf`: exemplo de virtual host Nginx
- `ops/deploy_from_git.sh`: deploy/update rapido via `git pull`

## Contrato Inteligente

O contrato `RegistroDeUsuariosComRecompensa` permite:

- registrar usuario por carteira (`registrarUsuario`)
- consultar dados do usuario (`consultarUsuario`)
- enviar recompensa simulada (`recompensarUsuario`)

Eventos principais:

- `UsuarioRegistrado`
- `RecompensaEnviada`
- `RecompensaPadraoAtualizada`
- `PoolRecompensasAtualizado`

Controles administrativos:

- pausar/despausar operacoes
- ajustar valor de recompensa
- adicionar saldo ao pool de recompensas
- bloqueio de renuncia de ownership para evitar perda acidental de controle

## Frontend

O frontend foi pensado para testes manuais do contrato:

- conexao de carteira via `ethers.js`
- validacao de rede (`chainId`) e endereco de contrato
- operacoes de registro, consulta e recompensa
- exibicao de hash e link de transacao no explorador

## Seguranca Aplicada

- OpenZeppelin (`Ownable` e `Pausable`)
- validacoes com `require`
- protecao contra registro duplicado
- funcoes criticas restritas ao `owner`
- auditoria via eventos on-chain
- frontend sem Axios
- `.gitignore` para reduzir risco de versionar arquivos sensiveis

## Observacao importante sobre garantia

`.gitignore` reduz risco de envio acidental de arquivos sensiveis, mas nao oferece garantia absoluta.
Para blindagem adicional no GitHub, considere habilitar push protection/secret scanning quando disponivel.
