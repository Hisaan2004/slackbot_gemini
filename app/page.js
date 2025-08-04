
"use client"; // if you're using App Router
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/embedding", {
        method: "POST", // use POST if processing data
      });

      const data = await res.json();
      console.log("Response:", data);
    } catch (err) {
      console.error("API call failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="text-black bg-white rounded p-2"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Processing..." : "Click Me"}
      </button>
    </div>
  );
}
