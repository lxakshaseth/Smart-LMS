import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UNIVERSAL_CATEGORIES } from "../../lib/examCategoryMap";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex items-center group max-w-7xl mx-auto my-3">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 z-10 p-2 rounded-full bg-card/90 border border-border shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        title="Scroll left"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Horizontal Chips Container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none py-1.5 px-1 scroll-smooth w-full no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {UNIVERSAL_CATEGORIES.map((cat) => {
          const catValue = cat === "All" ? "" : cat;
          const isSelected = selectedCategory === catValue || (cat === "All" && !selectedCategory);

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(catValue)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border"
              }`}
            >
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 z-10 p-2 rounded-full bg-card/90 border border-border shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        title="Scroll right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
