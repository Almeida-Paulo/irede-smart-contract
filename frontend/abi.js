[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "valor",
				"type": "uint256"
			}
		],
		"name": "adicionarAoPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "novoValor",
				"type": "uint256"
			}
		],
		"name": "ajustarRecompensaPadrao",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "despausar",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "recompensaPadrao_",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "poolInicial_",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "EnforcedPause",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ExpectedPause",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "pausar",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "valorAdicionado",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "novoPool",
				"type": "uint256"
			}
		],
		"name": "PoolRecompensasAtualizado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "carteira",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "valor",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "novoSaldo",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "poolRestante",
				"type": "uint256"
			}
		],
		"name": "RecompensaEnviada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "valorAnterior",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "novoValor",
				"type": "uint256"
			}
		],
		"name": "RecompensaPadraoAtualizada",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "carteira",
				"type": "address"
			}
		],
		"name": "recompensarUsuario",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			}
		],
		"name": "registrarUsuario",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "carteira",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "dataRegistro",
				"type": "uint256"
			}
		],
		"name": "UsuarioRegistrado",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "carteira",
				"type": "address"
			}
		],
		"name": "consultarUsuario",
		"outputs": [
			{
				"internalType": "string",
				"name": "nome",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "registrado",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "saldo",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "dataRegistro",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalRecompensas",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "poolRecompensas",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "recompensaPadrao",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "saldos",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
