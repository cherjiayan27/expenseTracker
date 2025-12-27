import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BottomNav } from "@/components/navigation/BottomNav";
import type { CategoryImage } from "@/features/categories/domain/category.types";

// Mock the getNavMascots action
const mockGetNavMascots = vi.fn();
vi.mock("@/features/user/actions/getNavMascots", () => ({
  getNavMascots: () => mockGetNavMascots(),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockMascots: CategoryImage[] = [
  {
    name: "Rice",
    category: "Food & Drinks",
    path: "/categories/food-and-drinks/dragonRice.png",
    isDefault: true,
  },
  {
    name: "Bus",
    category: "Transport",
    path: "/categories/transport/dragonBus.png",
    isDefault: true,
  },
  {
    name: "Shopping",
    category: "Shopping",
    path: "/categories/shopping/dragonShopping.png",
    isDefault: true,
  },
  {
    name: "Bowling",
    category: "Entertainment",
    path: "/categories/entertainment/dragonBowling.png",
    isDefault: true,
  },
  {
    name: "Clinic",
    category: "Healthcare",
    path: "/categories/healthcare/dragonClinic.png",
    isDefault: true,
  },
  {
    name: "Haircut",
    category: "Self-Care",
    path: "/categories/self-care/dragonHaircut.png",
    isDefault: true,
  },
];

describe("BottomNav Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    vi.restoreAllMocks();
  });

  it("should render loading skeletons initially", () => {
    mockGetNavMascots.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockMascots), 1000))
    );

    render(<BottomNav />);

    // Should show 6 skeleton loaders
    const skeletons = screen.getAllByRole("generic").filter((el) =>
      el.className.includes("animate-pulse")
    );
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it("should render mascots after loading", async () => {
    mockGetNavMascots.mockResolvedValue(mockMascots);

    render(<BottomNav />);

    // Wait for mascots to load
    await waitFor(() => {
      expect(screen.queryByText((content, element) => {
        return element?.className.includes("animate-pulse") || false;
      })).not.toBeInTheDocument();
    });

    // Check that mascot images are rendered
    await waitFor(() => {
      const riceImage = screen.getByAltText("Rice");
      expect(riceImage).toBeInTheDocument();
      expect(riceImage).toHaveAttribute("src", "/categories/food-and-drinks/dragonRice.png");
    });

    // Check other mascots
    expect(screen.getByAltText("Bus")).toBeInTheDocument();
    expect(screen.getByAltText("Shopping")).toBeInTheDocument();
    expect(screen.getByAltText("Bowling")).toBeInTheDocument();
  });

  it("should render the add expense button", async () => {
    mockGetNavMascots.mockResolvedValue(mockMascots);

    render(<BottomNav />);

    const addButton = screen.getByLabelText("Add expense");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute("href", "/dashboard/add-expense");
  });

  it("should render navigation links for mascots", async () => {
    mockGetNavMascots.mockResolvedValue(mockMascots);

    render(<BottomNav />);

    await waitFor(() => {
      expect(screen.getByLabelText("Rice")).toBeInTheDocument();
    });

    // Check that mascots have proper aria-labels
    expect(screen.getByLabelText("Rice")).toBeInTheDocument();
    expect(screen.getByLabelText("Bus")).toBeInTheDocument();
    expect(screen.getByLabelText("Shopping")).toBeInTheDocument();
  });

  it("should handle empty mascots array", async () => {
    mockGetNavMascots.mockResolvedValue([]);

    render(<BottomNav />);

    await waitFor(() => {
      expect(screen.queryByRole("generic", { 
        hidden: false 
      })).toBeTruthy();
    });

    // Should still render the navigation bar
    expect(screen.getByLabelText("Add expense")).toBeInTheDocument();
  });

  it("should handle API errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetNavMascots.mockRejectedValue(new Error("API Error"));

    render(<BottomNav />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load nav mascots:",
        expect.any(Error)
      );
    });

    // Component should still render
    expect(screen.getByLabelText("Add expense")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("should reload mascots when categoryPreferencesUpdated event fires", async () => {
    mockGetNavMascots.mockResolvedValue(mockMascots);

    render(<BottomNav />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByAltText("Rice")).toBeInTheDocument();
    });

    // Update mock to return different mascots
    const updatedMascots: CategoryImage[] = [
      {
        name: "Coffee",
        category: "Food & Drinks",
        path: "/categories/food-and-drinks/dragonCoffee.png",
        isDefault: false,
      },
      ...mockMascots.slice(1),
    ];
    mockGetNavMascots.mockResolvedValue(updatedMascots);

    // Dispatch the custom event
    window.dispatchEvent(new CustomEvent("categoryPreferencesUpdated"));

    // Wait for re-render with new mascots
    await waitFor(() => {
      expect(screen.getByAltText("Coffee")).toBeInTheDocument();
    });

    // Should have called the API twice (initial + after event)
    expect(mockGetNavMascots).toHaveBeenCalledTimes(2);
  });

  it("should clean up event listener on unmount", async () => {
    mockGetNavMascots.mockResolvedValue(mockMascots);

    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<BottomNav />);

    await waitFor(() => {
      expect(screen.getByAltText("Rice")).toBeInTheDocument();
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "categoryPreferencesUpdated",
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it("should render correct number of mascots", async () => {
    const eightMascots = [
      ...mockMascots,
      {
        name: "Taxi",
        category: "Transport",
        path: "/categories/transport/dragonTaxi.png",
        isDefault: false,
      },
      {
        name: "Coffee",
        category: "Food & Drinks",
        path: "/categories/food-and-drinks/dragonCoffee.png",
        isDefault: false,
      },
    ];

    mockGetNavMascots.mockResolvedValue(eightMascots);

    render(<BottomNav />);

    await waitFor(() => {
      expect(screen.getByAltText("Rice")).toBeInTheDocument();
    });

    // Should render all 8 mascots
    expect(screen.getByAltText("Rice")).toBeInTheDocument();
    expect(screen.getByAltText("Bus")).toBeInTheDocument();
    expect(screen.getByAltText("Shopping")).toBeInTheDocument();
    expect(screen.getByAltText("Bowling")).toBeInTheDocument();
    expect(screen.getByAltText("Clinic")).toBeInTheDocument();
    expect(screen.getByAltText("Haircut")).toBeInTheDocument();
    expect(screen.getByAltText("Taxi")).toBeInTheDocument();
    expect(screen.getByAltText("Coffee")).toBeInTheDocument();
  });

  it("should have proper styling classes", async () => {
    mockGetNavMascots.mockResolvedValue(mockMascots);

    const { container } = render(<BottomNav />);

    await waitFor(() => {
      expect(screen.getByAltText("Rice")).toBeInTheDocument();
    });

    // Check container classes
    const navContainer = container.querySelector("nav");
    expect(navContainer).toHaveClass("bg-white/90");
    expect(navContainer).toHaveClass("backdrop-blur-md");
    expect(navContainer).toHaveClass("rounded-[2rem]");

    // Check add button classes
    const addButton = screen.getByLabelText("Add expense");
    expect(addButton).toHaveClass("bg-gray-900");
    expect(addButton).toHaveClass("text-white");
  });

  it("should be hidden on desktop (md:hidden)", () => {
    mockGetNavMascots.mockResolvedValue(mockMascots);

    const { container } = render(<BottomNav />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("md:hidden");
  });

  it("should have proper accessibility attributes", async () => {
    mockGetNavMascots.mockResolvedValue(mockMascots);

    render(<BottomNav />);

    await waitFor(() => {
      expect(screen.getByAltText("Rice")).toBeInTheDocument();
    });

    // All navigation links should have aria-labels
    const riceLink = screen.getByLabelText("Rice");
    expect(riceLink).toHaveAttribute("aria-label", "Rice");

    const addButton = screen.getByLabelText("Add expense");
    expect(addButton).toHaveAttribute("aria-label", "Add expense");
  });
});

