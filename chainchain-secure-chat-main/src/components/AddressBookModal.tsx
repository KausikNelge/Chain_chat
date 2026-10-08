import React, { useState } from "react";
import { X, Plus, Trash2, Search, UserCheck, BookOpen, ArrowRight } from "lucide-react";
import { useAddressBook, Contact } from "@/hooks/useAddressBook";
import { toast } from "@/hooks/use-toast";

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact?: (address: string, name: string) => void;
}

export function AddressBookModal({
  isOpen,
  onClose,
  onSelectContact,
}: AddressBookModalProps) {
  const { contacts, addContact, removeContact } = useAddressBook();
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNote, setNewNote] = useState("");

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) {
      toast({ title: "Validation Error", description: "Name and address are required", variant: "destructive" });
      return;
    }
    try {
      addContact(newName, newAddress, newNote);
      toast({ title: "Contact Saved", description: `${newName} added to your address book` });
      setNewName("");
      setNewAddress("");
      setNewNote("");
      setIsAdding(false);
    } catch (err: unknown) {
      toast({
        title: "Invalid Address",
        description: (err as Error).message || "Please check address format",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-5 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E4EA] dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E5007D] text-white flex items-center justify-center font-extrabold text-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#17131A] dark:text-white leading-tight">
                Address Book
              </h3>
              <p className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
                {contacts.length} saved {contacts.length === 1 ? "contact" : "contacts"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white hover:bg-[#F2EFF2] dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Contact Form Toggle */}
        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-3">
            <h4 className="font-heading font-bold text-xs text-[#17131A] dark:text-white">
              Add New Contact
            </h4>
            <input
              type="text"
              placeholder="Contact Name (e.g., Alice)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none dark:text-white"
            />
            <input
              type="text"
              placeholder="Polygon Address (0x...)"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none font-mono dark:text-white"
            />
            <input
              type="text"
              placeholder="Note / Tag (optional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none dark:text-white"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="chain-btn-pink py-2 px-4 text-xs font-bold cursor-pointer"
              >
                Save Contact
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="chain-btn-outline py-2 px-3 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6F6874] dark:text-[#A8A1AF]" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none dark:text-white"
              />
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="chain-btn-pink py-2 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        )}

        {/* Contacts List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {filteredContacts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6F6874] dark:text-[#A8A1AF]">
              No contacts found. Click "+ Add" to save one.
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 hover:border-[#E5007D]/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-[#E5007D]/10 text-[#E5007D] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-bold text-xs text-[#17131A] dark:text-white truncate">
                      {contact.name}
                    </p>
                    <p className="text-[10px] text-[#6F6874] dark:text-[#A8A1AF] font-mono truncate">
                      {contact.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {onSelectContact && (
                    <button
                      onClick={() => {
                        onSelectContact(contact.address, contact.name);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#E5007D] text-white text-[11px] font-bold hover:bg-[#B80063] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Select</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="p-1.5 rounded-lg text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#C62845] transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
