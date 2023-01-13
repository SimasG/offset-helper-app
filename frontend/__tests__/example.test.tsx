import { render, screen } from "@testing-library/react";
import Home from "../pages/index";

describe("suiteOfTests", () => {
  it("renders homepage header", () => {
    render(<Home />);

    const heading = screen.getByRole("heading", {
      name: `Offset your emissions`,
    });

    expect(heading).toBeInTheDocument();
  });
});
