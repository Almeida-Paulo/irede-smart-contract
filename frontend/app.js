import { contractAbi } from "./abi.js";
import { APP_CONFIG } from "./config.js";

const $ = (id) => document.getElementById(id);

const connectBtn = $("connectBtn");
const registerBtn = $("registerBtn");
const consultBtn = $("consultBtn");
const rewardBtn = $("rewardBtn");

const walletAddressEl = $("walletAddress");
const networkInfoEl = $("networkInfo");
const ownerInfoEl = $("ownerInfo");
const consultaOutputEl = $("consultaOutput");
const logOutputEl = $("logOutput");
const txLinkEl = $("txLink");

const nomeInput = $("nomeInput");
const consultaInput = $("consultaInput");
const rewardInput = $("rewardInput");

let provider = null;
let signer = null;
let contractWithSigner = null;
let contractReadOnly = null;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function appendLog(message) {
  const line = `[${new Date().toLocaleTimeString("pt-BR")}] ${message}`;
  logOutputEl.textContent = `${line}\n${logOutputEl.textContent}`.trim();
}

function setTxLink(hash) {
  if (!hash) {
    txLinkEl.hidden = true;
    txLinkEl.removeAttribute("href");
    txLinkEl.textContent = "";
    return;
  }

  txLinkEl.hidden = false;
  txLinkEl.href = `${APP_CONFIG.explorerTxBaseUrl}${hash}`;
  txLinkEl.textContent = `Ver ultima transacao: ${hash.slice(0, 10)}...`;
}

function setButtonsEnabled(enabled) {
  registerBtn.disabled = !enabled;
  consultBtn.disabled = !enabled;
  rewardBtn.disabled = !enabled;
}

function normalizeError(err) {
  const msg = String(err?.reason || err?.shortMessage || err?.message || "Erro desconhecido");
  return msg.replace(/\s+/g, " ").trim();
}

function validateConfig() {
  if (!window.ethers) {
    throw new Error("ethers.js nao foi carregado.");
  }

  if (!Number.isInteger(APP_CONFIG.chainId) || APP_CONFIG.chainId <= 0) {
    throw new Error("config.js: chainId invalido.");
  }

  if (!APP_CONFIG.contractAddress || APP_CONFIG.contractAddress === ZERO_ADDRESS) {
    throw new Error("config.js: atualize contractAddress com o endereco deployado.");
  }

  if (!window.ethers.isAddress(APP_CONFIG.contractAddress)) {
    throw new Error("config.js: contractAddress invalido.");
  }
}

async function ensureCorrectNetwork() {
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  networkInfoEl.textContent = `${APP_CONFIG.chainName} (${chainId})`;

  if (chainId !== APP_CONFIG.chainId) {
    throw new Error(`Rede incorreta. Esperado ${APP_CONFIG.chainName} (${APP_CONFIG.chainId}).`);
  }
}

async function setupContracts() {
  contractReadOnly = new window.ethers.Contract(APP_CONFIG.contractAddress, contractAbi, provider);
  contractWithSigner = contractReadOnly.connect(signer);

  try {
    const owner = await contractReadOnly.owner();
    ownerInfoEl.textContent = owner;
  } catch {
    ownerInfoEl.textContent = "Nao foi possivel ler owner()";
  }
}

async function connectWallet() {
  try {
    validateConfig();

    if (!window.ethereum) {
      throw new Error("MetaMask (ou carteira EIP-1193) nao encontrada.");
    }

    provider = new window.ethers.BrowserProvider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();

    const currentAddress = await signer.getAddress();
    walletAddressEl.textContent = currentAddress;

    await ensureCorrectNetwork();
    await setupContracts();

    setButtonsEnabled(true);
    appendLog("Carteira conectada com sucesso.");
  } catch (err) {
    setButtonsEnabled(false);
    appendLog(`Falha ao conectar carteira: ${normalizeError(err)}`);
  }
}

async function registrarUsuario() {
  try {
    const nome = nomeInput.value.trim();

    if (nome.length === 0) {
      throw new Error("Informe um nome.");
    }
    if (nome.length > 64) {
      throw new Error("Nome deve ter no maximo 64 caracteres.");
    }

    await ensureCorrectNetwork();

    appendLog("Enviando transacao registrarUsuario...");
    const tx = await contractWithSigner.registrarUsuario(nome);
    setTxLink(tx.hash);
    appendLog(`Tx enviada: ${tx.hash}`);

    await tx.wait();
    appendLog("Usuario registrado com sucesso.");
    nomeInput.value = "";
  } catch (err) {
    appendLog(`Erro em registrarUsuario: ${normalizeError(err)}`);
  }
}

async function consultarUsuario() {
  try {
    const carteira = consultaInput.value.trim();

    if (!window.ethers.isAddress(carteira)) {
      throw new Error("Carteira invalida.");
    }

    await ensureCorrectNetwork();

    const [nome, registrado, saldo, dataRegistro, totalRecompensas] =
      await contractReadOnly.consultarUsuario(carteira);

    const dataFmt =
      Number(dataRegistro) > 0
        ? new Date(Number(dataRegistro) * 1000).toLocaleString("pt-BR")
        : "Nao registrado";

    const output = [
      `Carteira: ${carteira}`,
      `Nome: ${nome || "-"}`,
      `Registrado: ${registrado ? "Sim" : "Nao"}`,
      `Saldo token simulado: ${saldo.toString()}`,
      `Data de registro: ${dataFmt}`,
      `Total recompensas: ${totalRecompensas.toString()}`
    ].join("\n");

    consultaOutputEl.textContent = output;
    appendLog("Consulta executada.");
  } catch (err) {
    consultaOutputEl.textContent = "Falha na consulta.";
    appendLog(`Erro em consultarUsuario: ${normalizeError(err)}`);
  }
}

async function recompensarUsuario() {
  try {
    const carteira = rewardInput.value.trim();

    if (!window.ethers.isAddress(carteira)) {
      throw new Error("Carteira invalida.");
    }

    await ensureCorrectNetwork();

    appendLog("Enviando transacao recompensarUsuario...");
    const tx = await contractWithSigner.recompensarUsuario(carteira);
    setTxLink(tx.hash);
    appendLog(`Tx enviada: ${tx.hash}`);

    await tx.wait();
    appendLog("Recompensa enviada com sucesso.");
    rewardInput.value = "";
  } catch (err) {
    appendLog(`Erro em recompensarUsuario: ${normalizeError(err)}`);
  }
}

function bindWalletEvents() {
  if (!window.ethereum) {
    return;
  }

  window.ethereum.on("accountsChanged", () => {
    appendLog("Conta alterada na carteira. Reconecte para atualizar.");
    walletAddressEl.textContent = "Conta alterada. Clique em Conectar Carteira.";
    setButtonsEnabled(false);
  });

  window.ethereum.on("chainChanged", () => {
    appendLog("Rede alterada na carteira. Reconecte para atualizar.");
    networkInfoEl.textContent = "Rede alterada. Clique em Conectar Carteira.";
    setButtonsEnabled(false);
  });
}

function init() {
  setButtonsEnabled(false);
  bindWalletEvents();

  connectBtn.addEventListener("click", connectWallet);
  registerBtn.addEventListener("click", registrarUsuario);
  consultBtn.addEventListener("click", consultarUsuario);
  rewardBtn.addEventListener("click", recompensarUsuario);

  try {
    validateConfig();
    appendLog("Config validada. Conecte a carteira para iniciar.");
  } catch (err) {
    appendLog(`Erro de configuracao: ${normalizeError(err)}`);
  }
}

init();
