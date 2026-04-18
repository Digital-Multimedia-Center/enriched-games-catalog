"use client";
import { useEffect, useState } from "react";
import styles from "./orphansPage.module.css";
import { markIgnored, handleIgdbMatch } from "../lib/mongodb.js";

export default function OrphansPage() {
  const [orphans, setOrphans] = useState([]);
  const [page, setPage] = useState(1);

  const fetchOrphans = () => {
    fetch(`/api/orphans?page=${page}`)
      .then((res) => res.json())
      .then((data) => setOrphans(data));
  };

  useEffect(() => {
    fetchOrphans();
  }, [page]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Orphaned DMC Entries</h1>
      
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeader}>
            <th className={styles.th}>Folio ID</th>
            <th className={styles.th}>Title + Alternative Title</th>
            <th className={styles.th}>Platform + Edition</th>
            <th className={styles.th}>Call Number</th>
            <th className={styles.th}>Ignore</th>
            <th className={styles.th}>IGDB ID</th>
            <th className={styles.th}>Save</th>
          </tr>
        </thead>
        <tbody>
          {orphans.map((item) => {
            const formId = `form-${item._id}`;
            return (
              <tr key={item._id} className={styles.row}>
                <td className={styles.td}>
                  <a href={`https://catalog.lib.msu.edu/Record/${item._id}`} target="_blank">{item._id}</a>
                </td>
                <td className={styles.td}>
                  <ul>
                    {[...(item.title || []), ...(item.alternative_titles || [])].map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </td>
                <td className={styles.td}>
                  <ul>
                    {[...(item.platform || []), ...(item.edition || [])].map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </td>
                <td className={`${styles.td} ${styles.callNumber}`}>{item.callnumber}</td>

                {/* LOGIC STARTS HERE */}
                <td className={styles.td}>
                  <form 
                    id={formId} 
                    action={async (formData) => {
                      const ignore = formData.get("ignore") === "on";
                      const igdbId = formData.get("igdbId").trim();

                      // Validation: Both provided
                      if (ignore && igdbId) {
                        return alert("Error: You cannot ignore an item AND provide an IGDB ID at the same time.");
                      }

                      if (ignore) {
                        const res = await markIgnored(item._id, true);
                        if (res.success) fetchOrphans();
                      } else {
                        const res = await markIgnored(item._id, false);
                        if (res.success) fetchOrphans();
                      }
                    }}
                  />
                  <input form={formId} name="ignore" type="checkbox" defaultChecked={!!item.ignore} />
                </td>
                <td className={styles.td}>
                  <input form={formId} name="igdbId" type="text" placeholder="Enter ID..." />
                </td>
                <td className={styles.td}>
                  <button form={formId} type="submit" className={styles.button}>save</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button 
          className={styles.button} 
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button 
          className={styles.button} 
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
