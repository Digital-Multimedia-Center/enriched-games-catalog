"use client";
import { useEffect, useState } from "react";
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
    <div className="p-[2.5rem]">
      <h1 className="text-2xl font-bold mb-6">Orphaned DMC Entries</h1>

      <div className="rounded-md border">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[5vw]">Actions</TableHead>
              <TableHead className="w-[10vw]">Folio ID</TableHead>
              <TableHead className="w-[40vw]">Title + Alternative Title</TableHead>
              <TableHead className="w-[10vw]">Platform + Edition</TableHead>
              <TableHead className="w-[10vw]">Call Number</TableHead>
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
                    <Button form={formId} type="submit" size="sm">Edit</Button>
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
                        <li key={i} className="truncate">{t}</li>
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
                  <TableCell className="font-mono text-xs truncate">{item.callnumber}</TableCell>
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
