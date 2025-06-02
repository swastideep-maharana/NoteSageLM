import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  return (
    <h1 className="text-xl">Welcome to your Dashboard,{session.user?.name}</h1>
  );
}
