import { useState, useEffect } from "react";
import { ethers } from "ethers";

export interface States {
  provider?: ethers.providers.Web3Provider | boolean;
  isReady: boolean;
  signer?: ethers.Signer | null;
  address?: string | null;
  chainId?: number | null;
}

export const useWallet = (): States => {
  const [provider, setProvider] = useState<States["provider"]>(undefined);
  const [signer, setSigner] = useState<States["signer"]>(undefined);
  const [address, setAddress] = useState<States["address"]>(undefined);
  const [chainId, setChainId] = useState<States["chainId"]>(undefined);

  useEffect(() => {
    let isMounted = true;
    const handler = (accounts: Array<string>) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      } else {
        setAddress(null);
      }
    };
    if (window.ethereum) {
      const init = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        if (isMounted) {
          setProvider(provider);
          setSigner(signer);
        }

        try {
          const address = await signer.getAddress();
          const chainId = await signer.getChainId();

          if (isMounted) {
            setAddress(address);
            setChainId(chainId);
          }
        } catch {
          setAddress(null);
          setChainId(null);
        }
      };
      init();
      window.ethereum.on("accountsChanged", handler);
    } else {
      setProvider(false);
      setSigner(null);
      setAddress(null);
      setChainId(null);
    }

    return () => {
      isMounted = false;
      window.ethereum
        ? window.ethereum.removeListener("accountsChanged", handler)
        : null;
    };
  }, [address]);

  const isReady = () => {
    return (
      typeof provider !== "undefined" &&
      typeof signer !== "undefined" &&
      typeof address !== "undefined" &&
      typeof chainId !== "undefined"
    );
  };

  return {
    provider,
    isReady: isReady(),
    signer,
    address,
    chainId,
  };
};
