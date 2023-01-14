import { render, screen } from "@testing-library/react";
import Home from "../../pages/index";
import TestPage from "../../pages/testPage";

describe("suiteOfTests", () => {
  it("renders header", () => {
    render(<TestPage />);

    const heading = screen.getByRole("heading", {
      name: `Test Page`,
    });

    // render(<Home />);

    // const heading = screen.getByRole("heading", {
    //   name: `Offset your emissions`,
    // });

    expect(heading).toBeInTheDocument();
  });
});
