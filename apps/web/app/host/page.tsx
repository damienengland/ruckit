import Image from "next/image";
import { HostEntry } from "@/components/host-entry";
import SigninButton from "@/components/sign-in-btn";
import { ExpandingButtonGroup } from "@/components/expanding-button-group";

export default function Host() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Image
          src="/home-bg.png"
          alt="Background Image"
          fill
          priority
          className="object-cover"
        />
        <section className="flex flex-col gap-4 z-10">
          <HostEntry />
          <SigninButton />
          <ExpandingButtonGroup />
        </section>
      </div>
    );
}