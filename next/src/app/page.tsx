"use client";

import { useState, useEffect, useCallback } from "react";
import metamaskIcon from "../../public/assets/images/MetaMask_Fox.png";
import NextLink from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useBalance,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useDisconnect } from "wagmi";
import axios from "axios";
import { merkleAbi, tokenAbi, dummyAbi } from "../contract/contract";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Avatar,
  Box,
  Button,
  Container,
  DarkMode,
  Divider,
  Grid,
  Icon,
  IconButton,
  Image,
  LightMode,
  Link,
  LinkBox,
  LinkOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaDiscord,
  FaGithub,
  FaMedium,
  FaSquareXTwitter,
  FaTelegram,
} from "react-icons/fa6";
import Tweet from "./components/tweet";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { withOGImage } from "next-api-og-image";
import { Img } from "@chakra-ui/react";
import { motion, useMotionValue } from "framer-motion";
import CircularProgress from "./components/done";
import CircularProgressDeny from "./components/deny";
import { handleAdd } from "./components/addToken";
import { useSignMessage } from "wagmi";
import { timeStamp } from "console";

const API_URL = "https://pointserver.cashmere.exchange/";
const TOKEN_CONTRACT_ADDRESS = "0x749BbBE0ad269C83f607eDF0a08CD7EEEbC12E87";
const CLAIM_CONTRACT_ADDRESS = "0x80498defb87d4587Faa567Ab9988fdbF8c89d83d";
const CLAIM_CONTRACT_ADDRESS_OLD = "0xb667cDEFFE7B52DdCb8B0D3C1e10C1cDD56fBdb7";
const CLAIM_CONTRACT_ABI = merkleAbi;


function countZeros(str: string): number {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "0") {
      count++;
    }
  }
  return count;
}

