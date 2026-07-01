import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SeatScopeApp } from "@/components/seat-scope/SeatScopeApp";

const navigation = vi.hoisted(() => ({
  pathname: "/",
  replace: vi.fn(),
  searchParams: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({
    replace: navigation.replace,
  }),
  useSearchParams: () => new URLSearchParams(navigation.searchParams),
}));

describe("SeatScopeApp", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    navigation.replace.mockReset();
    navigation.searchParams = "";
  });

  it("selects the default seat when the URL does not name a seat", () => {
    render(<SeatScopeApp />);
    const summary = screen.getByRole("region", {
      name: "Selected seat summary",
    });

    expect(
      screen.getByRole("heading", { name: "Seat Scope 3D" }),
    ).toBeInTheDocument();
    expect(within(summary).getByText("F10")).toBeInTheDocument();
    expect(navigation.replace).toHaveBeenCalledWith("/?seat=F10", {
      scroll: false,
    });
  });

  it("selects an available seat from the URL", () => {
    navigation.searchParams = "seat=B10";

    render(<SeatScopeApp />);
    const summary = screen.getByRole("region", {
      name: "Selected seat summary",
    });

    expect(within(summary).getByText("B10")).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("falls back to the default seat when the URL names an unavailable seat", () => {
    navigation.searchParams = "seat=E9";

    render(<SeatScopeApp />);
    const summary = screen.getByRole("region", {
      name: "Selected seat summary",
    });

    expect(within(summary).getByText("F10")).toBeInTheDocument();
    expect(navigation.replace).toHaveBeenCalledWith("/?seat=F10", {
      scroll: false,
    });
  });

  it("syncs a clicked available seat back to the URL", async () => {
    const user = userEvent.setup();

    render(<SeatScopeApp />);
    await user.click(screen.getByRole("button", { name: "H12" }));
    const summary = screen.getByRole("region", {
      name: "Selected seat summary",
    });

    expect(within(summary).getByText("H12")).toBeInTheDocument();
    expect(navigation.replace).toHaveBeenLastCalledWith("/?seat=H12", {
      scroll: false,
    });
  });

  it("renders the screen before the seating rows", () => {
    render(<SeatScopeApp />);

    const seatMap = screen.getByRole("grid", { name: "Seat map" });
    const rowA = screen.getByRole("row", { name: "Row A" });

    expect(
      within(seatMap).getByText("Screen", { selector: "div" }),
    ).toBeInTheDocument();
    expect(
      seatMap.compareDocumentPosition(rowA) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps unavailable seats visible but disabled", () => {
    render(<SeatScopeApp />);

    expect(screen.getByRole("button", { name: "E9 unavailable" })).toBeDisabled();
  });

  it("renders aisles as gaps instead of disabled seats", () => {
    render(<SeatScopeApp />);

    expect(
      screen.queryByRole("button", { name: /aisle/i }),
    ).not.toBeInTheDocument();
  });

  it("moves keyboard focus across aisle gaps to the next available seat", async () => {
    const user = userEvent.setup();

    render(<SeatScopeApp />);
    const seatF6 = screen.getByRole("button", { name: "F6" });

    seatF6.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("button", { name: "F7" })).toHaveFocus();
  });
});
