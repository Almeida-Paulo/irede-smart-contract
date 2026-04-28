import { contractAbi } from "./abi.js?v=20260427b";
import { APP_CONFIG } from "./config.js?v=20260427b";

const $ = (id) => document.getElementById(id);

const connectBtn = $("connectBtn");
const refreshWalletsBtn = $("refreshWalletsBtn");
const walletProviderSelect = $("walletProviderSelect");
const registerBtn = $("registerBtn");
const consultBtn = $("consultBtn");
const rewardBtn = $("rewardBtn");

const walletProviderInfoEl = $("walletProviderInfo");
const walletAddressEl = $("walletAddress");
const networkInfoEl = $("networkInfo");
const ownerInfoEl = $("ownerInfo");
const consultaOutputEl = $("consultaOutput");
const logOutputEl = $("logOutput");
const txLinkEl = $("txLink");

const nomeInput = $("nomeInput");
const consultaInput = $("consultaInput");
const rewardInput = $("rewardInput");

const EIP6963_REQUEST_EVENT = "eip6963:requestProvider";
const EIP6963_ANNOUNCE_EVENT = "eip6963:announceProvider";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

let provider = null;
let signer = null;
let contractWithSigner = null;
let contractReadOnly = null;

let selectedWalletId = "";
let connectedEip1193Provider = null;
let onAccountsChangedHandler = null;
let onChainChangedHandler = null;

const discoveredWallets = new Map();

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

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function isMetaMaskWallet(info, eip1193Provider) {
  const rdns = String(info?.rdns || "").toLowerCase();
  return rdns.includes("metamask") || Boolean(eip1193Provider?.isMetaMask);
}

function guessLegacyWalletName(eip1193Provider) {
  if (eip1193Provider?.isMetaMask) {
    return "MetaMask";
  }
  if (eip1193Provider?.isCoinbaseWallet) {
    return "Coinbase Wallet";
  }
  if (eip1193Provider?.isRabby) {
    return "Rabby";
  }
  if (eip1193Provider?.isTrust) {
    return "Trust Wallet";
  }
  if (eip1193Provider?.isGateWallet || eip1193Provider?.isGate) {
    return "Gate Wallet";
  }
  return "Carteira EIP-1193";
}

function buildWalletLabel(info, eip1193Provider) {
  const baseName = info?.name || guessLegacyWalletName(eip1193Provider);
  const rdns = String(info?.rdns || "").trim();
  return rdns ? `${baseName} (${rdns})` : baseName;
}

function walletAlreadyRegistered(providerCandidate) {
  for (const wallet of discoveredWallets.values()) {
    if (wallet.provider === providerCandidate) {
      return true;
    }
  }
  return false;
}

function registerDiscoveredWallet({ id, info, provider: eip1193Provider }) {
  if (!id || !eip1193Provider || typeof eip1193Provider.request !== "function") {
    return;
  }
  if (walletAlreadyRegistered(eip1193Provider)) {
    return;
  }

  discoveredWallets.set(id, {
    id,
    info: info || {},
    provider: eip1193Provider,
    label: buildWalletLabel(info, eip1193Provider)
  });
}

function addLegacyInjectedWallets() {
  if (!window.ethereum) {
    return;
  }

  const providers = Array.isArray(window.ethereum.providers)
    ? window.ethereum.providers
    : [window.ethereum];

  providers.forEach((injectedProvider, index) => {
    registerDiscoveredWallet({
      id: `legacy:${index}`,
      info: { name: guessLegacyWalletName(injectedProvider), rdns: "" },
      provider: injectedProvider
    });
  });
}

function chooseDefaultWalletId(previousWalletId) {
  if (previousWalletId && discoveredWallets.has(previousWalletId)) {
    return previousWalletId;
  }

  for (const [id, wallet] of discoveredWallets.entries()) {
    if (isMetaMaskWallet(wallet.info, wallet.provider)) {
      return id;
    }
  }

  const [firstId] = discoveredWallets.keys();
  return firstId || "";
}

function selectedWallet() {
  const candidateId = walletProviderSelect.value || selectedWalletId;
  return discoveredWallets.get(candidateId) || null;
}

function updateSelectedWalletInfo(logSelection) {
  const wallet = selectedWallet();
  if (!wallet) {
    selectedWalletId = "";
    walletProviderInfoEl.textContent = "Nenhuma detectada";
    return;
  }

  selectedWalletId = wallet.id;
  walletProviderInfoEl.textContent = wallet.label;

  if (logSelection) {
    appendLog(`Carteira selecionada: ${wallet.label}`);
  }
}

