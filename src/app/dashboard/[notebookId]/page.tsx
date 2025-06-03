import { connectToDatabase } from "@/lib/mongodb";
import { Notebook } from "@/models/Notebook";
import NotebookEditor from "@/components/NotebookEditor";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { notFound } from "next/navigation";

export default async function NotebookPage({
  params,
}: {
  params: { notebookId: string };
}) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) return notFound();

  if (!/^[0-9a-fA-F]{24}$/.test(params.notebookId)) return notFound();

  const notebook = await Notebook.findOne({
    _id: params.notebookId,
    userId: session.user?.email,
  });

  if (!notebook) return notFound();

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">{notebook.title}</h1>
      <NotebookEditor
        content={notebook.content}
        notebookId={notebook._id.toString()}
      />
    </div>
  );
}
