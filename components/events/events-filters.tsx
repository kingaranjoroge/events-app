"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface EventsFiltersProps {
  categories: Category[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export function EventsFilters({ categories, searchParams }: EventsFiltersProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(
    typeof searchParams.search === "string" ? searchParams.search : ""
  );

  const [location, setLocation] = useState(
    typeof searchParams.location === "string" ? searchParams.location : ""
  );

  const [date, setDate] = useState(
    typeof searchParams.date === "string" ? searchParams.date : ""
  );
  
  const [selectedCategory, setSelectedCategory] = useState(
    typeof searchParams.category === "string" ? searchParams.category : ""
  );

  const updateFilters = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (date) params.set("date", date);
    if (selectedCategory) params.set("category", selectedCategory);

    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setDate("");
    setSelectedCategory("");
    
    startTransition(() => {
      router.push("/events");
    });
  };

  const hasActiveFilters = search || location || date || selectedCategory;

  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateFilters()}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateFilters()}
              placeholder="Location"
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={updateFilters}
            disabled={isPending}
            className="flex-1 md:flex-initial"
          >
            {isPending ? "Applying..." : "Apply Filters"}
          </Button>
          
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="ml-4"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
