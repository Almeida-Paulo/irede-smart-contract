# irede-smart-contract

Projeto simples para estudo de Smart Contracts na Ethereum com:

- contrato Solidity `RegistroDeUsuariosComRecompensa`
- frontend estatico (HTML/CSS/JS) para testar o contrato
- instrucoes de deploy no Ubuntu a partir do Git

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

## 1) Deploy do contrato no Remix

1. Abra [https://remix.ethereum.org](https://remix.ethereum.org).
2. Crie o arquivo `RegistroDeUsuariosComRecompensa.sol` e cole o conteudo de `contract/RegistroDeUsuariosComRecompensa.sol`.
3. Em `Solidity Compiler`, selecione versao `0.8.24` e compile.
4. Em `Deploy & Run Transactions`:
1. para teste rapido, use `Remix VM`;
2. para testnet real, use `Browser Extension` (MetaMask).
5. No deploy, passe dois parametros do construtor:
1. `recompensaPadrao_` (ex.: `100`);
2. `poolInicial_` (ex.: `100000`).
6. Copie o endereco do contrato implantado.
7. No Remix, abra `Compilation Details` e copie a ABI (se mudar o contrato).

## 2) Configurar o frontend

Edite `frontend/config.js`:

- `chainId`: ID da rede (ex.: Sepolia `11155111`)
- `chainName`: nome da rede
- `contractAddress`: endereco do contrato deployado
- `explorerTxBaseUrl`: base do explorador da rede

A ABI padrao ja esta em `frontend/abi.js`.

## 3) Subir no GitHub

No seu repositiorio:

```bash
git add .
git commit -m "feat: contrato + frontend + deploy ubuntu"
git branch -M main
git remote add origin https://github.com/Almeida-Paulo/irede-smart-contract.git
git push -u origin main
```

Se o `origin` ja existir:

```bash
git remote set-url origin https://github.com/Almeida-Paulo/irede-smart-contract.git
git push -u origin main
```

## 4) Publicar no Ubuntu em /var/www

### 4.1 Dependencias

```bash
sudo apt update
sudo apt install -y nginx git
```

### 4.2 Clonar em /var/www

```bash
cd /var/www
sudo git clone https://github.com/Almeida-Paulo/irede-smart-contract.git
sudo chown -R $USER:$USER /var/www/irede-smart-contract
```

### 4.3 Nginx

Use o arquivo `ops/nginx/irede-smart-contract.conf` como base:

```bash
sudo cp /var/www/irede-smart-contract/ops/nginx/irede-smart-contract.conf /etc/nginx/sites-available/irede-smart-contract
sudo ln -s /etc/nginx/sites-available/irede-smart-contract /etc/nginx/sites-enabled/irede-smart-contract
sudo nginx -t
sudo systemctl reload nginx
```

Depois, acesse:

- `http://SEU_IP/` (ou dominio configurado)

## 5) Atualizar site apos novo push

No servidor:

```bash
cd /var/www/irede-smart-contract
git pull --ff-only
sudo systemctl reload nginx
```

Ou use:

```bash
sudo bash /var/www/irede-smart-contract/ops/deploy_from_git.sh
```

## Seguranca aplicada

- contrato com `Ownable` e `Pausable` (OpenZeppelin)
- validacoes com `require`
- bloqueio de registro duplicado
- controles administrativos com `onlyOwner`
- frontend sem Axios
- frontend valida entradas, carteira e rede antes de enviar transacoes
- cabecalhos de seguranca no Nginx (CSP, no-sniff, frame deny, etc.)
- `.gitignore` forte para arquivos sensiveis

## Observacao importante sobre garantia

`.gitignore` reduz risco de envio acidental de arquivos sensiveis, mas nao oferece garantia absoluta.
Para blindagem adicional no GitHub, considere habilitar push protection/secret scanning quando disponivel.
