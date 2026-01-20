
import Image from "next/image";
import { Navbar } from "@/components/navbar";

export default function Home() {

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Image
        src="/home-bg.png"
        alt="Background Image"
        fill
        priority
        className="object-cover"
      />
      <Navbar />
    </div>
  );
}
