import { FC, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useWallet } from "../../hooks/use-wallet";
import { ethers } from "ethers";
import { CHAIN_ID } from "../../utils";
import { useRouter } from "next/router";

// bs
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

export const Layout: FC = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();
  const router = useRouter();

  const connect = async () => {
    if (loading === true) return;
    setLoading(true);

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const switchChain = async () => {
    if (loading === true) return;
    setLoading(true);

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.utils.hexlify(CHAIN_ID) }],
      });
      // eslint-disable-next-line
    } catch (switchError: any) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: ethers.utils.hexlify(CHAIN_ID),
              rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
              chainName: "Avalanche Network",
              blockExplorerUrls: ["https://snowtrace.io/"],
              nativeCurrency: {
                name: "AVAX",
                symbol: "AVAX",
                decimals: 18,
              },
            },
          ],
        });
        // eslint-disable-next-line
      } catch (addError: any) {
        setLoading(false);
      }
      setLoading(false);
    }
  };

  if (!wallet.isReady)
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <Button disabled={true} variant="outline-dark">
          Loading...
        </Button>
        <Head>
          <title>Loading...</title>
        </Head>
      </div>
    );

  if (!wallet.provider)
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <Button disabled={true} variant="outline-danger">
          Web3 injector not found.
        </Button>
        <Head>
          <title>Error.</title>
        </Head>
      </div>
    );

  if (!wallet.address)
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <Button disabled={loading} onClick={connect} variant="outline-dark">
          {loading ? (
            <Spinner variant="dark" size="sm" animation="grow" />
          ) : (
            <>Connect.</>
          )}
        </Button>
        <Head>
          <title>Connect.</title>
        </Head>
      </div>
    );

  if (wallet.chainId && wallet.chainId !== CHAIN_ID)
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <Button disabled={loading} onClick={switchChain} variant="outline-dark">
          {loading ? (
            <Spinner variant="dark" size="sm" animation="grow" />
          ) : (
            <>Switch.</>
          )}
        </Button>
        <Head>
          <title>Switch.</title>
        </Head>
      </div>
    );

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        {/* NAVBAR */}
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Link href="/" passHref>
              <Navbar.Brand>
                BlockRare<sup>On-Chain NFT</sup>
              </Navbar.Brand>
            </Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Link href="/tokens" passHref>
                  <Nav.Link active={router.pathname === "/tokens"}>
                    Tokens.
                  </Nav.Link>
                </Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        {/* NAVBAR END */}

        {children}

        <Head>
          <title>BlockRare.</title>
        </Head>
      </div>
      <footer className="shadow-lg bg-light mt-auto text-dark small py-3">
        <Container>
          <div className="text-truncate">
            <span>Powered By Avalanche ♥ </span>
            created by{" "}
            <a
              className="link-dark"
              href="https://twitter.com/root36x9"
              target="_blank"
              rel="noreferrer"
            >
              root.
            </a>{" "}
          </div>
        </Container>
      </footer>
    </>
  );
};
