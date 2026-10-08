import { useState, useEffect, useCallback } from "react";

export interface Contact {
  id: string;
  name: string;
  address: string;
  note?: string;
  createdAt: number;
}

const STORAGE_KEY = "chainchat_address_book_v1";

export function useAddressBook() {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [
        {
          id: "default-merchant-1",
          name: "Polygon Amoy Faucet",
          address: "0x409540c14A1b86927a3c3c7271923e3FE77f8059",
          note: "Official faucet dispenser pool",
          createdAt: Date.now() - 86400000,
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error("Failed to save address book:", e);
    }
  }, [contacts]);

  const addContact = useCallback((name: string, address: string, note?: string) => {
    const cleanAddress = address.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      throw new Error("Invalid Polygon/Ethereum address format");
    }

    const newContact: Contact = {
      id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      address: cleanAddress,
      note: note?.trim(),
      createdAt: Date.now(),
    };

    setContacts(prev => [newContact, ...prev]);
    return newContact;
  }, []);

  const removeContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const getContactByAddress = useCallback((address: string) => {
    return contacts.find(c => c.address.toLowerCase() === address.toLowerCase());
  }, [contacts]);

  return {
    contacts,
    addContact,
    removeContact,
    getContactByAddress,
  };
}
