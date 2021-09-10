#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod incrementer {

    const ONE_DAY: u64 = 86400000;

    #[ink(event)]
    pub struct TimestampsUpdated {
        pub when: Timestamp,
    }

    #[derive(Default)]
    #[ink(storage)]
    pub struct Incrementer {
        value: u16,
        current_timestamp: Timestamp,
        next_allowed_timestamp: Timestamp,
        did_update_today: bool,
    }

    impl Incrementer {
        /// Constructor that initializes the `u16` value to `0`.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                value: 0,
                current_timestamp: Self::env().block_timestamp(),
                next_allowed_timestamp: Self::env().block_timestamp() + ONE_DAY,
                did_update_today: false,
            }
        }

        #[ink(message)]
        pub fn increment(&mut self) {
            self.check_update();
            if self.did_update_today {
                panic!("Already incremented today!");
            }
            self.value += 1;
            self.did_update_today = true;
        }

        /// Simply returns the current value of our `u16`.
        #[ink(message)]
        pub fn get(&self) -> u16 {
            self.value
        }

        #[ink(message)]
        pub fn check_update(&mut self) {
            if self.timestamp() > self.next_allowed_timestamp {
                self.next_allowed_timestamp = self.timestamp() + ONE_DAY;
                self.did_update_today = false;
                self.env().emit_event(TimestampsUpdated {
                    when: self.timestamp(),
                })
            }
        }

        #[ink(message)]
        #[inline]
        pub fn timestamp(&self) -> Timestamp {
            self.current_timestamp
        }

        #[ink(message)]
        pub fn set_timestamp(&mut self, new_timestamp: Timestamp) {
            self.current_timestamp = new_timestamp;
        }
    }
}
