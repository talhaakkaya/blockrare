import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";
import React from "react";

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render(): React.ReactElement {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />
          <meta name="description" content="" />
          <meta name="author" content="" />
          {/* FAVICON */}

          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="./favicon-32x32.png"
          />

          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="./favicon-32x32.png"
          />

          {/* FAVICON END */}

          {/* FONTS */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Electrolize&display=swap"
            rel="stylesheet"
          />
          {/* FONTS END */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
