// this project handles requests, keep track of who claimed, and mints token to the user

// it consist a mint account which will mint token and the faucet will distribute

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
};

use spl_token::instruction as token_instruction;

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let user_token_account = next_account_info(accounts_iter)?;
    let faucet_mint = next_account_info(accounts_iter)?;
    let mint_authority_pda = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;

    let amount: u64 = 1_000_000_000;

    // This bump must be passed from client (or derived inside program if included in instruction_data)
    let (expected_pda, bump) = Pubkey::find_program_address(&[b"faucet"], program_id);

    // sanity check
    if *mint_authority_pda.key != expected_pda {
        msg!("Invalid faucet PDA provided");
        return Err(solana_program::program_error::ProgramError::InvalidSeeds);
    } // mint to user

    let ix = token_instruction::mint_to(
        token_program.key,
        faucet_mint.key,
        user_token_account.key,
        mint_authority_pda.key,
        &[],
        amount,
    )?;

    // PDA seeds for signing
    let seeds = &[b"faucet".as_ref(), &[bump]];

    invoke_signed(
        &ix,
        &[
            faucet_mint.clone(),
            user_token_account.clone(),
            mint_authority_pda.clone(),
            token_program.clone(),
        ],
        &[seeds],
    )?;

    msg!("minted {} tokens to user!", amount);
    Ok(())
}
