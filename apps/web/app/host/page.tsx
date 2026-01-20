import Image from "next/image";
import { HostEntry } from "@/components/host-entry";
import { ExpandingButtonGroup } from "@/components/expanding-button-group";
import { Navbar } from "@/components/navbar";

export default function Host() {
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
        <div className="flex flex-col w-full min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black"> 
          <section className="flex flex-col gap-4 z-10">
            <HostEntry />
          </section>
        </div>
      </div>
    );
}