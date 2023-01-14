import React from "react";
import HeaderTest from "../components/HeaderTest";
import TestComponent from "../components/TestComponent";
const TestPage = () => {
  return (
    <div>
      <h1 className="bg-red-400">Test Page</h1>
      <TestComponent />
      <HeaderTest />
    </div>
  );
};

export default TestPage;
