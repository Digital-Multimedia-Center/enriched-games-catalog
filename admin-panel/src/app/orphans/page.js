"use client";
import { useEffect, useState } from "react";
import { markIgnored } from "@/lib/mongodb.js";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getGameById, searchPlatforms } from "./actions.js";

export default function OrphansPage() {
  const [orphans, setOrphans] = useState([]);
  const [page, setPage] = useState(1);

  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ igdbId: "", platform: "" });

  const [igdbPreview, setIgdbPreview] = useState(null);
  const [platformMatches, setPlatformMatches] = useState([]);
  const [loadingIgdb, setLoadingIgdb] = useState(false);

  const fetchOrphans = () => {
    fetch(`/api/orphans?page=${page}`)
      .then((res) => res.json())
      .then((data) => setOrphans(data));
  };

  useEffect(() => {
    fetchOrphans();
  }, [page]);

  const handleSave = async () => {
    console.log("do work on database");
    setEditingItem(null);
    fetchOrphans();
  };

  const handleIgdbSearch = async () => {
    if (!formData.igdbId) return;
    setLoadingIgdb(true);
    const result = await getGameById(formData.igdbId);
    if (result.success) {
      setIgdbPreview(result.data);
    } else {
      alert(result.error);
      setIgdbPreview(null);
    }
    setLoadingIgdb(false);
  };

  const handlePlatformInput = async (val) => {
    setFormData({ ...formData, platform: val });
    if (val.length > 1) {
      const result = await searchPlatforms(val);
      if (result.success) setPlatformMatches(result.platforms);
    } else {
      setPlatformMatches([]);
    }
  };

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
                    <Button 
                    size="sm" 
                    onClick={() => {
                      setEditingItem(item);
                      setIgdbPreview(null);
                      setPlatformMatches([]);
                      setFormData({igdbId: "", platform: ""})
                    }}
                    >
                      Edit
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

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => {
          setEditingItem(null);
          setIgdbPreview(null);
          setPlatformMatches([]);
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enrich Entry: {editingItem?._id}</DialogTitle>
            </DialogHeader>
        
            {/* Metadata Reference Box */}
            {editingItem && (
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-2 mb-4 border">
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">DMC Titles</span>
                  {[...(editingItem.title || []), ...(editingItem.alternative_titles || [])].map((t, i) => (
                    <p key={i} className="leading-tight">{t}</p>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1 border-t border-border/50">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">Source Platform</span>
                    <p className="text-xs">{[...(editingItem.platform || []), ...(editingItem.edition || [])].join(", ") || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">Call Number</span>
                    <p className="font-mono text-xs">{editingItem.callnumber}</p>
                  </div>
                </div>
              </div>
            )}
        
            <div className="space-y-6 py-2">
              {/* IGDB SECTION */}
              <div className="grid gap-2">
                <Label htmlFor="igdbId">IGDB Game ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="igdbId"
                    type="number"
                    placeholder="e.g. 21968"
                    value={formData.igdbId}
                    onChange={(e) => setFormData({ ...formData, igdbId: e.target.value })}
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleIgdbSearch}
                    disabled={loadingIgdb || !formData.igdbId}
                  >
                    {loadingIgdb ? "..." : "Verify"}
                  </Button>
                </div>
        
                {/* IGDB Visual Preview */}
                {igdbPreview && (
                  <div className="flex gap-3 p-2 border rounded-md bg-accent/10 animate-in fade-in slide-in-from-top-1">
                    {igdbPreview.cover?.image_id ? (
                      <img 
                        src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${igdbPreview.cover.image_id}.jpg`} 
                        alt="cover"
                        className="w-12 h-16 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-muted rounded flex items-center justify-center text-[10px]">No Cover</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{igdbPreview.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                        {igdbPreview.summary || "No summary available."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
        
              {/* PLATFORM SECTION */}
              <div className="grid gap-2 relative">
                <Label htmlFor="platform">Target Platform</Label>
                <Input
                  id="platform"
                  placeholder="Search database platforms..."
                  value={formData.platform}
                  onChange={(e) => handlePlatformInput(e.target.value)}
                  autoComplete="off"
                />
                
                {/* Platform Suggestion Dropdown */}
                {platformMatches.length > 0 && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-popover border rounded-md shadow-lg z-50 overflow-hidden">
                    {platformMatches.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex justify-between items-center transition-colors"
                        onClick={() => {
                          setFormData({ ...formData, platform: p.name, platformId: p.id });
                          setPlatformMatches([]);
                        }}
                      >
                        <span>{p.name}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">ID: {p.id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
        
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={!igdbPreview || !formData.platformId}
              >
                Link & Enrich
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

    </div>
  );
}
