import type { NextPage } from "next";
import React, { useState } from "react";
import { Layout } from "../components/layout";
import { useWallet } from "../hooks/use-wallet";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils";

//bs
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";

function utf8ToHex(str: string) {
  return (
    "0x" +
    Array.from(str)
      .map((c) =>
        c.charCodeAt(0) < 128
          ? c.charCodeAt(0).toString(16)
          : encodeURIComponent(c).replace(/\%/g, "").toLowerCase()
      )
      .join("")
  );
}

const Index: NextPage = () => {
  const wallet = useWallet();

  const [targetBlock, setTargetBlock] = useState<number>(2);
  const [numberOfTokens, setNumberOfTokens] = useState<number>(2);
  const [to, setTo] = useState<string | undefined | null>(wallet.address);
  const [gasPrice, setGasPrice] = useState<number>(100);
  const [fee, setFee] = useState<number>(0.5);
  const [show, setShow] = useState(false);
  const [content, setContent] = useState({ title: "", body: <></> });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const mint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!wallet.address || !wallet.signer || !wallet.signer.provider) return;

    const formData = new FormData(e.currentTarget);
    const targetBlock = parseInt(formData.get("targetBlock") as string);
    const numberOfTokens = parseInt(formData.get("numberOfTokens") as string);
    const to = formData.get("to") as string;
    const blockNames = formData.getAll("blockNames");
    const isImmutable = formData.get("isImmutable") ? true : false;
    const blockData = formData.get("blockData") as string;
    const gasPrice = formData.get("gasPrice") as string;
    const fee = formData.get("fee") as string;

    setContent({
      title: "Confirm.",
      body: <>Waiting for the confirmation.</>,
    });
    setShow(true);

    let blockNumber;

    try {
      const abi = await fetch(contractABI);
      const nft = new ethers.Contract(
        contractAddress,
        await abi.json(),
        wallet.signer
      );

      blockNumber =
        (await wallet.signer.provider.getBlockNumber()) + targetBlock;
      const tx = await nft.mint(
        blockNumber,
        numberOfTokens,
        to,
        blockNames,
        isImmutable,
        utf8ToHex(blockData),
        15 * 10 ** 6,
        {
          value: ethers.utils.parseUnits(fee, 18),
          gasLimit: 15 * 10 ** 6,
          gasPrice: ethers.utils.parseUnits(gasPrice, 9),
        }
      );
      setContent({
        title: "Locked.",
        body: (
          <>
            Trying to mint block: <Badge bg="danger">{blockNumber}</Badge>
          </>
        ),
      });
      await tx.wait();

      setContent({
        title: "Done.",
        body: (
          <div className="text-truncate">
            The <Badge bg="danger">{blockNumber}</Badge> block is{" "}
            <a
              className="text-truncate w-100"
              href={`https://testnet.snowtrace.io/block/${blockNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              yours
            </a>
            .
          </div>
        ),
      });

      // eslint-disable-next-line
    } catch (err: any) {
      console.log(err);
      setContent({
        title: "Missed.",
        body: (
          <div>
            The block is already produced.{" "}
            <ul>
              <li>
                Target block: <Badge bg="danger">{blockNumber}</Badge>.
              </li>
              <li>
                <a
                  className="d-block text-truncate"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://testnet.snowtrace.io/tx/${
                    err.transaction ? err.transaction.hash : ""
                  }`}
                >
                  {err.transaction ? err.transaction.hash : ""}
                </a>
              </li>
            </ul>
          </div>
        ),
      });
    }
  };

  const renderFee = () => {
    if (fee > 2) return <span className="me-1">♥.</span>;
    if (fee > 0.5) return <span className="me-1">Thanks.</span>;

    return <span className="me-1">Fee.</span>;
  };

  return (
    <Layout>
      <section className="py-5">
        <Container>
          <div className="my-3 mb-5">
            <h1 className="h5">
              Owning a block on the blockchain is entirely possible.
            </h1>
            <p>Customize and set your own block parameters for minting.</p>
          </div>
          <Form className="row" onSubmit={mint}>
            <Col lg={6} md={6} sm={12}>
              <div className="mb-3">
                <Form.Label>Target Block (+{targetBlock})</Form.Label>
                <Form.Range
                  name="targetBlock"
                  required={true}
                  min={1}
                  max={21}
                  defaultValue={targetBlock}
                  onChange={(e) =>
                    setTargetBlock(parseInt(e.currentTarget.value))
                  }
                />
              </div>
              <div className="mb-3">
                <Form.Label>Number Of Tokens ({numberOfTokens})</Form.Label>
                <Form.Range
                  name="numberOfTokens"
                  min={1}
                  max={30}
                  defaultValue={2}
                  required={true}
                  onChange={(e) =>
                    setNumberOfTokens(parseInt(e.currentTarget.value))
                  }
                />
              </div>
              <div className="mb-3">
                <Form.Label>To</Form.Label>
                <FormControl
                  required={true}
                  name="to"
                  disabled={!wallet.isReady}
                  defaultValue={wallet.address ? wallet.address : ""}
                  onChange={(e) => setTo(e.currentTarget.value)}
                />
              </div>
              <div className="mb-3">
                <Form.Label>Token Name(s)</Form.Label>
                {Array.from(Array(numberOfTokens).keys()).map((num) => (
                  <div key={num} className="mb-1">
                    <FormControl
                      required={true}
                      name="blockNames"
                      placeholder={`Name of the #${num}`}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <Form.Check
                  name="isImmutable"
                  type="checkbox"
                  label="Is it immutable?"
                  id="Is it immutable?"
                />
              </div>
            </Col>
            <Col lg={6} md={6} sm={12}>
              <div className="mb-3">
                <FloatingLabel controlId="blockData" label="Block Data">
                  <Form.Control
                    required={true}
                    name="blockData"
                    as="textarea"
                    placeholder="Block Data"
                    style={{ height: "100px" }}
                  />
                </FloatingLabel>
              </div>
              <div className="mb-3">
                <Form.Label>Gas Limit</Form.Label>
                <Form.Range
                  required={true}
                  name="gasLimit"
                  disabled={true}
                  min={0}
                  max={8 * 10 ** 6}
                  defaultValue={8 * 10 ** 6}
                />
              </div>
              <div className="mb-3">
                <Form.Label>
                  Gas Price({gasPrice}
                  <sup>
                    nAVAX (10<sup>-9</sup>)
                  </sup>
                  )
                </Form.Label>
                <Form.Range
                  required={true}
                  name="gasPrice"
                  min={25}
                  max={1 * 10 ** 3}
                  defaultValue={100}
                  onChange={(e) => {
                    const gasPrice = parseFloat(e.currentTarget.value);
                    setGasPrice(gasPrice);
                  }}
                />
              </div>
              <div className="mb-3">
                <Form.Label>
                  {renderFee()}({fee}
                  <sup>AVAX</sup>)
                </Form.Label>
                <Form.Range
                  required={true}
                  name="fee"
                  min={0.2}
                  defaultValue={fee}
                  step={0.1}
                  max={5}
                  onChange={(e) => setFee(parseFloat(e.currentTarget.value))}
                />
              </div>
            </Col>
            <Col lg={12} className="text-center">
              <div className="mb-3">
                <ul className="list-inline">
                  <li className="list-inline-item">
                    <Button
                      disabled={!wallet.address}
                      variant="outline-dark"
                      type="submit"
                    >
                      Mint the block.
                    </Button>
                  </li>
                  <li className="list-inline-item">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setTargetBlock(2);
                        setNumberOfTokens(2);
                        setGasPrice(100);
                        setFee(0.5);
                      }}
                    >
                      Reset.
                    </Button>
                  </li>
                </ul>
              </div>
            </Col>
          </Form>

          <div className="py-3">
            <hr />
            <h2 className="h5">About</h2>
            <p>
              BlockRare is a unique NFT project where each minting transaction
              occupies an entire blockchain block, making these NFTs
              exceptionally rare and exclusive. This concept appeals to
              collectors who value individuality and scarcity in blockchain
              assets.
              <br />
              <br />
              <strong>What to do with it? </strong>
              <br />
              You have the remarkable opportunity to mint a block infused with
              numbers that hold special value to you.
              <br />
              <br />
              <ul>
                <li>
                  <div className="text-truncate">
                    Initial block:{" "}
                    <a
                      href="https://testnet.snowtrace.io/block/24486071"
                      target="_blank"
                      rel="noreferrer"
                    >
                      https://testnet.snowtrace.io/block/24486071
                    </a>
                  </div>
                </li>
                <li>
                  <div className="text-truncate">
                    Initial mint transaction:{" "}
                    <a
                      href="https://testnet.snowtrace.io/tx/0x053cee66bdf178dcf506a9d61d66da35b000efaff000b12d32104966581d9cec"
                      target="_blank"
                      rel="noreferrer"
                    >
                      https://testnet.snowtrace.io/tx/0x053cee66bdf178dcf506a9d61d66da35b000efaff000b12d32104966581d9cec
                    </a>
                  </div>
                </li>
              </ul>
            </p>
          </div>
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
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default Index;
