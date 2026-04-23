"use client";
import { useEffect, useState } from "react";
import styles from "./orphansPage.module.css";
import { markIgnored } from "../lib/mongodb.js";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <h1 className="text-2xl font-bold mb-6">Orphaned DMC Entries</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Ignore</TableHead>
              <TableHead>Folio ID</TableHead>
              <TableHead>Title + Alternative Title</TableHead>
              <TableHead>Platform + Edition</TableHead>
              <TableHead>Call Number</TableHead>
              <TableHead>IGDB ID</TableHead>
              <TableHead className="text-right">Save</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orphans.map((item) => {
              const formId = `form-${item._id}`;
              return (
                <TableRow key={item._id}>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        await markIgnored(item._id, true);
                        fetchOrphans();
                      }}
                    >
                      Ignore
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    <a
                      href={`https://catalog.lib.msu.edu/Record/${item._id}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {item._id}
                    </a>
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside text-sm">
                      {[...(item.title || []), ...(item.alternative_titles || [])].map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {[...(item.platform || []), ...(item.edition || [])].map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.callnumber}</TableCell>
                  <TableCell>
                    <Input
                      form={formId}
                      name="igdbId"
                      type="text"
                      placeholder="ID..."
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button form={formId} type="submit" size="sm">
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center space-x-4 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm font-medium">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
