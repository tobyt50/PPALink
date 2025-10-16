import {
  Star,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Briefcase,
  List,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/forms/Input";
import { FeedCard } from "../../components/ui/FeedCard";
import { useAuthStore } from "../../context/AuthContext";
import feedService from "../../services/feed.service";
import type { FeedItem, FeedCategory } from "../../types/feed";

const ALL_TABS: { id: FeedCategory; label: string; icon: React.ElementType; roles: ('CANDIDATE' | 'AGENCY' | 'ADMIN' | 'SUPER_ADMIN')[] }[] = [
  { id: "RECOMMENDATION", label: "For You", icon: Star, roles: ['CANDIDATE', 'AGENCY'] },
  { id: "LEARN_GROW", label: "Learning", icon: BookOpen, roles: ['CANDIDATE', 'AGENCY'] },
  { id: "FROM_EMPLOYERS", label: "From Employers", icon: Briefcase, roles: ['CANDIDATE'] },
  { id: "CAREER_INSIGHT", label: "Insights", icon: BrainCircuit, roles: ['CANDIDATE', 'AGENCY'] },
  { id: "SUCCESS_STORY", label: "Success", icon: TrendingUp, roles: ['CANDIDATE', 'AGENCY'] },
];

const FeedPage = () => {
  const user = useAuthStore((state) => state.user);

  const availableTabs = useMemo(() => {
    if (!user) return []; // Early return if user is null
    return ALL_TABS.filter(tab => tab.roles.includes(user.role));
  }, [user]);

  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get("category") as FeedCategory | undefined;
  
  const [activeCategory, setActiveCategory] = useState<FeedCategory | undefined>(initialCategory);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [items, setItems] = useState<FeedItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadMore = useCallback(async (isInitial = false) => {
    if (!isInitial && nextCursor === null) return; // Don't load more if we've reached the end
    if (!user) return; // Don't fetch if user isn't loaded

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) {
        params.append("category", activeCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (!isInitial && nextCursor) {
        params.append("cursor", nextCursor);
      }
      const paginatedResponse = await feedService.getMyFeed(params);
      const { data, nextCursor: newCursor } = paginatedResponse;
      
      if (isInitial) {
          setItems(data || []);
      } else {
          setItems((prev) => [...prev, ...data]);
      }
      setNextCursor(newCursor);
    } catch (error) {
      console.error("Failed to fetch feed items", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, nextCursor, user, searchQuery]);

  // Updated effect: Triggers reset and initial load only on category or search changes
  useEffect(() => {
    setItems([]);
    setNextCursor(undefined);
    loadMore(true);
  }, [activeCategory, searchQuery]);

  const buttonBaseStyle =
    "flex items-center px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md lg:rounded-lg transition-colors whitespace-nowrap lg:w-full";
  const activeButtonStyle =
    "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-50 font-semibold";
  const inactiveButtonStyle =
    "text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50";

  const emptyMessage = searchQuery 
    ? `No results for "${searchQuery}". Try adjusting your search terms.`
    : "No items to show in this category yet.";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 lg:mb-8 space-y-3 lg:space-y-0">
        {/* Mobile header */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent flex-1 pr-4">
              Discover
            </h1>
            <div className="flex space-x-2">
              <Link to="/feed/create">
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> New
                </Button>
              </Link>
              <Link to="/feed/manage">
                <Button size="sm" variant="outline" className="flex items-center whitespace-nowrap">
                  <List className="mr-2 h-4 w-4 flex-shrink-0" /> My Posts
                </Button>
              </Link>
            </div>
          </div>
          <Input
            ref={searchInputRef}
            placeholder="Search your feed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Discover
          </h1>
          <div className="flex items-center gap-4">
            <Input
              ref={searchInputRef}
              placeholder="Search your feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Link to="/feed/create">
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> New
              </Button>
            </Link>
            <Link to="/feed/manage">
              <Button size="sm" variant="outline" className="flex items-center whitespace-nowrap">
                <List className="mr-2 h-4 w-4 flex-shrink-0" /> My Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="lg:col-span-1 lg:sticky top-24 space-y-2">
          <div className="flex flex-row overflow-x-auto gap-2 lg:flex-col lg:gap-0 lg:space-y-2 px-3 lg:px-0 pb-3 lg:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(undefined)}
              className={`${buttonBaseStyle} ${
                !activeCategory ? activeButtonStyle : inactiveButtonStyle
              }`}
            >
              <List className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 flex-shrink-0" /> All
            </button>
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`${buttonBaseStyle} ${
                  activeCategory === tab.id
                    ? activeButtonStyle
                    : inactiveButtonStyle
                }`}
              >
                <tab.icon className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 flex-shrink-0" /> {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="lg:col-span-3">
          {isLoading && items.length === 0 ? (
            <div className="flex justify-center items-center h-[calc(100vh-200px)] lg:h-[calc(100vh-160px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : items.length === 0 && nextCursor === null ? (
            <div className="text-center py-20 rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-gray-100 dark:ring-white/10">
              <p className="text-gray-500 dark:text-zinc-400">
                {emptyMessage}
              </p>
            </div>
          ) : (
            <Virtuoso
              style={{ height: "calc(100vh - 200px)" }}
              data={items}
              endReached={() => loadMore()}
              itemContent={(_index, item) => (
                <div className="pb-6">
                  <FeedCard item={item} />
                </div>
              )}
              components={{
                Footer: () =>
                  nextCursor != null ? (
                    <div className="p-4 flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-zinc-400">
                      You've reached the end.
                    </div>
                  ),
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default FeedPage;