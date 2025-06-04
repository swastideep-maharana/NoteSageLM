import { useDrag } from "react-dnd";
import { Document } from "@/types";
import { Card } from "./ui/card";
import { FileIcon } from "lucide-react";

interface DraggableDocumentProps {
  document: Document;
  onClick: (document: Document) => void;
}

export function DraggableDocument({
  document,
  onClick,
}: DraggableDocumentProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "document",
    item: { id: document._id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onClick(document)}
      >
        <div className="flex items-start">
          <FileIcon className="w-4 h-4 mr-2 mt-1" />
          <div>
            <h3 className="font-medium">{document.title}</h3>
            {document.summary && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {document.summary}
              </p>
            )}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {document.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
