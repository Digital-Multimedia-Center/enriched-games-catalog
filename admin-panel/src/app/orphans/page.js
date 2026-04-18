"use client";
import { useEffect, useState } from "react";
import styles from "./orphansPage.module.css";

export default function OrphansPage() {
  const [orphans, setOrphans] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/orphans?page=${page}`)
      .then((res) => res.json())
      .then((data) => setOrphans(data));
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
          {orphans.map((item) => (
            <tr key={item._id} className={styles.row}>
              <td className={styles.td}>
                <a href={`https://catalog.lib.msu.edu/Record/${item._id}`} target="_blank">
                  {item._id}
                </a>
              </td>
              <td className={styles.td}>
                <ul>
                  {[...(item.title || []), ...(item.alternative_titles || [])].map((title, index) => (
                    <li key={index}>{title}</li>
                  ))}
                </ul>
              </td>
              <td className={styles.td}>
                <ul>
                  {[...(item.paltform || []), ...(item.edition || [])].map((platform, index) => (
                    <li key={index}>{platform}</li>
                  ))}
                </ul>
              </td>
              <td className={`${styles.td} ${styles.callNumber}`}>
                {item.callnumber}
              </td>
              <td className={styles.td}>
                <input type="checkbox" />
              </td>
              <td className={styles.td}>
                <input type="text" />
              </td>
              <td className={styles.td}>
                <button>save</button>
              </td>
            </tr>
          ))}
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
