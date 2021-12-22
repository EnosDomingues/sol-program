import { Button, Flex, Input } from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  SystemProgram,
  TransactionInstruction,
  SendOptions,
} from "@solana/web3.js";

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signAndSendTransaction"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signAndSendTransaction: (
    transaction: Transaction,
    options?: SendOptions
  ) => Promise<{ signature: string }>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

const getProvider = (): PhantomProvider | undefined => {
  if(typeof window !== "undefined") {
    if ("solana" in window) {
      const anyWindow: any = window;
      const provider = anyWindow.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
  }
};

const Home: NextPage = () => {
  const [name, setName] = useState<string>('')
  const provider = getProvider();
  const [, setConnected] = useState<boolean>(false);

  const connectToPhantom = async () => {
    try {
      const res = await provider?.connect();
      console.log(res);
    } catch (err) {
      console.warn(err);
    }
  }

  const disconnectToPhantom = async () => {
    try {
      const res = await provider?.disconnect();
    } catch (err) {
      console.warn(err);
    }
  }

  useEffect(() => {
    if (provider) {
      provider.on("connect", () => {
        setConnected(true);
      });
      provider.on("disconnect", () => {
        setConnected(false);
      });
      // try to eagerly connect
      provider.connect({ onlyIfTrusted: true }).catch(() => {
        // fail silently
      });
      return () => {
        provider.disconnect();
      };
    }
  }, [provider]);

  return (
    <Flex h="100vh" w="100%" direction="column" align="center" justify="center" >
      <Flex w="300px" direction="column">
        {provider?.publicKey && (
          <>
            <Input placeholder="Name" onChange={(e) => setName(e.target.value)}/>
            <Button colorScheme="twitter" mt="4"> Create </Button>
          </>
        )}
        {provider?.publicKey ? 
          (
            <Button colorScheme="facebook" mt="4" onClick={() => disconnectToPhantom()}> Disconnect </Button>
          ):
          (
            <Button colorScheme="facebook" mt="4" onClick={() => connectToPhantom()}> Connect </Button>
          )
        }
      </Flex>
    </Flex>
  )
}

export default Home
