import { HostScreen } from "@/components/host/host-screen";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function Host({ params }: Props) {
  const { code } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <HostScreen code={code} />
    </div>
  );
}