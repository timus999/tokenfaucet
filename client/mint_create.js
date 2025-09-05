
import { createMint } from "@solana/spl-token";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";

// Connection to localnet
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const payer = Keypair.generate();

// Airdrop SOL to payer
const sig = await connection.requestAirdrop(payer.publicKey, 2e9);
await connection.confirmTransaction(sig, "confirmed");

// Derive PDA
const PROGRAM_ID = new PublicKey("8KdxbUNBeb9jYu6FeoNeXDj2RCoNkaqtnp9jtygqZptu");
const [faucetPDA, bump] = PublicKey.findProgramAddressSync([Buffer.from("faucet")], PROGRAM_ID);

// Create mint with PDA as authority
const mint = await createMint(
  connection,
  payer,       // fee payer
  faucetPDA,   // mint authority
  faucetPDA,   // freeze authority (optional)
  9            // decimals
);

console.log("✅ Mint created:", mint.toBase58());
