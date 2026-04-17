"use client";
import { useEffect, useState } from "react";

export default function OrphansPage() {
  const [orphans, setOrphans] = useState([]);

  useEffect(() => {
    fetch("/api/orphans")
      .then((res) => res.json())
      .then((data) => setOrphans(data));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Orphaned DMC Entries</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2">Title</th>
            <th className="border p-2">Platform</th>
            <th className="border p-2">Call Number</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orphans.map((item) => (
            <tr key={item._id} className="border-b">
              <td className="p-2 border">{item.title[0]}</td>
              <td className="p-2 border">{item.platform[0]}</td>
              <td className="p-2 border text-sm font-mono">{item.callnumber}</td>
              <td className="p-2 border">
                <button className="bg-blue-600 text-white px-3 py-1 rounded">
                  Find Match
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
