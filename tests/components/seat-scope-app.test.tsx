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

  it("syncs a user-selected seat back to the URL", async () => {
    const user = userEvent.setup();

    render(<SeatScopeApp />);
    await user.selectOptions(screen.getByLabelText("Selected seat"), "H12");
    const summary = screen.getByRole("region", {
      name: "Selected seat summary",
    });

    expect(within(summary).getByText("H12")).toBeInTheDocument();
    expect(navigation.replace).toHaveBeenLastCalledWith("/?seat=H12", {
      scroll: false,
    });
  });
});
