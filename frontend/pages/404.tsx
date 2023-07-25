import type { NextPage } from "next";
import Head from "next/head";

//bs
import Button from "react-bootstrap/Button";

const ErrorPage: NextPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <Button disabled={true} variant="outline-danger">
        404.
      </Button>
      <Head>
        <title>404.</title>
      </Head>
    </div>
  );
};

export default ErrorPage;
