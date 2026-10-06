"use client";

import { useState, useTransition, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DISCOVER_DEPARTMENTS, DISCOVER_YEARS } from "@/lib/discover";
import {
  Search,
  X,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface DiscoverFiltersProps {
  initialQuery?: string;
  initialDepartment?: string;
  initialYear?: string;
  initialSkill?: string;
  availableSkills: { id: string; name: string }[];
}

export function DiscoverFilters({
  initialQuery = "",
  initialDepartment = "",
  initialYear = "",
  initialSkill = "",
  availableSkills,
}: DiscoverFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [department, setDepartment] = useState(initialDepartment);
  const [year, setYear] = useState(initialYear);
  const [skill, setSkill] = useState(initialSkill);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const searchInputId = useId();
  const deptSelectId = useId();
  const yearSelectId = useId();
  const skillSelectId = useId();

  // Count active filters
  const activeFiltersCount = [
    query.trim() ? 1 : 0,
    department && department !== "all" ? 1 : 0,
    year && year !== "all" ? 1 : 0,
    skill && skill !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const applyFilters = (newValues: {
    q?: string;
    department?: string;
    year?: string;
    skill?: string;
  }) => {
    const nextQ = newValues.q !== undefined ? newValues.q : query;
    const nextDept =
      newValues.department !== undefined ? newValues.department : department;
    const nextYear = newValues.year !== undefined ? newValues.year : year;
    const nextSkill =
      newValues.skill !== undefined ? newValues.skill : skill;

    const params = new URLSearchParams();

    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextDept && nextDept !== "all") params.set("department", nextDept);
    if (nextYear && nextYear !== "all") params.set("year", nextYear);
    if (nextSkill && nextSkill !== "all") params.set("skill", nextSkill);

    // Reset to page 1 on filter changes
    params.set("page", "1");

    startTransition(() => {
      const queryString = params.toString();
      router.push(`/discover${queryString ? `?${queryString}` : ""}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: query });
  };

  const handleClearAll = () => {
    setQuery("");
    setDepartment("");
    setYear("");
    setSkill("");
    startTransition(() => {
      router.push("/discover");
    });
  };

  return (
    <div className="rounded-2xl border bg-card p-4 md:p-6 shadow-sm space-y-4">
      {/* Primary Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor={searchInputId} className="sr-only">
            Search by name, skill, or interest
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id={searchInputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name, skill (e.g. Python), or interest (e.g. AI)..."
            className="pl-9 pr-9 h-11 text-sm bg-background"
            disabled={isPending}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                applyFilters({ q: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
              title="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={cn(buttonVariants({ size: "default" }), "h-11 px-5 gap-2")}
        >
          {isPending ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </button>

        {/* Mobile filter toggle */}
        <button
          type="button"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 px-3.5 md:hidden gap-1.5"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </form>

      {/* Filter Dropdowns Grid */}
      <div
        className={cn(
          "grid gap-3 pt-1 transition-all",
          "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4",
          showMobileFilters ? "block" : "hidden md:grid"
        )}
      >
        {/* Department Filter */}
        <div className="space-y-1.5">
          <label htmlFor={deptSelectId} className="text-xs font-semibold text-muted-foreground">
            Department
          </label>
          <select
            id={deptSelectId}
            value={department}
            onChange={(e) => {
              const val = e.target.value;
              setDepartment(val);
              applyFilters({ department: val });
            }}
            disabled={isPending}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Departments</option>
            {DISCOVER_DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year Filter */}
        <div className="space-y-1.5">
          <label htmlFor={yearSelectId} className="text-xs font-semibold text-muted-foreground">
            Academic Year
          </label>
          <select
            id={yearSelectId}
            value={year}
            onChange={(e) => {
              const val = e.target.value;
              setYear(val);
              applyFilters({ year: val });
            }}
            disabled={isPending}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Years</option>
            {DISCOVER_YEARS.map((yr) => (
              <option key={yr.value} value={yr.value}>
                {yr.label}
              </option>
            ))}
          </select>
        </div>

        {/* Skill Filter */}
        <div className="space-y-1.5">
          <label htmlFor={skillSelectId} className="text-xs font-semibold text-muted-foreground">
            Skill
          </label>
          <select
            id={skillSelectId}
            value={skill}
            onChange={(e) => {
              const val = e.target.value;
              setSkill(val);
              applyFilters({ skill: val });
            }}
            disabled={isPending}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Skills</option>
            {availableSkills.map((sk) => (
              <option key={sk.id} value={sk.name}>
                {sk.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls / Clear All */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <span className="text-xs font-semibold text-muted-foreground invisible hidden sm:block">
            Actions
          </span>
          {activeFiltersCount > 0 ? (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isPending}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-10 text-xs text-muted-foreground hover:text-destructive gap-1.5 w-full justify-center border border-dashed border-border hover:border-destructive/40"
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Filters ({activeFiltersCount})
            </button>
          ) : (
            <div className="h-10 flex items-center justify-center text-xs text-muted-foreground/60 italic">
              Showing all students
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {activeFiltersCount > 0 && (
        <div className="pt-2 border-t flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Active filters:
          </span>

          {query.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
              Keyword: &quot;{query}&quot;
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  applyFilters({ q: "" });
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {department && department !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
              Dept: {department}
              <button
                type="button"
                onClick={() => {
                  setDepartment("");
                  applyFilters({ department: "" });
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {year && year !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
              Year: {year}
              <button
                type="button"
                onClick={() => {
                  setYear("");
                  applyFilters({ year: "" });
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {skill && skill !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
              Skill: {skill}
              <button
                type="button"
                onClick={() => {
                  setSkill("");
                  applyFilters({ skill: "" });
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto font-medium"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
