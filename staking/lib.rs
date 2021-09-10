#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

pub trait Stakeable {
    fn claim(&mut self, amount: Balance) {
        self.staked_balances.insert(
            self.env().caller(),
            (self.env().block_timestamp() + ONE_DAY, amount),
        );
    }

    #[ink(message)]
    fn withdraw(&mut self) -> Option<Balance> {
        let stake_info = self.staked_balances.get(&self.env().caller());
        if stake_info.is_some() && self.env().block_timestamp() > stake_info.unwrap().0 {
            stake_info.unwrap().1
        }
        None
    }
}

#[ink::contract]
mod staking {
    use ink_storage::collections::HashMap;

    const ONE_DAY: u64 = 86400000;

    #[derive(Default)]
    #[ink(storage)]
    pub struct Staking {
        staked_balances: HashMap<AccountId, (Timestamp, Balance)>,
    }

    impl Staking {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self::default()
        }

        #[ink(message)]
        pub fn claim(&mut self, amount: Balance) {
            self.staked_balances.insert(
                self.env().caller(),
                (self.env().block_timestamp() + ONE_DAY, amount),
            );
        }

        #[ink(message)]
        pub fn withdraw(&mut self) -> Option<Balance> {
            let stake_info = self.staked_balances.get(&self.env().caller());
            if stake_info.is_some() && self.env().block_timestamp() > stake_info.unwrap().0 {
                stake_info.unwrap().1
            }
            None
        }
    }
}
