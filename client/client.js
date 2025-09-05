import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  } from "@solana/web3.js";

  import {
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
  }  from "@solana/spl-token";


  const PROGRAM_ID = new PublicKey("8KdxbUNBeb9jYu6FeoNeXDj2RCoNkaqtnp9jtygqZptu");

  const MINT_ADDRESS = new PublicKey("9HJmqGsHmyaFrs5DWgkNHP9DxxDNzfnXS5w3n32kbN3p");

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  (async () => {

    const user = Keypair.generate();

    let sig = await connection.requestAirdrop(user.publicKey, 2e9);
    await connection.confirmTransaction(sig);

    console.log("User Wallet:", user.publicKey.toBase58());


    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      MINT_ADDRESS,
      user.publicKey,
    );

    console.log("User token Account:", userTokenAccount.address.toBase58());


    const [faucetPDA, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("faucet")],
      PROGRAM_ID
    );

    console.log("Bump: ", bump);


    const instruction = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: userTokenAccount.address, isSigner: false, isWritable: true},
        { pubkey: MINT_ADDRESS, isSigner: false, isWritable: true},
        { pubkey: faucetPDA, isSigner: false, isWritable: false},
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
      ],
      data: Buffer.alloc(0),
    });

    const tx = new Transaction().add(instruction);

    const txSig = await sendAndConfirmTransaction(connection, tx, [user]);
    console.log("Faucet tx signature: ", txSig);


    const accountInfo = await connection.getTokenAccountBalance(userTokenAccount.address);
    console.log("User token address: ", accountInfo.value.uiAmount);
    
  })();