function renderWalletSelect(previousWalletId) {
  walletProviderSelect.innerHTML = "";

  if (discoveredWallets.size === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Nenhuma carteira detectada";
    walletProviderSelect.appendChild(option);
    walletProviderSelect.disabled = true;
    connectBtn.disabled = true;
    walletProviderInfoEl.textContent = "Nenhuma detectada";
    return;
  }

  for (const wallet of discoveredWallets.values()) {
    const option = document.createElement("option");
    option.value = wallet.id;
    option.textContent = wallet.label;
    walletProviderSelect.appendChild(option);
  }

  selectedWalletId = chooseDefaultWalletId(previousWalletId);
  walletProviderSelect.value = selectedWalletId;
  walletProviderSelect.disabled = false;
  connectBtn.disabled = false;
  updateSelectedWalletInfo(false);
}

async function discoverWallets() {
  const previousWalletId = walletProviderSelect.value || selectedWalletId;
  discoveredWallets.clear();

  const onProviderAnnouncement = (event) => {
    const info = event?.detail?.info || {};
    const eip1193Provider = event?.detail?.provider;
    const id = `eip6963:${String(info.rdns || "unknown")}:${String(
      info.uuid || info.name || Math.random()
    )}`;

    registerDiscoveredWallet({
      id,
      info,
      provider: eip1193Provider
    });
  };

  window.addEventListener(EIP6963_ANNOUNCE_EVENT, onProviderAnnouncement);
  window.dispatchEvent(new Event(EIP6963_REQUEST_EVENT));
  await wait(350);
  window.removeEventListener(EIP6963_ANNOUNCE_EVENT, onProviderAnnouncement);

  addLegacyInjectedWallets();
  renderWalletSelect(previousWalletId);

  if (discoveredWallets.size === 0) {
    appendLog("Nenhuma carteira EIP-1193 detectada no navegador.");
  } else {
    appendLog(`${discoveredWallets.size} carteira(s) detectada(s).`);
  }
}

function unbindWalletEvents() {
  if (!connectedEip1193Provider || typeof connectedEip1193Provider.removeListener !== "function") {
    return;
  }

  if (onAccountsChangedHandler) {
    connectedEip1193Provider.removeListener("accountsChanged", onAccountsChangedHandler);
  }
  if (onChainChangedHandler) {
    connectedEip1193Provider.removeListener("chainChanged", onChainChangedHandler);
  }
}

function bindWalletEvents(targetProvider) {
  unbindWalletEvents();
  connectedEip1193Provider = targetProvider;

  if (!targetProvider || typeof targetProvider.on !== "function") {
    return;
  }

  onAccountsChangedHandler = () => {
    appendLog("Conta alterada na carteira. Reconecte para atualizar.");
    walletAddressEl.textContent = "Conta alterada. Clique em Conectar Carteira.";
    setButtonsEnabled(false);
  };

  onChainChangedHandler = () => {
    appendLog("Rede alterada na carteira. Reconecte para atualizar.");
    networkInfoEl.textContent = "Rede alterada. Clique em Conectar Carteira.";
    setButtonsEnabled(false);
  };

  targetProvider.on("accountsChanged", onAccountsChangedHandler);
  targetProvider.on("chainChanged", onChainChangedHandler);
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
    const wallet = selectedWallet();

    if (!wallet) {
      throw new Error("Nenhuma carteira selecionada. Clique em Atualizar Carteiras.");
    }

    provider = new window.ethers.BrowserProvider(wallet.provider, "any");
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();

    const currentAddress = await signer.getAddress();
    walletAddressEl.textContent = currentAddress;
    walletProviderInfoEl.textContent = wallet.label;

    await ensureCorrectNetwork();
    await setupContracts();
    bindWalletEvents(wallet.provider);

    setButtonsEnabled(true);
    appendLog(`Carteira conectada com sucesso (${wallet.label}).`);
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

async function refreshWallets() {
  try {
    appendLog("Atualizando lista de carteiras...");
    await discoverWallets();
  } catch (err) {
    appendLog(`Falha ao detectar carteiras: ${normalizeError(err)}`);
  }
}

async function init() {
  setButtonsEnabled(false);
  connectBtn.disabled = true;

  connectBtn.addEventListener("click", connectWallet);
  refreshWalletsBtn.addEventListener("click", refreshWallets);
  walletProviderSelect.addEventListener("change", () => updateSelectedWalletInfo(true));
  registerBtn.addEventListener("click", registrarUsuario);
  consultBtn.addEventListener("click", consultarUsuario);
  rewardBtn.addEventListener("click", recompensarUsuario);

  try {
    validateConfig();
    appendLog("Config validada. Selecione a carteira e clique em Conectar Carteira.");
  } catch (err) {
    appendLog(`Erro de configuracao: ${normalizeError(err)}`);
    return;
  }

  await discoverWallets();
}

void init();
