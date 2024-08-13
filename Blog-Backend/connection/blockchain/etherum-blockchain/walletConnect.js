import { ethers } from "ethers";
import Web3Modal from "web3modal";

const providerOptions = {
  /* Puedes agregar más opciones de proveedores si es necesario */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // Cambia según la red que quieras usar
  cacheProvider: true,
  providerOptions, // Opciones de proveedores, puedes agregar WalletConnect, etc.
});

export async function connectWallet() {
  try {
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    return { signer, address };
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
}
