import type { AppProps } from "next/app";
import "bootswatch/dist/cyborg/bootstrap.min.css";
import "../styles/globals.css";
import Router from "next/router";

if (typeof window !== "undefined") {
  if (window.ethereum) {
    window.ethereum.on("chainChanged", () => {
      Router.reload();
    });
  }
}

function Blocks({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default Blocks;
