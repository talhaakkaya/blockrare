import type { NextPage } from "next";
import { useState } from "react";
import { Layout } from "../components/layout";
import { useWallet } from "../hooks/use-wallet";
import useSWR from "swr";
import { useRouter } from "next/router";
import { contractABI, contractAddress, fetcher } from "../utils";
import Image from "next/image";
import { ethers } from "ethers";

//bs
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

type Token = {
  metadata: string;
  name: string;
  owner: string;
  id: number;
  blockNumber: number;
  isImmutable: boolean;
  isOriginal: boolean;
};

type Data = {
  tokens: Array<Token>;
};

const Index: NextPage = () => {
  const [show, setShow] = useState(false);
  const [content, setContent] = useState({ title: "", body: <></> });
  const [loading, setLoading] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);
  const wallet = useWallet();
  const router = useRouter();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const submitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!wallet.address || !wallet.signer) return;

    const formData = new FormData(e.currentTarget);
    const tokenId = formData.getAll("tokenId");
    const uri = formData.getAll("tokenURI");

    setContent({
      title: "Confirm.",
      body: <>Waiting for the confirmation.</>,
    });
    setShow(true);

    try {
      const abi = await fetch(contractABI);
      const nft = new ethers.Contract(
        contractAddress,
        await abi.json(),
        wallet.signer
      );

      const tx = await nft.setTokenURIs(tokenId, uri);
      await tx.wait();

      setContent({
        title: "Done.",
        body: <>The block is customized.</>,
      });

      // eslint-disable-next-line
    } catch (err: any) {
      setContent({
        title: "Error.",
        body: <>Not.</>,
      });
    }
  };

  const edit = async (token: Token) => {
    const json = atob(token.metadata.substring(29));
    const result = JSON.parse(json);

    if (token.isImmutable) return;

    setContent({
      title: "Edit.",
      body: (
        <Form onSubmit={submitEdit} id="edit" name="edit">
          <Form.Group className="mb-3" controlId="tokenURI">
            <Form.Label>Token URI.</Form.Label>
            <Form.Control
              type="text"
              name="tokenURI"
              placeholder="Enter Token URI."
            />
            <Form.Control
              type="hidden"
              defaultValue={token.id}
              name="tokenId"
              placeholder="Enter Token URI."
            />
            <Form.Text className="text-muted">
              There will be no second time to change.
            </Form.Text>
          </Form.Group>
        </Form>
      ),
    });
    setShow(true);
  };

  const { data, error } = useSWR<Data, Error>(
    !wallet.address
      ? null
      : showAll
      ? `{ tokens(orderBy: mintedAt, orderDirection: desc) { id, blockNumber, isOriginal, isImmutable, owner, updatedAt, metadata } }`
      : `{ tokens(orderBy: mintedAt, orderDirection: desc, where: { owner: "${wallet.address}" }) { id, blockNumber, isOriginal, isImmutable, owner, updatedAt, metadata } }`,
    fetcher
  );

  return (
    <Layout>
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col lg={3} md={3} sm={6} className="mb-3">
              <div className="d-flex align-items-center mb-2 mb-md-0">
                List{" "}
                <Form.Select
                  onChange={(e) =>
                    setShowAll(e.currentTarget.value === "my" ? false : true)
                  }
                  className="mx-2 d-inline-block"
                  style={{ width: "auto" }}
                >
                  <option value="my">My</option>
                  <option value="all">All</option>
                </Form.Select>{" "}
                Tokens
              </div>
            </Col>
          </Row>
          <Row>
            {(() => {
              if (!data && !error) return <Col>Loading...</Col>;

              if (error) return <Col>Error.</Col>;

              if (!data || !(data.tokens.length > 0))
                return <Col>No Token.</Col>;

              return data.tokens.map((token) => {
                let result;
                if (token.isOriginal) {
                  try {
                    const json = atob(token.metadata.substring(29));
                    result = JSON.parse(json);
                  } catch (err) {
                    result = false;
                  }
                }
                return (
                  <Col className="mb-3" key={token.id} lg={3} md={4} sm={6}>
                    <div className="border border-1 border-light">
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={token.isOriginal ? undefined : token.metadata}
                      >
                        <Image
                          alt={token.id.toString()}
                          width={512}
                          height={512}
                          src={
                            token.isOriginal && result?.image
                              ? result.image
                              : "https://ipfs.io/ipfs/QmTcm5Ts4iz2wxDnP1XY1nXEyt1HDZieg9iHTvmXwgyhyG"
                          }
                          className="w-100"
                        />
                      </a>
                      <div className="p-2 d-flex justify-content-between align-items-center">
                        {result !== false &&
                        !token.isImmutable &&
                        token.owner.toLowerCase() ===
                          wallet.address!.toLowerCase() ? (
                          <small onClick={() => edit(token)} role={"button"}>
                            Edit.
                          </small>
                        ) : (
                          <small>Not.</small>
                        )}
                        <div>
                          <a
                            title="View on Snowtrace"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted me-1"
                            href={`https://testnet.snowtrace.io/block/${token.blockNumber}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              version="1.1"
                              viewBox="0 0 18 18"
                            >
                              <g transform="matrix(.13472 0 0 .13472 -159.796 -101.1)">
                                <g>
                                  <circle
                                    cx="66.807"
                                    cy="66.807"
                                    r="66.807"
                                    fill="#e6e6e6"
                                    data-name="Ellipse 13"
                                    transform="translate(1186.167 750.463)"
                                  ></circle>
                                  <g
                                    fill="#000"
                                    data-name="Group 56"
                                    transform="translate(1215.911 781.247)"
                                  >
                                    <path
                                      d="M1250.31 2323.325c.011-.075.023-.151.031-.226.01-.075.015-.154.021-.23.013-.142.021-.285.027-.426v-.186c0-.045.01-.089.01-.134v-.083c0-.157-.01-.315-.019-.472 0-.035 0-.067-.01-.1l-.01-.078c0-.067-.01-.134-.015-.2a8.815 8.815 0 00-.066-.461l-.01-.048-.023-.126c-.013-.072-.024-.144-.039-.214a9.42 9.42 0 00-.1-.41l-.02-.067-.024-.089c-.026-.089-.048-.177-.077-.264-.036-.113-.078-.226-.12-.34-.018-.05-.039-.1-.058-.148-.041-.1-.078-.207-.122-.308s-.084-.183-.127-.274c-.034-.071-.07-.14-.106-.209a9.638 9.638 0 00-.138-.267c-.022-.04-.04-.083-.063-.123-.023-.04-.053-.077-.077-.117-.051-.086-.107-.168-.161-.252a30.99 30.99 0 00-.128-.2c-.057-.083-.115-.168-.175-.251-.06-.083-.137-.172-.2-.258-.035-.041-.065-.084-.1-.125-.078-.093-.155-.186-.236-.276-.062-.067-.128-.13-.19-.2l-.065-.067-.046-.048c-.1-.1-.2-.2-.306-.292-.054-.05-.111-.1-.168-.143-.031-.029-.064-.055-.1-.084l-.034-.03c-.12-.1-.241-.194-.366-.286-.054-.039-.111-.077-.167-.116l-.064-.043-.082-.057a7.899 7.899 0 00-.4-.252l-.07-.047c-.041-.023-.084-.041-.125-.063l-.156-.085a7.215 7.215 0 00-.596-.286 9.488 9.488 0 00-.208-.085c-.1-.039-.192-.078-.291-.113h-.01v-31.037h-5.8v8.744l-5.938-5.937-4.1 4.1 10.038 10.037v14.093h-.012c-.1.036-.192.074-.288.113-.069.028-.138.054-.207.084-.069.03-.156.071-.234.107a8.177 8.177 0 00-.363.181l-.154.085c-.054.029-.084.041-.125.063-.025.015-.048.033-.073.047a12.13 12.13 0 00-.4.252l-.081.055-.031.023-.2.135a8.483 8.483 0 00-.371.292l-.033.028-.032.025-.029.024-12.2-7.046-3.674-13.713-5.6 1.5 2.174 8.112-7.574-4.374-2.9 5.022 7.573 4.374-8.111 2.172 1.5 5.6 13.711-3.675 12.2 7.045-.038.211c-.018.123-.034.246-.048.371-.01.063-.01.126-.016.189-.01.1-.02.2-.024.306-.01.119-.01.239-.01.357v.166c0 .118 0 .237.01.354l.024.311c.01.063.01.126.016.189.014.122.029.243.048.365.011.072.026.144.038.216l-12.2 7.046-13.711-3.674-1.5 5.6 8.111 2.174-7.573 4.371 2.9 5.024 7.574-4.374-2.174 8.111 5.6 1.5 3.674-13.712 12.2-7.046.031.026.021.018.045.038c.12.1.24.195.366.286.065.048.132.092.2.138l.022.015.094.065c.127.086.258.169.392.247.026.015.048.033.073.047.05.03.1.054.153.082l.119.063.05.027c.078.041.154.083.234.12.122.06.245.114.368.168l.037.017c.077.033.153.061.231.091l.125.047.067.025v14.088l-10.038 10.039 4.1 4.1 5.938-5.938v8.746h5.8v-8.746l5.937 5.938 4.1-4.1-10.037-10.039v-14.088l.066-.025.126-.047c.076-.03.153-.058.229-.091l.041-.018a7.81 7.81 0 00.363-.165c.081-.039.159-.081.237-.123l.046-.025.122-.066c.041-.023.1-.053.153-.081.024-.013.046-.031.07-.047.134-.078.264-.16.393-.246l.1-.068.023-.015c.066-.044.132-.088.2-.136.125-.091.246-.187.366-.285l.047-.041.021-.018.03-.024 12.205 7.046 3.674 13.712 5.6-1.5-2.174-8.111 7.573 4.374 2.9-5.024-26.88-15.518c.018-.095.039-.2.049-.305z"
                                      data-name="Path 137"
                                      transform="translate(-1205.992 -2282.952)"
                                    ></path>
                                    <path
                                      d="M1249.554 2316.884a13.994 13.994 0 00-12.205-20.83v5.8a8.2 8.2 0 017.149 12.193z"
                                      data-name="Path 138"
                                      transform="translate(-1190.303 -2276.437)"
                                    ></path>
                                    <path
                                      d="M1235.117 2282.978v5.8a28.756 28.756 0 0124.616 43.61l4.962 3a34.555 34.555 0 00-29.578-52.411z"
                                      data-name="Path 139"
                                      transform="translate(-1191.42 -2282.978)"
                                    ></path>
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </a>{" "}
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              });
            })()}
          </Row>
        </Container>
      </section>
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{content.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{content.body}</Modal.Body>
        <Modal.Footer>
          <Button type="submit" form="edit" variant="danger">
            Change.
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close.
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default Index;
