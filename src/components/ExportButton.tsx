"use client";

import { Button } from "./ui/button";

type ExportButtonProps = {
  data: any;
  filename: string;
};

export function ExportButton({ data, filename }: ExportButtonProps) {
  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <Button onClick={handleExport}>Export</Button>;
}