function App({ params }: { params: { name: string } }) {
  const [merkleProof, setMerkleProof] = useState<string[] | null>(null);
  const [isEligible, setEligible] = useState<boolean | null>(null);
  const [isClaiming, setClaiming] = useState<boolean | null>(null);
  const [loadingState, setLoadingState] = useState<boolean | undefined>(false);
  const [userAmount, setUserAmount] = useState<string | null>(null);
  const [clickedPage, setClickedPage] = useState<number | null>(2);
  const [season1Amount, setSeason1Amount] = useState<number | null>(0);
  const [userAmountWei, setUserAmountWei] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<
    | { decimals: number; formatted: string; symbol: string; value: bigint }
    | undefined
  >(undefined);
  const [showTweet, setShowTweet] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: balance, refetch } = useBalance({
    address: address,
    token: TOKEN_CONTRACT_ADDRESS,
    unit: "gwei",
  });
  const progress = useMotionValue(90);
  const {
    data: hash,
    writeContractAsync,
    isSuccess,
    isError,
  } = useWriteContract();
  const {
    data: receiptData,
    status: txStatus,
    isError: isErrorReceipt,
    isPending: isPendingReceipt,
    isSuccess: isSuccessReceipt,
    isFetched,
  } = useWaitForTransactionReceipt({
    hash: hash,
  });
  const { data: hasClaimed1, refetch: refetchHasClaimed } = useReadContract({
    abi: CLAIM_CONTRACT_ABI,
    address: CLAIM_CONTRACT_ADDRESS,
    functionName: "hasClaimed",
    args: [address],
  });

  const { data: hasClaimed1Old, refetch: refetchHasClaimedOld } =
    useReadContract({
      abi: CLAIM_CONTRACT_ABI,
      address: CLAIM_CONTRACT_ADDRESS_OLD,
      functionName: "hasClaimed",
      args: [address],
    });

  const [timestampAuth, setTimestampAuth] = useState<string | null>(null);
  const { signMessageAsync } = useSignMessage();

  const seed_1 = Number(process.env.NEXT_PUBLIC_SEED_1);
  const seed_2 = Number(process.env.NEXT_PUBLIC_SEED_2);

  function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000); 
  }
  const handleSignMessage = async () => {
    if (address != undefined) {
      try {
        const zerosCount = countZeros(address?.toString()) + seed_1;
        const timestamp = getCurrentTimestamp();
        setTimestampAuth(timestamp.toString());

        const messageSing = timestamp - ((timestamp - zerosCount) % seed_2);
        
        const signature = await signMessageAsync({
          message: messageSing.toString(),
        });
        const address1 = address;
        const response = await fetch("/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address1, signature, timestamp, messageSing }),
        });
        const token1 = await response.json();
        return token1.message;
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    }
  };

  useEffect(() => {
    setTokenBalance(balance);
    setMerkleProof(null);
    refetchHasClaimed();
    refetchHasClaimedOld();
    setEligible(null);
    setUserAmount(null);
    setUserAmountWei(null);
  }, [address]);

  useEffect(() => {
    refetch();
    refetchHasClaimed();
    refetchHasClaimedOld();
    setTokenBalance(balance);
  }, [
    isSuccess,
    isError,
    isErrorReceipt,
    isSuccessReceipt,
    isPendingReceipt,
    isFetched,
    receiptData,
    txStatus,
  ]);

  const handleEligibility = async () => {
    const token12 = await handleSignMessage();
    const getUserProof = async () => {
      setLoadingState(true);
      if (!address) return;
      setTokenBalance(balance);
      const userData = await axios.get(`${API_URL}/getproof`, {
        params: {
          address,
          token12,
          timestampAuth,
        },
      });

      if (userData.data.eligible) {
        setUserAmount(formatAmount(userData.data.value[1]));
        setUserAmountWei(userData.data.value[1]);
        setMerkleProof(userData.data.proof);
        setEligible(true);
        setLoadingState(false);
        setClaiming(false);
      } else {
        setEligible(false);
        setLoadingState(false);
      }

    };

    if (isEligible !== true) {
      setSeason1Amount(Number(formatAmount(balance?.value.toString())));
    }

    refetchHasClaimed();
    refetchHasClaimedOld();

    if (hasClaimed1 === true) {
      console.log("sa")
      console.log(userAmount)
      setSeason1Amount(
        Number(formatAmount(balance?.value.toString())) -
          Number(userAmount)
      );
    } else {
      
      setSeason1Amount(Number(formatAmount(balance?.value.toString())));
    }

    if (isConnected) {
      getUserProof();
    }
  };

  function formatAmount(amountWithDecimals: string | undefined): string {
    const decimalPlaces = 18; // Assuming 18 decimal places

    if (amountWithDecimals !== undefined) {
      const amount = Number(amountWithDecimals);
      const divisor = 10 ** decimalPlaces;
      const isInteger = amount % divisor === 0;

      if (isInteger) {
        return (amount / divisor).toString();
      } else {
        const formattedAmount = (amount / divisor).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          useGrouping: false,
        });
        return formattedAmount;
      }
    }

    return "Couldn't Fetch";
  }

  useEffect(() => {
    return () => {
      if (clickedPage === 2) {
       
        handleButtonClick(2);
      }
    };
  }, []);

  const handleClaim = async () => {
    try {
      onOpen();
      setClaiming(true);
      await writeContractAsync({
        address: CLAIM_CONTRACT_ADDRESS,
        abi: CLAIM_CONTRACT_ABI,
        functionName: "claim",
        args: [userAmountWei, merkleProof],
        chainId: 10,
      });
    } catch (error) {
      setClaiming(false);
    }
  };

  const handlePageState = (i: number) => {
    try {
      const list = [1, 2];
      list.forEach((k) => {
        const boxes = document.getElementById(`page-${k}`);
        if (boxes) {
          boxes.style.display = "none";
        }
      });

      const selectedBox = document.getElementById(`page-${i}`);
      if (selectedBox) {
        selectedBox.style.display = "block";
        setClickedPage(i);
      }
    } catch (error) {}
  };

  const handleButtonClick = (i: number) => {
    return () => {
      handlePageState(i);
    };
  };

  const handleTweet = async () => {
    setShowTweet(!showTweet);
  };

  return (
    <main>
      <div className="main-container">
        <DarkMode>
          <Box
            id="header"
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
          >
            <Modal isOpen={isOpen} onClose={onClose} isCentered={true}>
              <ModalOverlay />
              <ModalContent
                backgroundColor="#232323"
                alignItems="center"
                color="white"
                m={2}
              >
                <ModalCloseButton />
                <ModalBody textAlign="center">
                  {isPendingReceipt === true && isClaiming === true && (
                    <>
                      <Spinner size="xl" m={5} />
                      {isSuccess !== true ? (
                        <>
                          {" "}
                          <Text m={2}>Waiting for your confirmation</Text>
                          <Text m={2}>
                            Please confirm this transaction in your wallet
                          </Text>
                        </>
                      ) : (
                        <>
                          {" "}
                          <Text m={2}>Transaction Sent</Text>
                          <Text m={2}>Waiting Tx Receipt</Text>
                        </>
                      )}
                    </>
                  )}
                  {isErrorReceipt === true ||
                    (isError === true && (
                      <>
                        <Box
                          display="flex"
                          flexDirection="column"
                          justifyItems="center"
                          alignItems="center"
                          pt={5}
                        >
                          <motion.div
                            initial={{ x: 0 }}
                            animate={{ x: 100 }}
                            style={{ x: progress }}
                            transition={{ duration: 1 }}
                          />
                          <CircularProgressDeny progress={progress} />
                          <Text m={2}>Tx Failed</Text>
                        </Box>
                      </>
                    ))}
                  {isSuccessReceipt === true && (
                    <>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyItems="center"
                        alignItems="center"
                        pt={5}
                      >
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: 100 }}
                          style={{ x: progress }}
                          transition={{ duration: 1 }}
                        />
                        <CircularProgress progress={progress} />
                        <Text m={2}>Claimed</Text>
                        <Box
                          backgroundColor="rgb(26, 26, 26)"
                          borderWidth="1px"
                          borderColor="rgba(255,255,255,0.30);"
                          borderRadius="lg"
                          m={2}
                        >
                          <Text textAlign="center" alignSelf="center" m={2}>
                            TxHash
                          </Text>
                          <Divider size="sm" my={2} />
                          <Text overflowWrap="anywhere" mx={2}>
                            {hash}
                          </Text>
                        </Box>
                      </Box>
                    </>
                  )}

                  <Box mt={10}>
                    <Text fontWeight={600}>Claiming Rewards</Text>
                    <Box
                      borderWidth="1px"
                      borderColor="rgba(255,255,255,0.30);"
                      borderRadius="lg"
                      p={0}
                      my={2}
                    >
                      <TableContainer
                        backgroundColor={"rgb(26, 26, 26)"}
                        borderRadius="lg"
                        whiteSpace="nowrap"
                        my={0}
                      >
                        <Table variant="simple">
                          <Tbody>
                            <Tr textAlign="center">
                              <Td textAlign="left" pl={5}>
                                <Box
                                  display="flex"
                                  flexDirection="row"
                                  alignItems="center"
                                  justifyContent="start"
                                  gap={2}
                                  p={0}
                                >
                                  <Img
                                    src="/assets/images/white.svg"
                                    w="24px"
                                    ml={0}
                                  />
                                  <Text backgroundColor="rgb(26, 26, 26)">
                                    GoatPoints
                                  </Text>
                                </Box>
                              </Td>
                              <Td textAlign="right">
                                <Text fontWeight={600}>{userAmount}</Text>
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                </ModalBody>
              </ModalContent>
            </Modal>
            <Image
              transform={"scale(0.8)"}
              width="50px"
              margin={1}
              src="/assets/images/white.svg"
            />
            <Text fontSize="xl" color="white">
              Cashmere
            </Text>
          </Box>
          <Box id="main-c" alignItems="center" justifyContent="center" display="flex">
            <Container
              maxW={{ xs: "95%", md: "100%", lg: "30vw", xl: "30vw" }}
              w={{ xs: "95%", md: "100%", lg: "30vw", xl: "30vw" }}
              margin="5px"
              className="container-1"
              display="flex"
            >
              <Grid
                zIndex={1}
                backgroundColor="rgb(26, 26, 26)"
                alignItems="center"
                justifyContent="center"
                color="white"
                width="100%"
                display="flex"
                flexDirection="column"
                margin={1}
              >
                {isConnected && (
                  <>
                    <Box
                      width="100%"
                      alignItems="center"
                      justifyContent="center"
                      display="flex"
                      borderRadius="lg"
                      gap={1}
                      id="tab-buttons"
                      marginTop={3}
                      scale={0.5}
                    >
                      <Button
                        borderBottomRadius={0}
                        width="30%"
                        onClick={handleButtonClick(1)}
                        opacity={clickedPage === 1 ? 1 : 0.5}
                        flexWrap={"wrap"}
                        fontSize={"small"}
                      >
                        Season 1
                      </Button>
                      <Button
                        borderBottomRadius={0}
                        width="30%"
                        opacity={clickedPage === 2 ? 1 : 0.5}
                        onClick={handleButtonClick(2)}
                        flexWrap={"wrap"}
                        padding={1}
                        fontSize={"small"}
                      >
                        Season 1+
                        <br />
                        RPGP
                      </Button>
                      <Button
                        borderBottomRadius={0}
                        width="30%"
                        isDisabled={true}
                        fontSize={"small"}
                      >
                        TBA
                      </Button>
                    </Box>
                    <Divider mb={10} />
                  </>
                )}

                <Box
                  mb={5}
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
                  width="100%"
                >
                  <div>
                    <ConnectButton />
                  </div>
                </Box>

                {isConnected && (
                  <>
                    <Box id="page-1" display="none">
                      <Box
                        borderRadius="lg"
                        borderWidth="1px"
                        padding={5}
                        borderColor="rgba(255,255,255,0.30);"
                        width="100%"
                      >
                        <Box>
                          <Grid
                            gap={2}
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="center"
                          ></Grid>
                        </Box>
                        <Box width="full">
                          <>
                            <Box
                              width="full"
                              alignItems="center"
                              justifyItems="center"
                              textAlign="center"
                              display="flex"
                              flexDirection="column"
                              mt={2}
                            >
                              {isEligible === null ? (
                                <Button
                                  onClick={handleEligibility}
                                  isLoading={loadingState}
                                  mb={5}
                                  colorScheme="gray"
                                >
                                  Check Your Eligibility
                                </Button>
                              ) : (
                                <>
                                  {isConnected === true &&
                                  hasClaimed1Old === true &&
                                  isEligible !== null ? (
                                    <>
                                      {Number(season1Amount) > 0 && (
                                        <>
                                          <Text
                                            fontSize="lg"
                                            color="white"
                                            mb={2}
                                          >
                                            You've claimed{" "}
                                          </Text>
                                          <Box
                                            borderRadius="lg"
                                            borderWidth="1px"
                                            padding={2}
                                            m={2}
                                            borderColor="rgba(255,255,255,0.30);"
                                            width="90%"
                                            backgroundColor="#232323"
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                          >
                                            <Img
                                              src="/assets/images/logo_circle.jpg"
                                              w="48px"
                                              ml={0}
                                              mr={2}
                                              borderRadius="full"
                                            />
                                            <Text fontSize="3xl">
                                              {season1Amount} GoatPoints
                                            </Text>
                                          </Box>
                                          <Text
                                            fontSize="lg"
                                            color="white"
                                            mb={2}
                                          >
                                            for Season 1
                                          </Text>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    <Text fontSize="lg" color="white" mb={2}>
                                      You didn't any claim for Season 1
                                    </Text>
                                  )}
                                </>
                              )}
                            </Box>
                          </>
                        </Box>
                        <Box></Box>
                      </Box>
                      <Box
                        display="flex"
                        alignItems="center"
                        flexDirection="column"
                      >
                        <Box width="fit-content" display="flex">
                          <Link
                            as={NextLink}
                            href="https://cashmerelabs.medium.com/goat-points-season-1-1a213e895c74"
                            isExternal
                          >
                            <Text color="gray" fontSize="xs">
                              Goat Points are non-transferable tokens that
                              represent proof of loyalty.
                            </Text>
                          </Link>
                          <ExternalLinkIcon mx="2px" color="gray" />
                        </Box>
                        <Box display="flex">
                          <Link
                            as={NextLink}
                            href="https://docs.cashmere.exchange/t-and-c/terms-and-conditions"
                            isExternal
                          >
                            <Text color="gray" fontSize="xs">
                              T&C
                            </Text>
                          </Link>
                          <ExternalLinkIcon mx="2px" color="gray" />
                        </Box>
                      </Box>
                    </Box>
                    <Box id="page-2" display="block">
                      <Box
                        borderRadius="lg"
                        borderWidth="1px"
                        padding={5}
                        borderColor="rgba(255,255,255,0.30);"
                        width="100%"
                      >
                        <Box>
                          <Grid
                            gap={2}
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Box m={0}>
                              <Text fontSize="2xl" as="b">
                                Review your reward
                              </Text>
                            </Box>
                          </Grid>
                        </Box>
                        <Box width="full">
                          <>
                            <Box
                              width="full"
                              alignItems="center"
                              textAlign="center"
                              mt={5}
                            >
                              {isEligible === null ? (
                                <Button
                                  onClick={handleEligibility}
                                  isLoading={loadingState}
                                  mb={5}
                                  colorScheme="gray"
                                >
                                  Check Your Eligibility
                                </Button>
                              ) : isEligible ? (
                                <Box
                                  alignItems="center"
                                  display="flex"
                                  flexDirection="column"
                                >
                                  <Text fontSize="xl">
                                    You are eligible for{" "}
                                    <b>
                                      Season 1+ Retroactive Public Goods Points
                                    </b>
                                  </Text>
                                  <Box
                                    borderRadius="lg"
                                    borderWidth="1px"
                                    padding={2}
                                    m={2}
                                    borderColor="rgba(255,255,255,0.30);"
                                    width="90%"
                                    backgroundColor="#232323"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                  >
                                    <Img
                                      src="/assets/images/logo_circle.jpg"
                                      w="48px"
                                      ml={0}
                                      mr={2}
                                      borderRadius="full"
                                    />
                                    <Text fontSize="3xl">
                                      {userAmount} GoatPoints
                                    </Text>
                                  </Box>
                                </Box>
                              ) : (
                                <>
                                  <Text fontSize="lg" m={5}>
                                    You are not eligible for Season 1+RPGP 😔{" "}
                                  </Text>
                                  <Button
                                    fontSize="sm"
                                    variant="solid"
                                    onClick={() => disconnect()}
                                  >
                                    Try another wallet
                                  </Button>
                                </>
                              )}
                            </Box>
                            <Box
                              width="full"
                              alignItems="center"
                              justifyItems="center"
                              textAlign="center"
                              display="flex"
                              flexDirection="column"
                              mt={2}
                            >
                              {hasClaimed1 === true && isEligible !== null && (
                                <>
                                  <Text fontSize="lg" color="green" mb={2}>
                                    You've already claimed
                                  </Text>
                                  <Box m={2}>
                                    <Tweet GoatPoint={userAmount} />
                                  </Box>
                                  <DarkMode>
                                    <Button
                                      fontSize="sm"
                                      variant="link"
                                      onClick={() => disconnect()}
                                      m={2}
                                    >
                                      Try another wallet
                                    </Button>
                                  </DarkMode>
                                  <Box
                                    display="flex"
                                    flexDirection="row"
                                    alignItems="center"
                                    gap={2}
                                  >
                                    <Text>
                                      {" "}
                                      Your balance:{" "}
                                      <b>
                                        {formatAmount(
                                          balance?.value.toString()
                                        )}{" "}
                                        GoatPoints
                                      </b>
                                    </Text>{" "}
                                    <IconButton
                                      aria-label="ADD TOKEN"
                                      onClick={handleAdd}
                                      icon={
                                        <Image
                                          src="/assets/images/MetaMask_Fox.png"
                                          w="32px"
                                        />
                                      }
                                    />
                                  </Box>
                                </>
                              )}
                              {isEligible === true && hasClaimed1 !== true && (
                                <>
                                  <Box
                                    display="flex"
                                    alignContent="center"
                                    justifyContent="center"
                                    flexDirection="column"
                                    width="max-content"
                                    marginBottom={5}
                                  >
                                    <DarkMode>
                                      <Button onClick={handleClaim} mb={3}>
                                        Claim
                                      </Button>
                                      <Tweet GoatPoint={userAmount} />
                                      <Button
                                        fontSize="sm"
                                        variant="link"
                                        onClick={() => disconnect()}
                                        mt={5}
                                      >
                                        Try another wallet
                                      </Button>
                                    </DarkMode>
                                  </Box>
                                  <Box
                                    display="flex"
                                    flexDirection="row"
                                    alignItems="center"
                                    gap={2}
                                  >
                                    <Text>
                                      {" "}
                                      Your balance:{" "}
                                      <b>
                                        {formatAmount(
                                          balance?.value.toString()
                                        )}{" "}
                                        GoatPoints
                                      </b>
                                    </Text>{" "}
                                    <IconButton
                                      aria-label="ADD TOKEN"
                                      onClick={handleAdd}
                                      icon={
                                        <Image
                                          src="/assets/images/MetaMask_Fox.png"
                                          w="32px"
                                        />
                                      }
                                    />
                                  </Box>
                                </>
                              )}
                            </Box>
                          </>
                        </Box>
                        <Box></Box>
                      </Box>
                      <Box
                        display="flex"
                        alignItems="center"
                        flexDirection="column"
                      >
                        <Box width="fit-content" display="flex">
                          <Link
                            as={NextLink}
                            href="https://cashmerelabs.medium.com/goat-points-season-1-1a213e895c74"
                            isExternal
                          >
                            <Text color="gray" fontSize="xs">
                              Goat Points are non-transferable tokens that
                              represent proof of loyalty.
                            </Text>
                          </Link>
                          <ExternalLinkIcon mx="2px" color="gray" />
                        </Box>
                        <Box display="flex">
                          <Link
                            as={NextLink}
                            href="https://docs.cashmere.exchange/t-and-c/terms-and-conditions"
                            isExternal
                          >
                            <Text color="gray" fontSize="xs">
                              T&C
                            </Text>
                          </Link>
                          <ExternalLinkIcon mx="2px" color="gray" />
                        </Box>
                      </Box>
                    </Box>
                  </>
                )}
              </Grid>
            </Container>
          </Box>
          <Box id="footer" gap={4}>
            <LinkBox>
              <LinkOverlay
                href="https://twitter.com/cashmerelabs"
                isExternal={true}
              >
                <Icon color="gray" boxSize={6} as={FaSquareXTwitter} />
              </LinkOverlay>
            </LinkBox>
            <LinkBox>
              <LinkOverlay
                href="https://cashmerelabs.medium.com/"
                isExternal={true}
              >
                <Icon color="gray" boxSize={6} as={FaMedium} />
              </LinkOverlay>
            </LinkBox>
            <LinkBox>
              <LinkOverlay
                href="https://github.com/cashmere-labs#"
                isExternal={true}
              >
                <Icon color="gray" boxSize={6} as={FaGithub} />
              </LinkOverlay>
            </LinkBox>
            <LinkBox>
              <LinkOverlay href="https://t.me/cashmerelabs" isExternal={true}>
                <Icon color="gray" boxSize={6} as={FaTelegram} />
              </LinkOverlay>
            </LinkBox>
            <LinkBox>
              <LinkOverlay
                href="https://discord.gg/cashmerelabs"
                isExternal={true}
              >
                <Icon color="gray" boxSize={6} as={FaDiscord} />
              </LinkOverlay>
            </LinkBox>
          </Box>
        </DarkMode>
      </div>
    </main>
  );
}

export default App;
