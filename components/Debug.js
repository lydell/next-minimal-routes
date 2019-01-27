import React from "react";

export default function Debug(props) {
  return (
    <pre>
      {JSON.stringify(
        props,
        (key, value) => (typeof value === "function" ? "<function>" : value),
        2
      )}
    </pre>
  );
}
