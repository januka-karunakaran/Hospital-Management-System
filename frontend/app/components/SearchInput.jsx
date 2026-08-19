"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-bar" style={{ width: "100%", maxWidth: 360 }}>
      <FaSearch style={{ color: "var(--text-muted)", fontSize: 13, flexShrink: 0 }} />
      <input
        type="text"
        placeholder="Search doctors, appointments..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

